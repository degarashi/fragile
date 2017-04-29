/// <reference path="arrayfunc.ts" />
import {Assert, AssertF} from "./utilfuncs";
import {ASyncCB, GetResourceInfo, ASyncGet, MoreResource, ResourceLoadDef} from "./resource_aux";
import ResourceLoader from "./resource_loader";
import Discardable from "./discardable";
import Resource from "./resource";
import ResourceWrap from "./resource_wrap";

class ResLayer {
	resource: {[key: string]: Resource} = {};
}
export class NoSuchResource extends Error {
	constructor(public name: string) {
		super(`no such resource "${name}"`);
	}
}
export enum ResState {
	Idle,
	Loading,
	Restoreing
}
type StringMap = {[key: string]: string;};
namespace RState {
	export abstract class State {
		addAlias(self: ResStack, alias: StringMap): void {
			AssertF("invalid function call");
		}
		abstract state(): ResState;
		loadFrame(self: ResStack, res: string[], callback: ASyncCB, bSame:boolean): void {
			AssertF("invalid function call");
		}
		abstract resourceLength(self: ResStack): number;
		popFrame(self: ResStack, n: number): void {
			AssertF("invalid function call");
		}
		discard(self: ResStack): void {
			AssertF("invalid function call");
		}
	}

	export class IdleState extends State {
		addAlias(self: ResStack, alias: StringMap): void {
			const a = self._alias;
			Object.keys(alias).forEach((k)=> {
				a[k] = alias[k];
			});
		}
		state(): ResState {
			return ResState.Idle;
		}
		loadFrame(self: ResStack, res: string[], callback: ASyncCB, bSame:boolean): void {
			Assert(res instanceof Array);
			self._state = new RState.LoadingState();

			// 重複してるリソースはロード対象に入れない
			{
				const res2:string[] = [];
				for(let i=0 ; i<res.length ; i++) {
					if(!self.checkResource(res[i])) {
						res2.push(res[i]);
					}
				}
				res = res2;
			}
			let dst:ResLayer;
			if(bSame) {
				dst = self._resource.back();
			} else {
				dst = self._pushFrame();
			}

			// リソースに応じたローダーを作成
			const loaderL:ResourceLoader[] = [];
			const infoL:ResourceLoadDef[] = [];
			for(let i=0 ; i<res.length ; i++) {
				const url = self._makeFPath(res[i]);
				if(!url)
					throw new Error(`unknown resource name "${res[i]}"`);
				const info = GetResourceInfo(url);
				loaderL.push(info.makeLoader(url));
				infoL.push(info);
			}
			ASyncGet(loaderL, 2,
				{
					completed: ()=> {
						Assert(self.state() === ResState.Loading);
						self._state = new RState.IdleState();

						// 必要なリソースが足りなくて途中で終わってしまった物を再抽出して読み込み
						let later:string[] = [];
						const laterId:number[] = [];
						for(let i=0 ; i<infoL.length ; i++) {
							try {
								const r = infoL[i].makeResource(loaderL[i].result());
								dst.resource[res[i]] = r;
							} catch(e) {
								if(!(e instanceof MoreResource)) {
									throw e;
								}
								// 必要なリソースがまだ足りてなければMoreResourceが送出される
								const m = <MoreResource>e;
								later = later.concat(...m.depend);
								laterId.push(i);
							}
						}
						if(!later.empty()) {
							// 再度リソース読み込みをかける
							self.loadFrame(
								later,
								{
									completed: ()=> {
										for(let i=0 ; i<laterId.length ; i++) {
											const id = laterId[i];
											const r = infoL[id].makeResource(loaderL[id].result());
											dst.resource[res[id]] = r;
										}
										// すべてのリソース読み込み完了
										callback.completed();
									},
									error: callback.error,
									progress: callback.progress,
									taskprogress: callback.taskprogress
								},
								true
							);
						} else {
							// すべてのリソース読み込み完了
							callback.completed();
						}
					},
					error: (msg: string)=> {
						Assert(self.state() === ResState.Loading);
						self._state = new RState.IdleState();

						callback.error(msg);
					},
					progress: callback.progress,
					taskprogress: callback.taskprogress
				}
			);
		}
		resourceLength(self: ResStack): number {
			return self._resource.length;
		}
		popFrame(self: ResStack, n: number): void {
			const resA = self._resource;
			Assert(resA.length >= n);
			// 明示的な開放処理
			while(n > 0) {
				let res = <ResLayer>resA.pop();
				Object.keys(res.resource).forEach((k)=> {
					res.resource[k].discard();
				});
				--n;
			}
		}
		discard(self: ResStack): void {
			self._df.discard();
		}
	}
	export class LoadingState extends State {
		state(): ResState {
			return ResState.Loading;
		}
		resourceLength(self: ResStack): number {
			return self._resource.length - 1;
		}
	}
	export class RestoreingState extends State {
		state(): ResState {
			return ResState.Restoreing;
		}
		loadFrame(self: ResStack, res: string[], callback: ASyncCB, bSame:boolean): void {
			new IdleState().loadFrame(self, res, callback, bSame);
		}
		resourceLength(self: ResStack): number {
			return self._resource.length - 1;
		}
	}
}

import "./resource_loaddef/json";
import "./resource_loaddef/shader";
import "./resource_loaddef/image";
import "./resource_loaddef/technique";

// リソースをレイヤに分けて格納
export default class ResStack implements Resource {
	_df:			ResourceWrap<null> = new ResourceWrap<null>(null);
	_resource:		ResLayer[] = [];
	// リソース探索ベースパス
	_base:			string;
	// リソース名 -> リソースパス
	_alias:			{[key: string]: string;} = {};
	// 現在のステート
	_state:	RState.State = new RState.IdleState();

	constructor(base: string) {
		this._base = base;
		this._pushFrame();
	}
	addAlias(alias: StringMap): void {
		this._state.addAlias(this, alias);
	}
	_makeFPath(name: string): string {
		Assert(typeof this._alias[name] !== "undefined");
		return `${this._base}/${this._alias[name]}`;
	}
	_pushFrame() {
		const dst = new ResLayer();
		this._resource.push(dst);
		return dst;
	}
	state(): ResState {
		return this._state.state();
	}
	// フレーム単位でリソースロード
	/*
		\param[in] res ["AliasName", ...]
	*/
	loadFrame(res: string[], callback: ASyncCB, bSame:boolean=false) {
		this._state.loadFrame(this, res, callback, bSame);
	}
	// リソースレイヤの数
	resourceLength(): number {
		return this._state.resourceLength(this);
	}
	private _checkResourceSingle(name: string): boolean {
		try {
			this.getResource(name);
		} catch(e) {
			return false;
		}
		return true;
	}
	// あるリソースを持っているかの確認(リスト対応)
	checkResource(name: string|string[]): boolean {
		if(name instanceof Array) {
			for(let i=0 ; i<name.length ; i++) {
				if(!this._checkResourceSingle(name[i]))
					return false;
			}
			return true;
		}
		return this._checkResourceSingle(name);
	}
	getResource(name: string): any {
		const resA = this._resource;
		for(let i=resA.length-1 ; i>=0 ; --i) {
			const res = resA[i];
			const r = res.resource[name];
			if(r)
				return r;
		}
		throw new NoSuchResource(name);
	}
	// 外部で生成したリソースをレイヤーに格納
	addResource(key: string, val: Resource): void {
		// リソース名の重複は許容
		if(this.checkResource(key))
			return;
		this._resource[this._resource.length-1].resource[key] = val;
	}
	popFrame(n: number = 1): void {
		this._state.popFrame(this, n);
	}
	_forEach(n: number, cb: (r: Resource)=>void): void {
		const r = this._resource[n].resource;
		Object.keys(r).forEach((k: string)=> {
			cb(r[k]);
		});
	}
	// ------------ from Discardable ------------
	discard(): void {
		this._state.discard(this);
	}
	isDiscarded(): boolean {
		return this._df.isDiscarded();
	}
}
