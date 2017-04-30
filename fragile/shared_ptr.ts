import Discardable from "./discardable";
import RefCount from "./refcount";

export default class SharedPtr<T extends Discardable> extends RefCount {
	private _target: T|undefined;

	constructor(target?: T) {
		super();
		this.set(target);
	}
	set(t?: T): void {
		if(this._target)
			this._target.discard();
		if(t)
			t.acquire();
		this._target = t;
	}
	get(): T|undefined {
		return this._target;
	}
	reset(): void {
		this.set();
	}

	// -------- from RefCount --------
	discard(): void {
		super.discard(()=>{
			if(this._target)
				this._target.discard();
			this._target = undefined;
		});
	}
}
