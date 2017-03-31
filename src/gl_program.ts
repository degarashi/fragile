import {Assert, IsVector, IsMatrix, VMToArray, VectorToArray} from "./utilfuncs";
import Discardable from "./discardable";
import {default as glc, GLSLTypeInfoItem} from "./gl_const";
import {gl} from "./global";
import GLVShader from "./gl_vshader";
import GLFShader from "./gl_fshader";
import GLVBuffer from "./gl_vbuffer";
import Bindable from "./bindable";
import Vector from "./vector";

export class ProgramError extends Error {
	constructor(id: WebGLProgram | null) {
		super(<any>gl.getProgramInfoLog(id));
	}
	get name() {
		return "ProgramError";
	}
}

class UniformInfo {
	index: WebGLUniformLocation;
	size: number;
	type: GLSLTypeInfoItem;
}
class AttribInfo {
	index: number;
	size: number;
	type: GLSLTypeInfoItem;
}
type UniformInfoM = {[key: string]: UniformInfo;};
type AttribInfoM = {[key: string]: AttribInfo;};
export default class GLProgram implements Discardable, Bindable {
	_id: WebGLProgram | null;
	_bBind: boolean;
	_uniform: UniformInfoM;
	_attribute: AttribInfoM;

	constructor(vs: GLVShader, fs: GLFShader) {
		const prog = gl.createProgram();
		gl.attachShader(prog, vs.id());
		gl.attachShader(prog, fs.id());
		gl.linkProgram(prog);
		if(gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			this._id = prog;
		} else
			throw new ProgramError(prog);
		{
			let attr:AttribInfoM = {};
			const nAtt = gl.getProgramParameter(prog, gl.ACTIVE_ATTRIBUTES);
			for(let i=0 ; i<nAtt ; i++) {
				const a = <WebGLActiveInfo>gl.getActiveAttrib(prog, i);
				const typ = glc.GLSLTypeInfo[a.type];
				attr[a.name] = {
					index: gl.getAttribLocation(prog, a.name),
					size: a.size,
					type: typ
				};
				Assert(attr[a.name].type !== undefined);
			}
			this._attribute = attr;
		}
		{
			let unif: UniformInfoM = {};
			const nUnif = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
			for(let i=0 ; i<nUnif ; i++) {
				const u = <WebGLActiveInfo>gl.getActiveUniform(prog, i);
				unif[u.name] = {
					index: <WebGLUniformLocation>gl.getUniformLocation(prog, u.name),
					size: u.size,
					type: glc.GLSLTypeInfo[u.type]
				};
				Assert(unif[u.name].type !== undefined);
			}
			this._uniform = unif;
		}
		this._bBind = false;
	}
	id() {
		return this._id;
	}
	bind() {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.useProgram(this.id());
		this._bBind = true;
	}
	unbind() {
		Assert(this._bBind, "not binding anywhere");
		gl.useProgram(null);
		this._bBind = false;
	}
	discard() {
		Assert(!this._bBind);
		Assert(!this.isDiscarded(), "already discarded");
		gl.deleteProgram(this.id());
		this._id = null;
	}
	isDiscarded() {
		return this._id === null;
	}
	hasUniform(name: string) {
		return this._uniform[name] !== undefined;
	}
	/*!
		\param[in] value	[matrix...] or [vector...] or matrix or vector or float or int
	*/
	setUniform(name: string, value: any): void {
		const u = this._uniform[name];
		if(u) {
			const f = u.type.uniformF;
			if(value instanceof Array) {
				// [matrix...] or [vector...]
				const ar = <any[]>value;
				f.call(gl, u.index, VMToArray(ar));
			} else {
				// matrix or vector or float or int
				if(IsMatrix(value))
					f.call(gl, u.index, false, value.value);
				else if(IsVector(value))
					f.call(gl, u.index, value.value);
				else
					f.call(gl, u.index, value);
			}
		}
	}
	/*!
		\param[in] data	[vector...] or GLVBuffer
	*/
	setVStream(name: string, data: GLVBuffer|Vector[]): void {
		const a = this._attribute[name];
		if(a) {
			if(data instanceof Array) {
				// [vector...]
				(<Function>a.type.vertexF)(a.index, VectorToArray(...(<Vector[]>data)));
			} else {
				const data2 = <GLVBuffer>data;
				// GLVBuffer
				data2.bind();
				gl.enableVertexAttribArray(a.index);
				const info = data2.typeinfo();
				gl.vertexAttribPointer(a.index, data2.dim(), info.id, false, info.bytesize*data2.dim(), 0);
				data2.unbind();
			}
		}
	}
}
