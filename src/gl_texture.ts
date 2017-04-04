import Discardable from "./discardable";
import Bindable from "./bindable";
import {Assert} from "./utilfuncs";
import {gl} from "./global";
import {default as glc, UVWrap, InterFormat, TexDataFormat} from "./gl_const";
import Rect from "./rect";

export default class GLTexture implements Bindable, Discardable {
	private _id: WebGLTexture|null = null;
	private _bind: number = 0;
	private _width: number = 0;
	private _height: number = 0;

	private _typeId(): number {
		return glc.TextureC.convert((<any>this).typeId());
	}

	constructor() {
		Assert((<any>this).typeId() !== undefined);
		this._id = gl.createTexture();
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
		this.bind();
		gl.texParameteri(this._typeId(), gl.TEXTURE_MIN_FILTER, flags[(iMip<<1) | Number(bLMin)]);
		gl.texParameteri(this._typeId(), gl.TEXTURE_MAG_FILTER, flags[Number(bLMag)]);
		this.unbind();
	}
	setWrap(s:UVWrap, t:UVWrap=s): void {
		this.bind();
		gl.texParameteri(this._typeId(), gl.TEXTURE_WRAP_S, glc.UVWrapC.convert(s));
		gl.texParameteri(this._typeId(), gl.TEXTURE_WRAP_T, glc.UVWrapC.convert(t));
		this.unbind();
	}
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(this._bind === 0, "already binded");
		gl.bindTexture(this._typeId(), this.id());
		++this._bind;
	}
	bind_loose(): void {
		Assert(!this.isDiscarded(), "already discarded");
		gl.bindTexture(this._typeId(), this.id());
		++this._bind;
	}
	unbind(): void {
		Assert(this._bind > 0, "not binded yet");
		gl.bindTexture(this._typeId(), null);
		--this._bind;
	}
	setData(level:number, fmt:InterFormat, width:number, height:number,
			srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels:any
	): void {
		this.bind();
		gl.texImage2D(
			this._typeId(),
			level,
			glc.InterFormatC.convert(fmt),
			width, height, 0,
			glc.InterFormatC.convert(srcFmt),
			glc.TexDataFormatC.convert(srcFmtType),
			pixels
		);
		this.unbind();
		this._width = width;
		this._height = height;
	}
	setSubData(
		level:number, rect:Rect,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels:any
	): void {
		this.bind();
		gl.texSubImage2D(
			this._typeId(),
			level,
			rect.left, rect.top, rect.width(), rect.height(),
			glc.InterFormatC.convert(srcFmt),
			glc.TexDataFormatC.convert(srcFmtType),
			pixels
		);
		this.unbind();
	}
	setImage(
		level:number, fmt:InterFormat,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement
	): void {
		this.bind();
		gl.texImage2D(
			this._typeId(),
			level,
			glc.InterFormatC.convert(fmt),
			glc.InterFormatC.convert(srcFmt),
			glc.TexDataFormatC.convert(srcFmtType),
			obj
		);
		this.unbind();
		this._width = obj.width;
		this._height = obj.height;
	}
	setSubImage(level:number, x:number, y:number, srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement): void {
		this.bind();
		gl.texSubImage2D(
			this._typeId(),
			level, x, y,
			glc.InterFormatC.convert(srcFmt),
			glc.TexDataFormatC.convert(srcFmtType),
			obj
		);
		this.unbind();
	}
	genMipmap(): void {
		this.bind();
		gl.generateMipmap(this._typeId());
		this.unbind();
	}
	discard(): void {
		Assert(!this._bind, "still binding somewhere");
		Assert(!this.isDiscarded(), "already discarded");
		gl.deleteTexture(this._id);
		this._id = null;
		this._bind = 0;
		this._width = 0;
		this._height = 0;
	}
	isDiscarded(): boolean {
		return this._id === null;
	}
}
