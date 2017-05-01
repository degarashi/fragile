import RefCount from "./refcount";

export default class BaseObject extends RefCount {
	private _bAlive: boolean = true;

	alive(): boolean {
		return this._bAlive;
	}
	aliveCB(cb:()=>void): boolean {
		if(this.alive()) {
			cb();
			return this.alive();
		}
		return false;
	}
	destroy(): boolean {
		const ret = this._bAlive;
		this._bAlive = false;
		return ret;
	}
	discard(cb?: ()=>void): void {
		super.discard(()=> {
			if(cb)
				cb();
			if(this.alive())
				this.destroy();
		});
	}
}
