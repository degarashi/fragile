type CBAdd<T> = (obj: T, g: Group<T>)=>void;
type CBSort<T> = (a:T, b:T)=>number;
export default class Group<T> {
	private _group: T[] = [];
	private _add: T[] | null = null;
	private _remove: T[] | null = null;

	group() { return this._group; }
	private _doAdd(cbAdd: CBAdd<T>): boolean {
		const addL = this._add;
		if(addL) {
			addL.forEach((obj) => {
				cbAdd(obj, this);
				this._group.push(obj);
			});
			this._add = null;
			return true;
		}
		return false;
	}
	private _removeSingle(obj: T): void {
		// 線形探索
		const g = this._group;
		const len = g.length;
		for(let i=0 ; i<len ; i++) {
			if(g[i] === obj)
				g.splice(i, 1);
		}
	}
	private _doRemove(): boolean {
		const remL = this._remove;
		if(remL) {
			const len = remL.length;
			for(let i=0 ; i<len ; i++)
				this._removeSingle(remL[i]);
			this._remove = null;
			return true;
		}
		return false;
	}
	private _sort(cbSort: CBSort<T>): void {
		this._group.sort(cbSort);
	}
	doAddRemove(cbAdd: CBAdd<T>, cbSort: CBSort<T>): void {
		if(this._doAdd(cbAdd) || this._doRemove()) {
			this._sort(cbSort);
		}
	}
	add(obj: any): void {
		if(!this._add)
			this._add = [];
		this._add.push(obj);
	}
	remove(obj: T): void {
		if(!this._remove)
			this._remove = [];
		this._remove.push(obj);
	}
}
