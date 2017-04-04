import Discardable from "./discardable";

export default class BaseObject implements Discardable {
	private _bAlive: boolean = true;

	discard(): boolean {
		const prev = this._bAlive;
		this._bAlive = false;
		return prev;
	}
	isDiscarded(): boolean {
		return !this._bAlive;
	}
	alive(): boolean {
		return this._bAlive;
	}
}
