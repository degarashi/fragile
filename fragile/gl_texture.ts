import Bindable from "./bindable";
import GLResource from "./gl_resource";
import GLResourceBase from "./gl_resource_base";
import {BlockPlace, Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {default as glc, UVWrap, InterFormat, TexDataFormat} from "./gl_const";
import Rect from "./rect";
import TypedArray from "./typedarray";
import Size from "./size";

namespace Backup {
	export interface Applyable {
		apply(tex: GLTexture): void;
	}
	export interface Base extends Applyable {
		writeSubData(dstWidth: number, px: number, py: number, srcWidth: number, pixels: TypedArray): void;
	}
	export class Wrap implements Applyable {
		constructor(public s:number, public t: number) {}
		apply(tex: GLTexture): boolean {
			gl.texParameteri(tex._typeId(), gl.TEXTURE_WRAP_S, glc.UVWrapC.convert(this.s));
			gl.texParameteri(tex._typeId(), gl.TEXTURE_WRAP_T, glc.UVWrapC.convert(this.t));
			return true;
		}
	}
	export class Filter implements Applyable {
		constructor(public minLinear: boolean, public magLinear: boolean, public iMip: number) {}
		apply(tex: GLTexture): void {
			// [iMip][bL]
			const flags = [
				gl.NEAREST,
				gl.LINEAR,
				gl.NEAREST_MIPMAP_NEAREST,
				gl.NEAREST_MIPMAP_LINEAR,
				gl.LINEAR_MIPMAP_NEAREST,
				gl.LINEAR_MIPMAP_LINEAR
			];
			gl.texParameteri(tex._typeId(), gl.TEXTURE_MIN_FILTER, flags[(this.iMip<<1) | Number(this.minLinear)]);
			gl.texParameteri(tex._typeId(), gl.TEXTURE_MAG_FILTER, flags[Number(this.magLinear)]);
		}
	}
	export class ImageData implements Applyable {
		constructor(public fmt:InterFormat, public srcFmt:InterFormat,
					public srcFmtType:TexDataFormat, public obj: HTMLImageElement) {}
		apply(tex: GLTexture): void {
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(
				tex._typeId(),
				0,
				glc.InterFormatC.convert(this.fmt),
				glc.InterFormatC.convert(this.srcFmt),
				glc.TexDataFormatC.convert(this.srcFmtType),
				this.obj
			);
		}
	}
	export class PixelData implements Applyable {
		private _pixels: Uint8Array;
		private _dim: number;
		private _dstFmt: InterFormat;
		private _alignment: number;
		private _flip: boolean;
		constructor(size: Size, fmt: InterFormat, align:number, flip:boolean, pixels?:Uint8Array) {
			this._dstFmt = fmt;
			if(fmt === InterFormat.RGBA) {
				this._dim = 4;
			} else {
				this._dim = 1;
			}
			if(pixels)
				this._pixels = <Uint8Array>pixels;
			else
				this._pixels = new Uint8Array(size.width * size.height * this._dim);
			this._alignment = align;
			this._flip = flip;
		}
		apply(tex: GLTexture): void {
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, this._alignment);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this._flip);
			gl.texImage2D(
				tex._typeId(),
				0,
				glc.InterFormatC.convert(this._dstFmt),
				tex.truesize().width, tex.truesize().height, 0,
				glc.InterFormatC.convert(this._dstFmt),
				glc.TexDataFormatC.convert(TexDataFormat.UB),
				this._pixels
			);
		}
		writeSubData(dstWidth: number, px: number, py: number, srcWidth: number, pixels: TypedArray): void {
			BlockPlace(
				this._pixels, dstWidth,
				this._dim,
				px, py,
				pixels, srcWidth
			);
		}
	}
	export enum Index {
		Base,
		Filter,
		Wrap
	}
	export enum Flag {
		Base = 0x01,
		Filter = 0x02,
		Wrap = 0x04,
		_Num = 3,
		All = 0xff
	}
}
abstract class GLTexture extends GLResourceBase implements Bindable, GLResource {
	private _id: WebGLTexture|null = null;
	private _bind: number = 0;
	private readonly _size:Size = new Size(0,0);
	private _param: (null | Backup.Applyable)[];
	static readonly UVRect01:Rect = new Rect(0,1,1,0);

	abstract typeId(): number;
	abstract typeQueryId(): number;
	_typeId(): number {
		return glc.TextureC.convert(this.typeId());
	}
	private _typeQueryId(): number {
		return glc.TextureQueryC.convert(this.typeQueryId());
	}
	constructor() {
		super();
		this._param = [
			null,
			new Backup.Filter(false, false, 0),
			new Backup.Wrap(UVWrap.Clamp, UVWrap.Clamp),
		];
		glres.add(this);
	}
	private _applyParams(flag: number) {
		let at = 0x01;
		for(let i=0 ; i<Backup.Flag._Num ; i++) {
			if(flag & at) {
				const p = this._param[i];
				if(p)
					p.apply(this);
			}
			at <<= 1;
		}
	}

	uvrect(): Rect {
		return GLTexture.UVRect01;
	}
	id() {
		return this._id;
	}
	size(): Size {
		return this._size;
	}
	truesize(): Size {
		return this._size;
	}
	setLinear(bLMin: boolean, bLMag: boolean, iMip: number): void {
		this._param[Backup.Index.Filter] = new Backup.Filter(bLMin, bLMag, iMip);
		this.proc(()=> {
			this._applyParams(Backup.Flag.Filter);
		});
	}
	setWrap(s:UVWrap, t:UVWrap=s): void {
		this._param[Backup.Index.Wrap] = new Backup.Wrap(s, t);
		this.proc(()=> {
			this._applyParams(Backup.Flag.Wrap);
		});
	}
	setData(fmt:InterFormat, width:number, height:number,
			srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels?:Uint8Array
	): void {
		Assert(srcFmtType === TexDataFormat.UB);
		[this._size.width, this._size.height] = [width, height];
		if(typeof pixels !== "undefined")
			pixels = pixels.slice(0);
		this._param[Backup.Index.Base] = new Backup.PixelData(this.truesize(), fmt, 1, false, pixels);
		this.proc(()=> {
			this._applyParams(Backup.Flag.All);
		});
	}
	setSubData(rect:Rect,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels:TypedArray
	): void {
		Assert(srcFmtType === TexDataFormat.UB);
		const base = <Backup.Base>this._param[Backup.Index.Base];
		base.writeSubData(this.truesize().width, rect.left, rect.bottom, rect.width(), pixels);
		this.proc(()=> {
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.texSubImage2D(
				this._typeId(),
				0,
				rect.left, rect.bottom, rect.width(), rect.height(),
				glc.InterFormatC.convert(srcFmt),
				glc.TexDataFormatC.convert(srcFmtType),
				pixels
			);
		});
	}
	setImage(fmt:InterFormat,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement
	): void {
		Assert(srcFmtType === TexDataFormat.UB);
		obj = <HTMLImageElement>obj.cloneNode(true);
		[this._size.width, this._size.height] = [obj.width, obj.height];
		this._param[Backup.Index.Base] = new Backup.ImageData(fmt, srcFmt, srcFmtType, obj);
		this.proc(()=> {
			this._applyParams(Backup.Flag.All);
		});
	}
	setSubImage(x:number, y:number, srcFmt:InterFormat, srcFmtType:TexDataFormat, obj:HTMLImageElement): void {
		Assert(srcFmtType === TexDataFormat.UB);
		this.proc(()=> {
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texSubImage2D(
				this._typeId(),
				0, x, y,
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
		Assert(this.count() > 0, "already discarded");
		gl.bindTexture(this._typeId(), this.id());
		++this._bind;
	}
	// ----------------- from GLContext -----------------
	onContextLost(): void {
		super.onContextLost((): void=> {
			gl.deleteTexture(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		super.onContextRestored((): void=> {
			this._id = gl.createTexture();
			this.proc(()=> {
				this._applyParams(Backup.Flag.All);
			});
		});
	}
	// ----------------- from Bindable -----------------
	bind(): void {
		Assert(this.count() > 0, "already discarded");
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
	// ----------------- from GLResourceBase -----------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			Assert(!this._bind, "still binding somewhere");
			if(cb)
				cb();
			this.onContextLost();
			glres.remove(this);
		});
	}
}
export default GLTexture;
