import DObject from "./dobject";
import Group from "./group";
import {SortAlg} from "./drawsort";
import {engine} from "./global";

export default class DrawGroup extends DObject {
	group: Group<DObject> = new Group<DObject>();
	private _sortAlg: SortAlg;
	private _bRefr: boolean = true;

	constructor() {
		super(null);
	}
	setSortAlgorithm(a: SortAlg): void {
		this._sortAlg = a;
		this._bRefr = true;
	}
	private _proc(): void {
		const cbAdd = (obj: DObject, g: Group<DObject>): void => {};
		let cbSort:any;
		if(this._sortAlg) {
			cbSort = (a: DObject, b: DObject): number => {
				return this._sortAlg(a.drawtag, b.drawtag);
			};
		}
		this.group.proc(cbAdd, cbSort, this._bRefr);
		this._bRefr = false;
	}
	onDraw(): void {
		this._proc();
		const g = this.group.group();
		for(let i=0 ; i<g.length ; i++) {
			const obj = g[i];
			engine.applyTag(obj.drawtag);
			obj.onDraw();
		}
		this._proc();
	}
	discard(cb?:()=>void): void {
		super.discard(()=>{
			if(cb)
				cb();
			this.group.discard();
		});
	}
}
