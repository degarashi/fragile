import Bindable from "./bindable";
import {Assert, VectorToArray} from "./utilfuncs";
import {gl, glres} from "./global";
import {DataFormat, DrawType, GLTypeInfoItem, default as glc} from "./gl_const";
import Vector from "./vector";
import TypedArray from "./typedarray";
import GLResource from "./gl_resource";
import GLResourceBase from "./gl_resource_base";

class GLBufferInfo {
	constructor(
		public usage: DrawType,
		public typeinfo: GLTypeInfoItem,
		// 頂点の個数
		public nElem: number,
		// 要素何個分で頂点一つ分か
		public dim: number,
		// バックアップ用のデータ
		public backup?: ArrayBuffer
	) {}
}
abstract class GLBuffer extends GLResourceBase implements GLResource, Bindable {
	private _id: WebGLBuffer|null = null;
	private _bBind: boolean = false;
	private _info: GLBufferInfo;

	public abstract typeId(): number;
	public abstract typeQueryId(): number;
	constructor() {
		super();
		glres.add(this);
	}

	id() {
		return this._id;
	}
	usage() {
		return this._info.usage;
	}
	typeinfo() {
		return this._info.typeinfo;
	}
	nElem() {
		return this._info.nElem;
	}
	dim() {
		return this._info.dim;
	}
	private _typeId(): number {
		return glc.BufferTypeC.convert(this.typeId());
	}
	private _typeQueryId(): number {
		return glc.BufferQueryC.convert(this.typeQueryId());
	}
	private _usage(): number {
		return glc.DrawTypeC.convert(this.usage());
	}
	allocate(fmt: DataFormat, nElem: number, dim: number, usage: DrawType, bRestore: boolean): void {
		const t = glc.GLTypeInfo[glc.DataFormatC.convert(fmt)];
		Assert(Boolean(t));
		const bytelen = nElem * dim * t.bytesize;
		this._info = new GLBufferInfo(
						usage,
						t,
						nElem,
						dim,
						bRestore ? new ArrayBuffer(bytelen) : undefined
					);
		this.proc(()=>{
			gl.bufferData(this._typeId(), bytelen, this._usage());
		});
	}
	private _setData(data: ArrayBuffer, info: GLTypeInfoItem, nElem: number, dim: number,  usage: DrawType, bRestore: boolean): void {
		let restoreData: ArrayBuffer|undefined;
		if(bRestore) {
			restoreData = data.slice(0);
		}
		this._info = new GLBufferInfo(
						usage,
						info,
						nElem,
						dim,
						restoreData
					);
		this.proc(()=>{
			gl.bufferData(this._typeId(), data, this._usage());
		});
	}
	setData(data: TypedArray, dim: number, usage: DrawType, bRestore: boolean): void {
		const t = glc.Type2GLType[data.constructor.name];
		this._setData(data.buffer, t, data.length/dim, dim, usage, bRestore);
	}
	setVectorData(data: Vector[], usage: DrawType, bRestore: boolean) {
		this.setData(VectorToArray(...data), data[0].dim(), usage, bRestore);
	}
	setSubData(offset_elem: number, data: ArrayBuffer) {
		const info = this._info;
		const ofs = info.typeinfo.bytesize * offset_elem;
		if(info.backup) {
			const dst = new Uint8Array(info.backup);
			const src = new Uint8Array(data);
			for(let i=0 ; i<data.byteLength ; i++)
				dst[ofs+i] = src[i];
		}
		this.proc(()=>{
			gl.bufferSubData(
				this._typeId(),
				ofs,
				data
			);
		});
	}
	// --------- from Bindable ---------
	bind(): void {
		Assert(this.count() > 0, "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindBuffer(this._typeId(), this.id());
		this._bBind = true;
	}
	unbind(id: WebGLBuffer|null = null): void {
		Assert(this._bBind, "not binded yet");
		gl.bindBuffer(this._typeId(), id);
		this._bBind = false;
	}
	proc(cb: ()=>void): void {
		if(this.contextLost())
			return;
		const prev:WebGLBuffer|null = gl.getParameter(this._typeQueryId());
		this.bind();
		cb();
		this.unbind(prev);
	}
	// --------- from GLResourceBase ---------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			Assert(!this._bBind, "still binding somewhere");
			if(cb)
				cb();
			this.onContextLost();
			glres.remove(this);
		});
	}
	// --------- from GLContext ---------
	onContextLost(): void {
		super.onContextLost((): void => {
			gl.deleteBuffer(this.id());
			this._id = null;
		});
	}
	onContextRestored(): void {
		super.onContextRestored((): void => {
			this._id = gl.createBuffer();
			if(this._info) {
				// 必要ならデータを復元
				const bd = this._info.backup;
				if(bd) {
					this._setData(bd, this.typeinfo(), this.nElem(), this.dim(), this.usage(), true);
				}
			}
		});
	}
}
export default GLBuffer;
