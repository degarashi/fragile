import GObject from "./gobject";
import Group from "./group";
import {Assert} from "./utilfuncs";

export default class UpdGroup extends GObject {
	group: Group<GObject> = new Group<GObject>();

	constructor(p: number) {
		super(p);
	}
	private _doAddRemove(): void {
		const cbAdd = (obj: GObject, g: Group<GObject>): void => {};
		const cbSort = (a: GObject, b: GObject): number => {
			if(a.priority > b.priority)
				return 1;
			else if(a.priority === b.priority)
				return 0;
			return -1;
		};
		this.group.proc(cbAdd, cbSort);
	}
	onUpdate(dt: number): boolean {
		this._doAddRemove();
		const g = this.group.group();
		for(let i=0 ; i<g.length ; i++) {
			if(!g[i].onUpdate(dt))
				this.group.remove(g[i]);
		}
		this._doAddRemove();
		return true;
	}
	// ------------ from GObject ------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			if(cb)
				cb();
			this.group.discard();
		});
	}
}
