import Bindable from "./bindable";
import {Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {RBFormat} from "./gl_const"
import glc from "./gl_const";
import GLResourceFlag from "./gl_resource_flag";
import GLResource from "./gl_resource";
import Size from "./size";

export default class GLRenderbuffer implements GLResource, Bindable {
	private _rf: GLResourceFlag = new GLResourceFlag();
	private _id: WebGLRenderbuffer|null;
	private _bBind: boolean = false;
	private _size: Size = new Size(0,0);
	private _format: RBFormat;

	constructor() {
		glres.add(this);
	}
	size(): Size {
		return this._size;
	}
	format(): RBFormat {
		return this._format;
	}
	id() {
		return this._id;
	}

	allocate(fmt: RBFormat, w: number, h: number): void {
		[this._format, this._size.width, this._size.height] = [fmt, w, h];
		this.proc(()=> {
			gl.renderbufferStorage(gl.RENDERBUFFER, glc.RBFormatC.convert(fmt), w, h);
		});
	}
	// ------------- from Discardable -------------
	discard(): void {
		Assert(!this._bBind, "still binding somewhere");
		this.onContextLost();
		this._rf.discard();
	}
	isDiscarded(): boolean {
		return this._rf.isDiscarded();
	}
	// ------------- from Bindable -------------
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.id());
		this._bBind = true;
	}
	unbind(id: WebGLRenderbuffer|null = null): void {
		Assert(this._bBind, "not binded yet");
		gl.bindRenderbuffer(gl.RENDERBUFFER, id);
		this._bBind = false;
	}
	proc(cb: ()=>void): void {
		if(this.contextLost())
			return;
		const prev:WebGLRenderbuffer|null = gl.getParameter(gl.RENDERBUFFER_BINDING);
		this.bind();
		cb();
		this.unbind(prev);
	}
	// ------------- from GLContext -------------
	onContextLost(): void {
		this._rf.onContextLost((): void=> {
			gl.deleteRenderbuffer(this.id());
			this._id = null;
		});
	}
	onContextRestored(): void {
		this._rf.onContextRestored((): void=> {
			this._id = gl.createRenderbuffer();
			if(this._format)
				this.allocate(this._format, this._size.width, this._size.height);
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
}
