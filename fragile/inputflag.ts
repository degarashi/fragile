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

	// ボタンが押された時刻(Date)
	private _tapBegin: number|null = null;
	// ボタンが押された時の座標(Screen)
	private _tapPos: Vec2|null = null;
	// 前回判定時の座標
	private _tapPrevPos: Vec2|null = null;
	// タップ判定の結果
	private _tapped: Vec2|null = null;
	// ドラッグ判定の結果
	private _dragging: Vec2|null = null;
	static readonly TapTime = 1000;
	static readonly TapDistance = 10;

	private _checkTapEvent(ns: InputBuff): void {
		this._dragging = null;
		this._tapped = null;

		const pos = this._pos.clone();
		const press = this.isMKeyPressing(0);
		const time = new Date().getTime();
		if(this._tapBegin === null) {
			if(press) {
				this._tapBegin = time;
				this._tapPrevPos = this._tapPos = pos;
			}
		} else {
			const diff = time - this._tapBegin;
			// タップ判定
			if(!press) {
				// 押下開始から1秒経つまでに離された
				if(diff < InputFlag.TapTime) {
					// 押下開始地点から一定の距離範囲内
					const dist = pos.distance(<Vec2>this._tapPos);
					if(dist < InputFlag.TapDistance)
						this._tapped = pos;
				}
				this._tapBegin = null;
				this._tapPos = this._tapPrevPos = null;
			} else {
				// ドラッグ判定
				// 押下開始地点から一定の距離範囲外
				const dist = pos.distance(<Vec2>this._tapPos);
				const diff = pos.sub(<Vec2>this._tapPrevPos);
				const bD = diff.len_sq() > 0;
				this._tapPrevPos = pos;
				if(dist >= InputFlag.TapDistance && bD)
					this._dragging = diff;
			}
		}
	}

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

		this._checkTapEvent(ns);
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
	tapped(): Vec2|null {
		if(this._getMMask(0))
			return this._tapped;
		return null;
	}
	dragging(): Vec2|null {
		if(this._getMMask(0))
			return this._dragging;
		return null;
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
