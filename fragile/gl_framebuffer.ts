import Bindable from "./bindable";
import GLRenderbuffer from "./gl_renderbuffer";
import GLTexture2D from "./gl_texture2d";
import {Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {Attachment} from "./gl_const";
import glc from "./gl_const";
import GLResourceBase from "./gl_resource_base";
import GLResource from "./gl_resource";
import Size from "./size";
import Rect from "./rect";
import Vec2 from "./vector2";

interface ISize {
	size(): Size;
}
interface VPSet {
	getPixelRect(s: Size): Rect;
}
// 割合による矩形指定
class VPRatio implements VPSet {
	constructor(public rect: Rect) {}
	getPixelRect(s: Size): Rect {
		return this.rect.mul(new Vec2(s.width, s.height));
	}
}
// ピクセルによる矩形指定
class VPPixel implements VPSet {
	constructor(public rect: Rect) {}
	getPixelRect(s: Size): Rect {
		return this.rect;
	}
}
export default class GLFramebuffer extends GLResourceBase implements Bindable {
	private _id: WebGLFramebuffer|null = null;
	private _bBind: boolean = false;
	private readonly _attachment: (GLTexture2D | GLRenderbuffer | null)[] = [];
	private _vpset: VPSet;

	constructor() {
		super();
		glres.add(this);
		for(let i=0 ; i<glc.AttachmentC.length() ; i++)
			this._attachment[i] = null;
		this.setVPByRatio(new Rect(0,1,1,0));
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
	setVPByPixel(r: Rect): void {
		this._vpset = new VPPixel(r);
	}
	setVPByRatio(r: Rect): void {
		this._vpset = new VPRatio(r);
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
	private _setViewport(r: Rect) {
		gl.viewport(r.left, r.bottom, r.width(), r.height());
	}
	private _getViewport(): Rect {
		const vpA = <Int32Array>gl.getParameter(gl.VIEWPORT);
		return new Rect(vpA[0], vpA[1]+vpA[3], vpA[0]+vpA[2], vpA[1]);
	}
	vp_proc(cb: ()=>void): void {
		this.proc(()=> {
			// 前のビューポートを保存しておく
			const prev = this._getViewport();
			{
				const r = <ISize>this.getAttachment(Attachment.Color0);
				const vp = this._vpset.getPixelRect(r.size());
				this._setViewport(vp);
				cb();
			}
			// 前のビューポートを復元
			this._setViewport(prev);
		});
	}
	// ---------------- from Binable ----------------
	bind(): void {
		Assert(this.count() > 0, "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id());
		this._bBind = true;
	}
	unbind(id: WebGLFramebuffer|null = null): void {
		Assert(this.count() > 0, "already discarded");
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
	// ---------------- from GLResourceBase ----------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			Assert(!this._bBind, "still binding somewhere");
			if(cb)
				cb();
			this.onContextLost();
			glres.remove(this);
		});
	}
	// ---------------- from GLContext ----------------
	onContextLost(): void {
		super.onContextLost((): void=> {
			Assert(!this._bBind);
			gl.deleteFramebuffer(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		super.onContextRestored((): void=> {
			Assert(!this._bBind);
			this._id = gl.createFramebuffer();
			this.proc(()=> {
				for(let i=0 ; i<glc.AttachmentC.length() ; i++) {
					this._applyAttachment(glc.AttachmentC.indexToEnum(i));
				}
			});
		});
	}
}
