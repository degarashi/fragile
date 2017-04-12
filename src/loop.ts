import TM from "./tmath";

class Loop {
	private _timerId: number|null = null;
	private _targetFps: number = 60;
	private _accum: number;				// 累積フレーム数
	private _beginTime: number;			// ループ開始からの時間
	private _prevTime: number;			// 前回フレーム更新した時間

	constructor() {
		this._reset();
	}
	private _reset(now: number = new Date().getTime()): void {
		if(this._timerId) {
			clearTimeout(this._timerId);
			this._timerId = null;
		}
		this._beginTime = now;
		this._prevTime = now;
		this._accum = 0;
	}
	running(): boolean {
		return this._timerId !== null;
	}
	targetFps(): number {
		return this._targetFps;
	}
	accum(): number {
		return this._accum;
	}
	static _CalcFPSArray(fps: number) {
		const gcd = TM.GCD(1000, fps);
		const div0 = 1000 / gcd,
			div1 = fps / gcd;
		const df = Math.floor(div0 / div1);
		const tmp = [];
		for(let i=0 ; i<div1 ; i++) {
			tmp.push(df);
		}
		const dc = df * div1;
		for(let i=0 ; i<(div0-dc) ; i++)
			++tmp[i];
		return tmp;
	}
	start(targetFps: number, cb: (dt: number)=>void) {
		this.stop();
		this._targetFps = targetFps;
		this._reset();

		const fps_array = Loop._CalcFPSArray(targetFps);
		let fps_ptr = 0;
		const self = this;
		(function Tmp(){
			self._timerId = setTimeout(Tmp, fps_array[fps_ptr]);
			fps_ptr = (++fps_ptr)%fps_array.length;
			++self._accum;

			const now = new Date().getTime();
			cb((now - self._prevTime)/1000);
			self._prevTime = now;
		})();
	}
	stop() {
		this._reset();
	}
}
export default Loop;
