import RefCount from "./refcount";

export default class BaseObject extends RefCount {
	private _bAlive: boolean = true;

	alive(): boolean {
		return this._bAlive;
	}
	destroy(): boolean {
		const ret = this._bAlive;
		this._bAlive = false;
		return ret;
	}
}
