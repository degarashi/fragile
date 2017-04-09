import FSMachine from "./fsmachine";
import UpdGroup from "./updgroup";
import DrawGroup from "./drawgroup";
import GObject from "./gobject";
import Drawable from "./drawable";
import Updatable from "./updatable";
import {Assert} from "./utilfuncs";

export interface IScene extends GObject {
	updateTarget: Updatable;
	drawTarget: Drawable;
	onDraw(): void;

	asUpdateGroup(): UpdGroup;
	asDrawGroup(): DrawGroup;
}
export default class Scene<T> extends FSMachine<T> implements IScene, Drawable, Updatable {
	updateTarget: Updatable = new UpdGroup(0);
	drawTarget: Drawable = new DrawGroup();

	asUpdateGroup(): UpdGroup {
		Assert(this.updateTarget instanceof UpdGroup);
		return <UpdGroup>this.updateTarget;
	}
	asDrawGroup(): DrawGroup {
		Assert(this.drawTarget instanceof DrawGroup);
		return <DrawGroup>this.drawTarget;
	}
	onUpdate(dt: number): boolean {
		super.onUpdate(dt);
		this.updateTarget.onUpdate(dt);
		return true;
	}
	onDraw(): void {
		this.drawTarget.onDraw();
	}
}
