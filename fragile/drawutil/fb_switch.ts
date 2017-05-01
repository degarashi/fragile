import GLFramebuffer from "../gl_framebuffer";
import DObject from "../dobject";
import Drawable from "../drawable";
import {Attachment} from "../gl_const";

export default class FBSwitch extends DObject implements Drawable {
	lower: Drawable;

	constructor(public buffer: GLFramebuffer) {
		super(null);
	}
	onDraw(): boolean {
		return super.aliveCB(()=>{
			if(this.buffer.getAttachment(Attachment.Color0)) {
				let res:boolean = false;
				this.buffer.vp_proc(()=> {
					res = this.lower.onDraw();
				});
				if(!res)
					this.destroy();
			}
		});
	}
}
