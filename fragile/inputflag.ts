import Vec2 from "./vector2";
import Vec3 from "./vector3";
import {Assert} from "./utilfuncs";
import InputBuff from "./inputbuff";

// Idle: (Nothing)
// Pressed: 1
// Pressing: 2++
// Released: -1
type KeyCount = {[key: number]: number;};
type KeyBool = {[key: number]: boolean;};
export default class InputFlag {
	private _key: KeyCount = {};
	private _keyMask: KeyBool = {};
	private _mkey: KeyCount = {};
	private _mkeyMask: KeyBool = {};
	private _wheelDelta: Vec2 = new Vec2(0);
	private _pos: Vec2 = new Vec2(0);
	private _dblClick: boolean = false;
	private _positionDelta: Vec2 = new Vec2(0);

	update(ns: InputBuff): void {
		const Proc = function(m0: KeyCount, m1: KeyBool) {
			for(let k in m0) {
				if(m0[k] === -1)
					delete m0[k];
				else
					++m0[k];
			}
			for(let k in m1) {
				if(m1[k] === true) {
					if(!(m0[k] >= 1))
						m0[k] = 1;
				} else {
					m0[k] = -1;
				}
			}
		};
		// Keyboard
		Proc(this._key, ns.key);
		// Mouse
		Proc(this._mkey, ns.mkey);
		// Wheel
		this._wheelDelta = ns.wheelDelta;
		// DoubleClick
		this._dblClick = (ns.dblClick) ? true : false;
		// PositionDelta
		if(ns.pos)
			this._positionDelta = ns.pos.sub(this._pos);
		else
			this._positionDelta = new Vec2(0);
		// Pos
		if(ns.pos)
			this._pos = ns.pos.clone();
		this._keyMask = {};
		this._mkeyMask = {};
	}
	private _getMMask(code: number): boolean {
		return !Boolean(this._mkeyMask[code]);
	}
	private _getMask(code: number): boolean {
		return !Boolean(this._keyMask[code]);
	}
	hideMState(code: number): void {
		this._mkeyMask[code] = true;
	}
	hideState(code: number): void {
		this._keyMask[code] = true;
	}

	isMKeyPressed(code: number): boolean {
		return this._getMMask(code) && (this._mkey[code] === 1);
	}
	isMKeyPressing(code: number): boolean {
		return this._getMMask(code) && (this._mkey[code] >= 1);
	}
	isMKeyClicked(code: number): boolean {
		return this._getMMask(code) && (this._mkey[code] === -1);
	}
	isKeyPressed(code: number): boolean {
		return this._getMask(code) && (this._key[code] === 1);
	}
	isKeyPressing(code: number): boolean {
		return this._getMask(code) && (this._key[code] >= 1);
	}
	isKeyClicked(code: number): boolean {
		return this._getMask(code) && (this._key[code] === -1);
	}
	position(): Vec2 {
		return this._pos;
	}
	doubleClicked(): boolean {
		return this._dblClick;
	}
	wheelDelta(): Vec2 {
		return this._wheelDelta;
	}
	positionDelta(): Vec2 {
		return this._positionDelta;
	}
}
