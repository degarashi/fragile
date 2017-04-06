import Resource from "./resource";
export default class ResourceWrap<T> implements Resource {
	private _bLost: boolean = true;
	private _bDiscard: boolean = false;
	constructor(public data: T) {}

	// ------------ from GLContext ------------
	onContextLost(): void {
		this._bLost = true;
	}
	onContextRestored(): void {
		this._bLost = false;
	}
	contextLost(): boolean {
		return this._bLost;
	}
	// ------------ from Discardable ------------
	isDiscarded(): boolean {
		return this._bDiscard;
	}
	discard(): void {
		this._bDiscard = true;
	}
}
