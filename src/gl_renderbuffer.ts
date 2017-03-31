import Discardable from "./discardable";
import Bindable from "./bindable";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {RBFormat} from "./gl_const"

export default class GLRenderbuffer implements Discardable, Bindable {
	private _id: WebGLRenderbuffer|null;
	private _bBind: boolean = false;
	private _width: number = 0;
	private _height: number = 0;
	private _format: RBFormat;

	constructor() {
		this._id = <WebGLRenderingContext>gl.createRenderbuffer();
	}
	width(): number { return this._width; }
	height(): number { return this._height; }
	format(): RBFormat { return this._format; }
	id() { return this._id; }

	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.id());
		this._bBind = true;
	}
	unbind(): void {
		Assert(this._bBind, "not binded yet");
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		this._bBind = false;
	}
	allocate(fmt: RBFormat, w: number, h: number): void {
		[this._width, this._height, this._format] = [fmt, w, h];
		gl.renderbufferStorage(gl.RENDERBUFFER, fmt, w, h);
	}
	discard(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "still binding somewhere");
		gl.deleteRenderbuffer(this.id());
		this._id = null;
	}
	isDiscarded(): boolean {
		return this._id === null;
	}
}
