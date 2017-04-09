import Resource from "./resource";
import {Assert} from "./utilfuncs";

export default class ResourceWrap<T> implements Resource {
	private _bDiscard: boolean = false;
	constructor(public data: T) {}

	// ------------ from Discardable ------------
	isDiscarded(): boolean {
		return this._bDiscard;
	}
	discard(): void {
		Assert(!this._bDiscard, "already discarded");
		this._bDiscard = true;
	}
}
