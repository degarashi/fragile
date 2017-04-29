import Bindable from "./bindable";
import {Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {RBFormat} from "./gl_const"
import glc from "./gl_const";
import GLResourceBase from "./gl_resource_base";
import GLResource from "./gl_resource";
import Size from "./size";

export default class GLRenderbuffer extends GLResourceBase implements GLResource, Bindable {
	private _id: WebGLRenderbuffer|null;
	private _bBind: boolean = false;
	private _size: Size = new Size(0,0);
	private _format: RBFormat;

	constructor() {
		super();
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
	// ------------- from GLResourceBase -------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			Assert(!this._bBind, "still binding somewhere");
			if(cb)
				cb();
			this.onContextLost();
			glres.remove(this);
		});
	}
	// ------------- from Bindable -------------
	bind(): void {
		Assert(this.count() > 0, "already discarded");
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
		super.onContextLost((): void=> {
			gl.deleteRenderbuffer(this.id());
			this._id = null;
		});
	}
	onContextRestored(): void {
		super.onContextRestored((): void=> {
			this._id = gl.createRenderbuffer();
			if(this._format)
				this.allocate(this._format, this._size.width, this._size.height);
		});
	}
}
