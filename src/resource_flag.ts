import {Assert} from "./utilfuncs";

export default class ResourceFlag {
	private		_bDiscard: boolean = false;
	private		_bLost: boolean = true;

	// -------------- from Discardable --------------
	discard(): void {
		Assert(!this.isDiscarded());
		this._bDiscard = true;
	}
	isDiscarded(): boolean {
		return this._bDiscard;
	}
	// -------------- from GLContext --------------
	onContextLost(cb: ()=>void): void {
		Assert(!this.isDiscarded());
		if(this._bLost)
			return;
		cb();
		this._bLost = true;
	}
	onContextRestored(cb: ()=>void): void {
		Assert(!this.isDiscarded());
		if(!this._bLost)
			return;
		cb();
		this._bLost = false;
	}
	contextLost(): boolean {
		Assert(!this.isDiscarded());
		return this._bLost;
	}
}
