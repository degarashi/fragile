import FSMachine from "./fsmachine";
import UpdGroup from "./updgroup";
import GObject from "./gobject";

export interface IScene extends GObject {
	updateGroup(): UpdGroup;
	drawGroup(): UpdGroup;
	onDraw(): void;
}
export default class Scene<T> extends FSMachine<T> implements IScene {
	private _update: UpdGroup = new UpdGroup(0);
	private _draw: UpdGroup = new UpdGroup(0);

	updateGroup(): UpdGroup {
		return this._update;
	}
	drawGroup(): UpdGroup {
		return this._draw;
	}
	onUpdate(dt: number): boolean {
		super.onUpdate(dt);
		this._update.onUpdate(dt);
		return true;
	}
	onDraw(): void {
		this._draw.onUpdate(0);
	}
}
