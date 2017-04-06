import Discardable from "./discardable";
import Bindable from "./bindable";
import GLContext from "./gl_context";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {RBFormat} from "./gl_const"
import glc from "./gl_const";
import ResourceFlag from "./resource_flag";

export default class GLRenderbuffer implements Discardable, Bindable, GLContext {
	private _rf: ResourceFlag = new ResourceFlag();
	private _id: WebGLRenderbuffer|null;
	private _bBind: boolean = false;
	private _width: number = 0;
	private _height: number = 0;
	private _format: RBFormat;

	constructor() {
		if(!gl.isContextLost())
			this.onContextRestored();
	}
	width(): number {
		return this._width;
	}
	height(): number {
		return this._height;
	}
	format(): RBFormat {
		return this._format;
	}
	id() {
		return this._id;
	}

	allocate(fmt: RBFormat, w: number, h: number): void {
		[this._width, this._height, this._format] = [fmt, w, h];
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
			this.allocate(this._format, this._width, this._height);
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
}
