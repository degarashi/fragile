import DObject from "./dobject";
import Group from "./group";

export default class DrawGroup extends DObject {
	group: Group<DObject> = new Group<DObject>();

	doAddRemove(): void {
		const cbAdd = (obj: DObject, g: Group<DObject>): void => {};
		const cbSort = (a: DObject, b: DObject): number => {
			const d0 = a.drawtag.priority;
			const d1 = b.drawtag.priority;
			if(d0 > d1)
				return 1;
			else if(d0 === d1)
				return 0;
			return -1;
		};
		this.group.doAddRemove(cbAdd, cbSort);
	}
	onDraw(): void {
		const g = this.group.group();
		for(let i=0 ; i<g.length ; i++) {
			g[i].onDraw();
		}
	}
}
