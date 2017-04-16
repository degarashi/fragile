import GLFramebuffer from "../gl_framebuffer";
import DObject from "../dobject";
import Drawable from "../drawable";
import {Attachment} from "../gl_const";

export default class FBSwitch extends DObject implements Drawable {
	lower: Drawable;

	constructor(public buffer: GLFramebuffer) {
		super();
	}
	onDraw(): void {
		if(this.buffer.getAttachment(Attachment.Color0)) {
			this.buffer.vp_proc(()=> {
				this.lower.onDraw();
			});
		}
	}
}
