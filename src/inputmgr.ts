import InputBuff from "./inputbuff";
import InputFlag from "./inputflag";
import Discardable from "./discardable";
import Vec2 from "./vector2";
import Vec3 from "./vector3";
import {Assert} from "./utilfuncs";

class InputMgr implements Discardable {
	private _cur: InputBuff;
	private _prev: InputBuff;
	private _flag: InputFlag;
	private _events: {[key: string]: (e:any)=>void;};
	private _bDiscard: boolean;
	constructor() {
		this._cur = new InputBuff();
		this._prev = new InputBuff();
		this._switchBuff();
		this._flag = new InputFlag();
		this._bDiscard = false;

		this._events = {
			mousedown: (e)=> {
				this._cur.mkey[e.button] = true;
			},
			mouseup: (e)=> {
				this._cur.mkey[e.button] = false;
			},
			mousemove: (e: MouseEvent)=> {
				this._cur.pos = new Vec2(e.pageX, e.pageY);
			},
			keydown: (e: KeyboardEvent)=> {
				this._cur.key[e.keyCode] = true;
			},
			keyup: (e: KeyboardEvent)=> {
				this._cur.key[e.keyCode] = false;
			},
			wheel: (e: WheelEvent)=> {
				this._cur.wheelDelta.addSelf(new Vec3(e.deltaX, e.deltaY, e.deltaZ));
			},
			dblclick: (e: MouseEvent)=> {
				this._cur.dblClick = 0x01;
			},
			touchstart: (e: TouchEvent)=> {
				e.preventDefault();
				e.stopPropagation();
				const me = e.changedTouches[0];
				const p = new Vec2(me.pageX, me.pageY);
				this._prev.pos = this._cur.pos = p;
				this._cur.mkey[0] = true;
				return false;
			},
			touchmove: (e: TouchEvent)=> {
				e.preventDefault();
				e.stopPropagation();
				const me = e.changedTouches[0];
				this._cur.pos = new Vec2(me.pageX, me.pageY);
				return false;
			},
			touchend: (e: TouchEvent)=> {
				e.preventDefault();
				e.stopPropagation();
				this._cur.mkey[0] = false;
				return false;
			},
			touchcancel: (e: TouchEvent)=> {
				e.preventDefault();
				e.stopPropagation();
				this._cur.mkey[0] = false;
				return false;
			}
		};
		this._registerEvent();
	}
	lockPointer(elem: any): void {
		const api:string[] = [
			"requestPointerLock",
			"webkitRequestPointerLock",
			"mozRequestPointerLock"
		];
		const len = api.length;
		for(let i=0 ; i<len ; i++) {
			if(elem[api[i]]) {
				elem[api[i]]();
				return;
			}
		}
		Assert(false, "pointer lock API not found");
	}
	unlockPointer(): void {
		const api:string[] = [
			"exitPointerLock",
			"webkitExitPointerLock",
			"mozExitPointerLock"
		];
		const len = api.length;
		for(let i=0 ; i<len ; i++) {
			if((<any>document)[api[i]]) {
				(<any>document)[api[i]]();
				return;
			}
		}
		Assert(false, "pointer lock API not found");
	}
	_registerEvent(): void {
		const param:any = {capture: true, passive: false};
		for(let k in this._events) {
			document.addEventListener(k, this._events[k], param);
		}
	}
	_unregisterEvent(): void {
		for(let k in this._events) {
			document.removeEventListener(k, this._events[k]);
		}
	}
	_switchBuff(): void {
		this._prev = this._cur;
		this._cur = new InputBuff();
	}
	update(): void {
		this._flag.update(this._cur);
		this._switchBuff();
	}
	isMKeyPressed(code: number): boolean {
		return this._flag.isMKeyPressed(code);
	}
	isMKeyPressing(code: number): boolean {
		return this._flag.isMKeyPressing(code);
	}
	isMKeyClicked(code: number): boolean {
		return this._flag.isMKeyClicked(code);
	}
	isKeyPressed(code: number): boolean {
		return this._flag.isKeyPressed(code);
	}
	isKeyPressing(code: number): boolean {
		return this._flag.isKeyPressing(code);
	}
	isKeyClicked(code: number): boolean {
		return this._flag.isKeyClicked(code);
	}
	positionDelta(): Vec2 {
		return this._flag.positionDelta();
	}
	position(): Vec2 {
		return this._flag.position();
	}
	doubleClicked(): boolean {
		return this._flag.doubleClicked();
	}
	wheelDelta(): Vec2 {
		return this._flag.wheelDelta();
	}
	// ---------------- from Discardable ----------------
	isDiscarded(): boolean {
		return this._bDiscard;
	}
	discard(): void {
		this._unregisterEvent();
	}
}
export default InputMgr;
