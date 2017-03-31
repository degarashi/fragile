import TM from "./tmath";

class Loop {
	private _timerId: number|null;
	private _targetFps: number = 60;
	private _accum: number;				// 累積フレーム数
	private _beginTime: number;
	private _currentFps: number;
	private _accumFps: number;
	private _prevTime: number;			// 前回フレーム更新した時間
	private _prevFpsTime: number;		// 前回FPSカウンタを更新した時間
	constructor() {
		this._resetCounter();
	}
	_resetCounter() {
		this._timerId = null;
		this._currentFps = 0;
		this._accum = 0;
		this._accumFps = 0;
	}
	_resetTime(now: number) {
		this._prevTime = now;
		this._prevFpsTime = now;
		this._beginTime = now;
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
	currentFps(): number {
		return this._currentFps;
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
		this._resetTime(new Date().getTime());

		const fps_array = Loop._CalcFPSArray(targetFps);
		let fps_ptr = 0;
		const self = this;
		(function Tmp(){
			self._timerId = setTimeout(Tmp, fps_array[fps_ptr]);
			fps_ptr = (++fps_ptr)%fps_array.length;

			let now = new Date().getTime();
			if(now - self._prevFpsTime >= 1000) {
				self._currentFps = self._accumFps;
				self._accumFps = 0;
				self._prevFpsTime = now;
				// while(self._prevFpsTime <= now-1000)
				// 	self._prevFpsTime += 1000;
			}
			++self._accum;
			++self._accumFps;

			cb((now - self._prevTime)/1000);
			self._prevTime = now;
		})();
	}
	stop() {
		if(this._timerId) {
			clearTimeout(this._timerId);
			this._resetCounter();
		}
	}
}
export default Loop;
