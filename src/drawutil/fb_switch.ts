import GLFramebuffer from "../gl_framebuffer";
import DObject from "../dobject";
import DrawGroup from "../drawgroup";
import Drawable from "../drawable";
import Group from "../group";
import {gl} from "../global";

export default class FBSwitch extends DObject implements Drawable {
	lower: Drawable;

	constructor(public buffer: GLFramebuffer) {
		super();
	}
	onDraw(): void {
		this.buffer.proc(()=> {
			this.lower.onDraw();
		});
	}
}
