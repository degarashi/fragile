import {Assert} from "./utilfuncs";
import UpdGroup from "./updgroup";

export default class GObject {
	private _bAlive: boolean = true;

	constructor(public priority: number=0) {}
	onUpdate(dt: number): boolean {
		return this.alive();
	}
	onDown(): void {}
	onUp(): void {}
	onConnected(g: UpdGroup): void {}

	destroy(): boolean {
		const prev = this._bAlive;
		this._bAlive = false;
		return prev;
	}
	alive(): boolean {
		return this._bAlive;
	}
}
