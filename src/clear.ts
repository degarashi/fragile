import GObject from "./gobject";
import Vec3 from "./vector3";
import Vec4 from "./vector4";
import {gl} from "./global";

export default class Clear extends GObject {
	constructor(
		p: number,
		public color?:Vec4,
		public depth?:number,
		public stencil?:number
	) {
		super(p);
	}
	onUpdate(dt: number): boolean {
		let flag = 0;
		if(this.color) {
			const c = this.color;
			gl.clearColor(c.x, c.y, c.z, c.w);
			flag |= gl.COLOR_BUFFER_BIT;
		}
		if(this.depth) {
			gl.clearDepth(this.depth);
			flag |= gl.DEPTH_BUFFER_BIT;
		}
		if(this.stencil) {
			gl.clearStencil(this.stencil);
			flag |= gl.STENCIL_BUFFER_BIT;
		}
		gl.clear(flag);
		return super.onUpdate(dt);
	}
}
