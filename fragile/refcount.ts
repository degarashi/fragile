import Discardable from "./discardable";
import {Assert} from "./utilfuncs";

export default class RefCount implements Discardable {
	private _count: number = 1;

	// ------------- from Discardable -------------
	acquire(): void {
		++this._count;
	}
	discard(cb?: ()=>void): void {
		Assert(this._count > 0, "already discarded");
		if(this._count === 1) {
			if(cb)
				cb();
		}
		--this._count;
	}
	count(): number {
		return this._count;
	}
}
