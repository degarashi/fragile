import UpdGroup from "./updgroup";
import BaseObject from "./baseobject";

export default class GObject extends BaseObject {
	constructor(public priority: number=0) {
		super();
	}
	onUpdate(dt: number): boolean {
		return this.alive();
	}
	onDown(ret: any): void {}
	onUp(): void {}
	onConnected(g: UpdGroup): void {}
}
