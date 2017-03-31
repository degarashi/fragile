import Discardable from "./discardable";
import Bindable from "./bindable";
import GLRenderbuffer from "./gl_renderbuffer";
import GLTexture2D from "./gl_texture2d";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {Attachment} from "./gl_const";
import glc from "./gl_const";

export default class GLFramebuffer implements Discardable, Bindable {
	private _id: WebGLFramebuffer|null;
	private _bBind: boolean;

	constructor() {
		this._id = null;
		this._bBind = false;
		this._id = gl.createFramebuffer();
	}
	id() { return this._id; }
	status(): string {
		this.bind();
		const statusStr = {
			[gl.FRAMEBUFFER_COMPLETE]: "complete",
			[gl.FRAMEBUFFER_UNSUPPORTED]: "unsupported",
			[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT]: "incomplete_attachment",
			[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS]: "incomplete_dimensions",
			[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT]: "incomplete_missing_attachment"
		};
		this.unbind();
		return statusStr[gl.checkFramebufferStatus(gl.FRAMEBUFFER)];
	}
	attach(pos: Attachment, buff:GLRenderbuffer|GLTexture2D, level:number = 0): void {
		const pos_gl = glc.AttachmentC.convert(pos);
		if(buff instanceof GLRenderbuffer) {
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, buff.id());
		} else {
			Assert(buff instanceof GLTexture2D);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, pos_gl, gl.TEXTURE_2D, buff, level);
		}
	}
	clear(pos: Attachment): void {
		const pos_gl = glc.AttachmentC.convert(pos);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, null);
	}
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id());
		this._bBind = true;
	}
	unbind(): void {
		Assert(this._bBind, "not binded yet");
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this._bBind = false;
	}
	isDiscarded(): boolean {
		return this._id === null;
	}
	discard(): void {
		Assert(!this._bBind, "still binding somewhere");
		Assert(!this.isDiscarded(), "already discarded");
		gl.deleteFramebuffer(this.id());
		this._id = null;
	}
}
