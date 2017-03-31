import GObject from "./gobject";
import {Assert} from "./utilfuncs";

export default class UpdGroup extends GObject {
	_group: GObject[];
	_add: GObject[] | null;
	_remove: GObject[] | null;

	constructor(p: number) {
		super(p);
		this._group = [];
		this._add = null;
		this._remove = null;
	}
	_doAdd(): boolean {
		const addL = this._add;
		if(addL) {
			addL.forEach((obj) => {
				obj.onConnected(this);
				this._group.push(obj);
			});
			this._add = null;
			return true;
		}
		return false;
	}
	_removeSingle(obj: GObject): void {
		// 線形探索
		const g = this._group;
		const len = g.length;
		for(let i=0 ; i<len ; i++) {
			if(g[i] === obj)
				g.splice(i, 1);
		}
	}
	_doRemove(): boolean {
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
	_sort(): void {
		this._group.sort((a: GObject, b: GObject): number => {
			if(a.priority > b.priority)
				return 1;
			else if(a.priority === b.priority)
				return 0;
			return -1;
		});
	}
	_doAddRemove(): void {
		if(this._doAdd() || this._doRemove()) {
			this._sort();
		}
	}
	onUpdate(dt: number): boolean {
		this._doAddRemove();
		const g = this._group;
		for(let i=0 ; i<g.length ; i++) {
			if(!g[i].onUpdate(dt))
				this.remove(g[i]);
		}
		this._doAddRemove();
		return true;
	}
	add(obj: GObject): void {
		if(!this._add)
			this._add = [];
		this._add.push(obj);
	}
	remove(obj: GObject): void {
		if(!this._remove)
			this._remove = [];
		this._remove.push(obj);
	}
}
