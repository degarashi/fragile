import {Assert} from "./utilfuncs";
import {GetResourceInfo, ASyncGet, MoreResource, ResourceLoadDef} from "./resource_aux";
import ResourceLoader from "./resource_loader";
import Resource from "./resource";

class ResLayer {
	resource: {[key: string]: Resource} = {};
}
export class NoSuchResource extends Error {}
// リソースをレイヤに分けて格納
export default class ResStack {
	private _resource: ResLayer[];
	private _base: string;
	private _alias: {[key: string]: string;};
	private _onLoading: boolean;
	private _bLost: boolean;

	constructor(base: string) {
		this._resource = [];
		this._base = base;
		this._alias = {};
		this._pushFrame();
		this._bLost = false;
	}
	addAlias(alias: {[key: string]: string;}): void {
		const a = this._alias;
		Object.keys(alias).forEach((k)=> {
			a[k] = alias[k];
		});
	}
	private _makeFPath(name: string): string {
		return `${this._base}/${this._alias[name]}`;
	}
	private _pushFrame() {
		const dst = new ResLayer();
		this._resource.push(dst);
		return dst;
	}
	// フレーム単位でリソースロード
	/*
		\param[in] res ["AliasName", ...]
	*/
	loadFrame(res: string[], cbComplete:()=>void, cbError:()=>void, bSame:boolean=false) {
		Assert(
			res instanceof Array
			&& cbComplete instanceof Function
			&& cbError instanceof Function
		);
		Assert(!this._onLoading);
		this._onLoading = true;

		// 重複してるリソースはロード対象に入れない
		{
			const res2:string[] = [];
			for(let i=0 ; i<res.length ; i++) {
				if(!this.checkResource(res[i])) {
					res2.push(res[i]);
				}
			}
			res = res2;
		}
		let dst:ResLayer;
		if(bSame) {
			dst = this._resource.back();
		} else {
			dst = this._pushFrame();
		}

		const loaderL:ResourceLoader[] = [];
		const infoL:ResourceLoadDef[] = [];
		for(let i=0 ; i<res.length ; i++) {
			const url = this._makeFPath(res[i]);
			if(!url)
				throw new Error(`unknown resource name "${res[i]}"`);
			const info = GetResourceInfo(url);
			loaderL.push(info.makeLoader(url));
			infoL.push(info);
		}
		const fb = ()=> {
			Assert(this._onLoading);
			this._onLoading = false;
			let later:string[] = [];
			let laterId:number[] = [];
			for(let i=0 ; i<infoL.length ; i++) {
				const r = infoL[i].makeResource(loaderL[i].result());
				// MoreResourceが来たらまだ読み込みが終わってない
				if(r instanceof MoreResource) {
					later = later.concat(...r.data);
					laterId.push(i);
				} else
					dst.resource[res[i]] = r;
			}
			if(!later.empty()) {
				// 再度リソース読み込みをかける
				this.loadFrame(later, ()=> {
					for(let i=0 ; i<laterId.length ; i++) {
						const id = laterId[i];
						const r = infoL[id].makeResource(loaderL[id].result());
						Assert(!(r instanceof MoreResource));
						dst.resource[res[id]] = r;
					}
					// すべてのリソース読み込み完了
					cbComplete();
				}, cbError, true);
			} else {
				// すべてのリソース読み込み完了
				cbComplete();
			}
		};
		ASyncGet(loaderL, 2,
			fb,
			()=> {
				this._onLoading = false;
				cbError();
			}
		);
	}
	// リソースレイヤの数
	resourceLength(): number {
		let diff = 0;
		if(this._onLoading)
			diff = -1;
		return this._resource.length + diff;
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
		throw new NoSuchResource(`no such resource "${name}"`);
	}
	// 外部で生成したリソースをレイヤーに格納
	addResource(key: string, val: Resource): void {
		// リソース名の重複は許容
		if(this.checkResource(key))
			return;
		this._resource[this._resource.length-1].resource[key] = val;
	}
	popFrame(n: number = 1): void {
		Assert(!this._onLoading);
		const resA = this._resource;
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
	private _forEach(n: number, cb: (r: Resource)=>void): void {
		const r = this._resource[n].resource;
		Object.keys(r).forEach((k: string)=> {
			cb(r[k]);
		});
	}
	onContextLost(): void {
		// スタック先端から順に呼ぶ
		const len = this._resource.length;
		for(let i=len-1 ; i>=0 ; --i) {
			this._forEach(i, (r: Resource)=> {
				r.onContextLost();
			});
		}
	}
	onContextRestored(): void {
		// ルートから順に呼ぶ
		const len = this._resource.length;
		for(let i=0 ; i<len ; ++i) {
			this._forEach(i, (r: Resource)=> {
				r.onContextRestored();
			});
		}
	}
}
