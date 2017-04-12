import Bindable from "./bindable";
import GLRenderbuffer from "./gl_renderbuffer";
import GLTexture2D from "./gl_texture2d";
import {Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {Attachment} from "./gl_const";
import glc from "./gl_const";
import GLResourceFlag from "./gl_resource_flag";
import GLResource from "./gl_resource";

export default class GLFramebuffer implements Bindable {
	private readonly _rf: GLResourceFlag = new GLResourceFlag();
	private _id: WebGLFramebuffer|null = null;
	private _bBind: boolean = false;
	private readonly _attachment: (GLTexture2D | GLRenderbuffer | null)[] = [];

	constructor() {
		glres.add(this);
		for(let i=0 ; i<glc.AttachmentC.length() ; i++)
			this._attachment[i] = null;
	}
	private _applyAttachment(pos: Attachment) {
		const buff = this._attachment[pos];
		const pos_gl = glc.AttachmentC.convert(pos);
		if(buff instanceof GLRenderbuffer) {
			buff.onContextRestored();
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, pos_gl, gl.RENDERBUFFER, buff.id());
		} else if(buff instanceof GLTexture2D) {
			buff.onContextRestored();
			gl.framebufferTexture2D(gl.FRAMEBUFFER, pos_gl, gl.TEXTURE_2D, buff.id(), 0);
		}
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
	attach(pos: Attachment, buff:GLRenderbuffer|GLTexture2D): void {
		this._attachment[pos] = buff;
		this.proc(()=>{
			this._applyAttachment(pos);
		});
	}
	getAttachment(pos: Attachment): GLTexture2D|GLRenderbuffer|null {
		return this._attachment[pos];
	}
	clear(pos: Attachment): void {
		this._attachment[pos] = null;
		this.proc(()=>{
			this._applyAttachment(pos);
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
			this.proc(()=> {
				for(let i=0 ; i<glc.AttachmentC.length() ; i++) {
					this._applyAttachment(glc.AttachmentC.indexToEnum(i));
				}
			});
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
}
