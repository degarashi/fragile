import {Assert} from "./utilfuncs";
import RefCount from "./refcount";

export default class GLResourceBase extends RefCount {
	private		_bLost: boolean = true;

	// -------------- from GLContext --------------
	onContextLost(cb: ()=>void): void {
		Assert(this.count() > 0);
		if(this._bLost)
			return;
		this._bLost = true;
		cb();
	}
	onContextRestored(cb: ()=>void): void {
		Assert(this.count() > 0);
		if(!this._bLost)
			return;
		this._bLost = false;
		cb();
	}
	contextLost(): boolean {
		Assert(this.count() > 0);
		return this._bLost;
	}
}
