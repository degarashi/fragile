import FSMachine from "./fsmachine";
import UpdGroup from "./updgroup";
import DrawGroup from "./drawgroup";
import GObject from "./gobject";
import Drawable from "./drawable";

export interface IScene extends GObject {
	updateGroup(): UpdGroup;
	drawGroup(): DrawGroup;
	onDraw(): void;
}
export default class Scene<T> extends FSMachine<T> implements IScene, Drawable {
	private _update: UpdGroup = new UpdGroup(0);
	private _draw: DrawGroup = new DrawGroup();

	updateGroup(): UpdGroup {
		return this._update;
	}
	drawGroup(): DrawGroup {
		return this._draw;
	}
	onUpdate(dt: number): boolean {
		super.onUpdate(dt);
		this._update.onUpdate(dt);
		return true;
	}
	onDraw(): void {
		this._draw.onDraw();
	}
}
