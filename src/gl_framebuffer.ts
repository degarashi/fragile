import Discardable from "./discardable";
import Bindable from "./bindable";
import GLContext from "./gl_context";
import GLRenderbuffer from "./gl_renderbuffer";
import GLTexture2D from "./gl_texture2d";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {Attachment} from "./gl_const";
import glc from "./gl_const";
import ResourceFlag from "./resource_flag";

export default class GLFramebuffer implements Discardable, Bindable, GLContext {
	private _rf: ResourceFlag = new ResourceFlag();
	private _id: WebGLFramebuffer|null = null;
	private _bBind: boolean = false;

	constructor() {
		if(!gl.isContextLost())
			this.onContextRestored();
	}
	id() {
		return this._id;
	}
	status(): string {
		const statusStr = {
			[gl.FRAMEBUFFER_COMPLETE]: "complete",
			[gl.FRAMEBUFFER_UNSUPPORTED]: "unsupported",
			[gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT]: "incomplete_attachment",
			[gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS]: "incomplete_dimensions",
			[gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT]: "incomplete_missing_attachment"
		};
		let result: string = "";
		this.proc(()=>{
			result = statusStr[gl.checkFramebufferStatus(gl.FRAMEBUFFER)];
		});
		return result;
	}
	attach(pos: Attachment, buff:GLRenderbuffer|GLTexture2D, level:number = 0): void {
		this.proc(()=>{
			const pos_gl = glc.AttachmentC.convert(pos);
			if(buff instanceof GLRenderbuffer) {
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, buff.id());
			} else {
				Assert(buff instanceof GLTexture2D);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, pos_gl, gl.TEXTURE_2D, buff, level);
			}
		});
	}
	clear(pos: Attachment): void {
		this.proc(()=>{
			const pos_gl = glc.AttachmentC.convert(pos);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, null);
		});
	}
	// ---------------- from Binable ----------------
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id());
		this._bBind = true;
	}
	unbind(id: WebGLFramebuffer|null = null): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(this._bBind, "not binded yet");
		gl.bindFramebuffer(gl.FRAMEBUFFER, id);
		this._bBind = false;
	}
	proc(cb: ()=>void): void {
		if(this.contextLost())
			return;
		const prev:WebGLFramebuffer|null = gl.getParameter(gl.FRAMEBUFFER_BINDING);
		this.bind();
		cb();
		this.unbind(prev);
	}
	// ---------------- from Discardable ----------------
	isDiscarded(): boolean {
		return this._rf.isDiscarded();
	}
	discard(): void {
		Assert(!this._bBind, "still binding somewhere");
		this.onContextLost();
		this._rf.discard();
	}
	// ---------------- from GLContext ----------------
	onContextLost(): void {
		this._rf.onContextLost((): void=> {
			Assert(!this._bBind);
			gl.deleteFramebuffer(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		this._rf.onContextRestored((): void=> {
			Assert(!this._bBind);
			this._id = gl.createFramebuffer();
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
}
