export default class FPSCounter {
	private _fps: number;
	private _accumFrame: number;
	private _accumTime:  number;
	private _prevTime: number;			// 前回フレーム更新した時間
	private _prevFpsTime: number;		// 前回FPSカウンタを更新した時間

	constructor(now: number = new Date().getTime()) {
		this.reset(now);
	}
	private _resetCounter(now: number): void {
		this._accumFrame = 0;
		this._accumTime = 0;
		this._prevFpsTime = now;
		this._prevTime = now;
	}
	reset(now: number): void {
		this._fps = 0;
		this._resetCounter(now);
	}
	update(): boolean {
		const now = new Date().getTime();
		let b = false;
		if(now - this._prevFpsTime >= 2000) {
			if(this._accumFrame === 0)
				this._fps = 0;
			else {
				const avg = this._accumTime / this._accumFrame;
				this._fps = Math.round(1000 / avg);
			}
			this._resetCounter(now);
			b = true;
		} else {
			++this._accumFrame;
			this._accumTime += now - this._prevTime;
			this._prevTime = now;
		}
		return b;
	}
	fps(): number {
		return this._fps;
	}
}
