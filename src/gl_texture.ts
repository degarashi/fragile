import Discardable from "./discardable";
import Bindable from "./bindable";
import GLContext from "./gl_context";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {default as glc, UVWrap, InterFormat, TexDataFormat} from "./gl_const";
import Rect from "./rect";
import TypedArray from "./typedarray";
import ResourceFlag from "./resource_flag";

abstract class GLTexture implements Bindable, Discardable, GLContext {
	private _rf: ResourceFlag = new ResourceFlag();
	private _id: WebGLTexture|null = null;
	private _bind: number = 0;
	private _width: number = 0;
	private _height: number = 0;

	abstract typeId(): number;
	abstract typeQueryId(): number;
	private _typeId(): number {
		return glc.TextureC.convert(this.typeId());
	}
	private _typeQueryId(): number {
		return glc.TextureQueryC.convert(this.typeQueryId());
	}
	constructor() {
		if(!gl.isContextLost())
			this.onContextRestored();
	}

	id() {
		return this._id;
	}
	width(): number {
		return this._width;
	}
	height(): number {
		return this._height;
	}
	setLinear(bLMin: boolean, bLMag: boolean, iMip: number): void {
		// [iMip][bL]
		const flags = [
			gl.NEAREST,
			gl.LINEAR,
			gl.NEAREST_MIPMAP_NEAREST,
			gl.NEAREST_MIPMAP_LINEAR,
			gl.LINEAR_MIPMAP_NEAREST,
			gl.LINEAR_MIPMAP_LINEAR
		];
		this.proc(()=>{
			gl.texParameteri(this._typeId(), gl.TEXTURE_MIN_FILTER, flags[(iMip<<1) | Number(bLMin)]);
			gl.texParameteri(this._typeId(), gl.TEXTURE_MAG_FILTER, flags[Number(bLMag)]);
		});
	}
	setWrap(s:UVWrap, t:UVWrap=s): void {
		this.proc(()=> {
			gl.texParameteri(this._typeId(), gl.TEXTURE_WRAP_S, glc.UVWrapC.convert(s));
			gl.texParameteri(this._typeId(), gl.TEXTURE_WRAP_T, glc.UVWrapC.convert(t));
		});
	}
	setData(level:number, fmt:InterFormat, width:number, height:number,
			srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels?:TypedArray
	): void {
		this._width = width;
		this._height = height;
		this.proc(()=> {
			gl.texImage2D(
				this._typeId(),
				level,
				glc.InterFormatC.convert(fmt),
				width, height, 0,
				glc.InterFormatC.convert(srcFmt),
				glc.TexDataFormatC.convert(srcFmtType),
				pixels
			);
		});
	}
	setSubData(
		level:number, rect:Rect,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels:TypedArray
	): void {
		this.proc(()=> {
			gl.texSubImage2D(
				this._typeId(),
				level,
				rect.left, rect.top, rect.width(), rect.height(),
				glc.InterFormatC.convert(srcFmt),
				glc.TexDataFormatC.convert(srcFmtType),
				pixels
			);
		});
	}
	setImage(
		level:number, fmt:InterFormat,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement
	): void {
		this._width = obj.width;
		this._height = obj.height;
		this.proc(()=> {
			gl.texImage2D(
				this._typeId(),
				level,
				glc.InterFormatC.convert(fmt),
				glc.InterFormatC.convert(srcFmt),
				glc.TexDataFormatC.convert(srcFmtType),
				obj
			);
		});
	}
	setSubImage(level:number, x:number, y:number, srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement): void {
		this.proc(()=> {
			gl.texSubImage2D(
				this._typeId(),
				level, x, y,
				glc.InterFormatC.convert(srcFmt),
				glc.TexDataFormatC.convert(srcFmtType),
				obj
			);
		});
	}
	genMipmap(): void {
		this.proc(()=> {
			gl.generateMipmap(this._typeId());
		});
	}
	bind_loose(): void {
		Assert(!this.isDiscarded(), "already discarded");
		gl.bindTexture(this._typeId(), this.id());
		++this._bind;
	}
	// ----------------- from GLContext -----------------
	onContextLost(): void {
		this._rf.onContextLost((): void=> {
			gl.deleteTexture(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		this._rf.onContextRestored((): void=> {
			this._id = gl.createTexture();
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
	// ----------------- from Bindable -----------------
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(this._bind === 0, "already binded");
		gl.bindTexture(this._typeId(), this.id());
		++this._bind;
	}
	unbind(id: WebGLTexture|null = null): void {
		Assert(this._bind > 0, "not binded yet");
		gl.bindTexture(this._typeId(), id);
		--this._bind;
	}
	proc(cb: ()=>void): void {
		if(this.contextLost())
			return;
		const prev:WebGLTexture|null = gl.getParameter(this._typeQueryId());
		this.bind();
		cb();
		this.unbind(prev);
	}
	// ----------------- from Discardable -----------------
	discard(): void {
		Assert(!this._bind, "still binding somewhere");
		this.onContextLost();
		this._rf.discard();
	}
	isDiscarded(): boolean {
		return this._rf.isDiscarded();
	}
}
export default GLTexture;
