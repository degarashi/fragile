import FSMachine from "./fsmachine";
import UpdGroup from "./updgroup";
import DrawGroup from "./drawgroup";
import GObject from "./gobject";
import Drawable from "./drawable";
import Updatable from "./updatable";
import {Assert} from "./utilfuncs";
import SharedPtr from "./shared_ptr";

type Upd_SP = SharedPtr<Updatable>;
type Draw_SP = SharedPtr<Drawable>;
export interface IScene extends GObject {
	updateTarget: Upd_SP;
	drawTarget: Draw_SP;
	onDraw(): void;

	asUpdateGroup(): UpdGroup;
	asDrawGroup(): DrawGroup;
}
export default class Scene<T> extends FSMachine<T> implements IScene, Drawable, Updatable {
	updateTarget: Upd_SP = new SharedPtr<Updatable>(new UpdGroup(0));
	drawTarget: Draw_SP = new SharedPtr<Drawable>(new DrawGroup());

	asUpdateGroup(): UpdGroup {
		Assert(this.updateTarget.get() instanceof UpdGroup);
		return <UpdGroup>this.updateTarget.get();
	}
	asDrawGroup(): DrawGroup {
		Assert(this.drawTarget.get() instanceof DrawGroup);
		return <DrawGroup>this.drawTarget.get();
	}
	onUpdate(dt: number): boolean {
		super.onUpdate(dt);
		(<Updatable>this.updateTarget.get()).onUpdate(dt);
		return true;
	}
	onDraw(): void {
		(<Drawable>this.drawTarget.get()).onDraw();
	}
	// ----------------- from Drawable|Updatable -----------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			if(cb)
				cb();
			this.updateTarget.discard();
			this.drawTarget.discard();
		});
	}
}
