import Scene from "./scene";
import {IScene} from "./scene";
import GObject from "./gobject";
import {Assert} from "./utilfuncs";
import {OutputError} from "./output";

export enum SceneMgrState {
	Idle,
	Draw,
	Proc
}
export default class SceneMgr extends GObject {
	private _scene: IScene[] = [];
	private _nextScene: IScene|null = null;
	private _nPop: number = 0;
	private _state: SceneMgrState = SceneMgrState.Idle;
	constructor(firstScene: IScene) {
		super();

		this.push(firstScene, false);
		firstScene.onUp();
		this._proceed();
	}
	push(scene: IScene, bPop: boolean): void {
		Assert(scene instanceof Scene);
		// 描画メソッドでのシーン変更は禁止
		Assert(this._state !== SceneMgrState.Draw);
		// 一度に2つ以上のシーンを積むのは禁止
		Assert(!this._nextScene);
		// popした後に積むのも禁止
		Assert(this._nPop === 0);

		this._nextScene = scene;
		this._nPop = bPop ? 1 : 0;
	}
	pop(n:number = 1): void {
		// 描画メソッドでのシーン変更は禁止
		Assert(this._state !== SceneMgrState.Draw);
		// pushした後にpopはNG
		Assert(!this._nextScene);
		Assert(this._nPop === 0);
		this._nPop = n;
	}
	_proceed(): boolean {
		Assert(this._state === SceneMgrState.Idle);
		this._state = SceneMgrState.Proc;

		let b = false;
		while(this._nPop > 0) {
			--this._nPop;
			b = true;

			const t = <IScene>this._scene.pop();
			t.discard();
			if(this._scene.length === 0) {
				this._nPop = 0;
				break;
			}
			this.top().onDown();
		}
		const ns = this._nextScene;
		if(ns) {
			this._nextScene = null;
			this._scene.push(ns);
			ns.onUp();
			b = true;
		}

		this._state = SceneMgrState.Idle;
		return b;
	}
	top(): IScene {
		return this._scene[this._scene.length-1];
	}
	length(): number {
		return this._scene.length;
	}
	_empty(): boolean {
		return this.length() === 0;
	}
	onUpdate(dt: number): boolean {
		for(;;) {
			if(this._empty())
				return false;
			try {
				this.top().onUpdate(dt);
			} catch(e) {
				OutputError("scenemgr::onupdate()", e.message);
			}
			if(!this._proceed())
				break;
		}
		return !this._empty();
	}
	onDraw(): void {
		Assert(this._state === SceneMgrState.Idle);
		this._state = SceneMgrState.Draw;
		try {
			(<Scene<undefined>>this.top()).onDraw();
		} catch(e) {
			OutputError("scenemgr::ondraw()", e.message);
		}
		this._state = SceneMgrState.Idle;
	}
}
