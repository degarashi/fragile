import Drawable from "./drawable";
import DObject from "./dobject";

export default class DObjectWrap extends DObject implements Drawable {
	private readonly _draw: Drawable;

	constructor(draw: Drawable, tech: string, priority: number = 0) {
		super(tech, priority);
		draw.acquire();
		this._draw = draw;
	}
	onDraw(): void {
		this._draw.onDraw();
	}
	discard(cb?: ()=>void): void {
		super.discard(()=>{
			if(cb)
				cb();
			this._draw.discard();
		});
	}
}
