import Discardable from "./discardable";
import Bindable from "./bindable";
import {Assert, VectorToArray} from "./utilfuncs";
import {gl} from "./global";
import {DrawType, GLTypeInfoItem, default as glc} from "./gl_const";
import Vector from "./vector";

abstract class GLBuffer implements Discardable, Bindable {
	private _id: WebGLBuffer|null;
	private _bBind: boolean;
	private _usage: DrawType;
	private _typeinfo: GLTypeInfoItem;
	// 頂点の個数
	private _length: number;
	// 要素何個分で頂点一つ分か
	private _dim: number;

	public abstract typeId(): number;

	constructor() {
		this._id = gl.createBuffer();
	}
	id() { return this._id; }
	usage() { return this._usage; }
	typeinfo() { return this._typeinfo; }
	length() { return this._length; }
	dim() { return this._dim; }

	bind() {
		Assert(<boolean>this._id, "already discarded");
		Assert(!this._bBind, "already binded");
		gl.bindBuffer(glc.BufferTypeC.convert(this.typeId()), this.id());
		this._bBind = true;
	}
	unbind() {
		Assert(this._bBind, "not binded yet");
		gl.bindBuffer(glc.BufferTypeC.convert(this.typeId()), null);
		this._bBind = false;
	}
	setDataRaw(data: any, dim: number, usage: DrawType) {
		this._usage = usage;
		this._typeinfo = glc.Type2GLType[data.constructor.name];
		this._dim = dim;
		this._length = data.length / dim;

		this.bind();
		gl.bufferData(
			glc.BufferTypeC.convert(this.typeId()),
			data,
			glc.DrawTypeC.convert(usage)
		);
		this.unbind();
	}
	setData(data: Vector[], usage: DrawType) {
		const ar = VectorToArray(...data);
		if(ar)
			this.setDataRaw(ar, data[0].dim(), usage);
	}
	setSubData(offset_elem: number, data: any) {
		this.bind();
		gl.bufferSubData(
			glc.BufferTypeC.convert(this.typeId()),
			this._typeinfo.bytesize * offset_elem, data);
		this.unbind();
	}
	discard() {
		Assert(!this._bBind, "still binding somewhere");
		Assert(<boolean>this.id(), "already discarded");
		gl.deleteBuffer(this.id());
		this._id = null;
	}
	isDiscarded(): boolean {
		return this._id === null;
	}
}
export default GLBuffer;
