import {Assert, IsVector, IsVM, IsMatrix, VMToArray, VectorToArray} from "./utilfuncs";
import {default as glc, GLSLTypeInfoItem} from "./gl_const";
import {gl, glres} from "./global";
import GLVShader from "./gl_vshader";
import GLFShader from "./gl_fshader";
import GLVBuffer from "./gl_vbuffer";
import Bindable from "./bindable";
import Vector from "./vector";
import GLResourceFlag from "./gl_resource_flag";
import GLResource from "./gl_resource";

export class ProgramError extends Error {
	constructor(id: WebGLProgram | null) {
		super(<string>gl.getProgramInfoLog(id));
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
export default class GLProgram implements GLResource, Bindable {
	private _rf: GLResourceFlag = new GLResourceFlag();
	private _id: WebGLProgram | null = null;
	private _bBind: boolean = false;
	private _uniform: UniformInfoM;
	private _attribute: AttribInfoM;
	private _vs: GLVShader;
	private _fs: GLFShader;

	constructor(vs: GLVShader, fs: GLFShader) {
		this._vs = vs;
		this._fs = fs;
		glres.add(this);
	}
	id() {
		return this._id;
	}
	hasUniform(name: string) {
		return this._uniform[name] !== undefined;
	}
	/*!
		\param[in] value	[matrix...] or [vector...] or matrix or vector or float or int
	*/
	setUniform(name: string, value: any): void {
		let u = this._uniform[name];
		if(u) {
			Assert(!(value instanceof Array));
			const f = <Function>u.type.uniformF;
			const fa = <Function>u.type.uniformAF;
			// matrix or vector or float or int
			if(IsMatrix(value))
				fa.call(gl, u.index, false, value.value);
			else if(IsVector(value))
				fa.call(gl, u.index, value.value);
			else
				f.call(gl, u.index, value);
			return;
		}
		u = this._uniform[name + "[0]"];
		if(u) {
			Assert(value instanceof Array);
			const fa = <Function>u.type.uniformAF;
			if(IsVM(value[0])) {
				// [matrix...] or [vector...]
				const ar = <any[]>value;
				fa.call(gl, u.index, VMToArray(ar));
			} else {
				fa.call(gl, u.index, value);
			}
		}
	}
	/*!
		\param[in] data	[vector...] or GLVBuffer
	*/
	setVStream(name: string, data: GLVBuffer|Vector[]): number|undefined {
		const a = this._attribute[name];
		if(a) {
			if(data instanceof Array) {
				// [vector...]
				(<Function>a.type.vertexF)(a.index, VectorToArray(...(<Vector[]>data)));
			} else {
				const data2 = <GLVBuffer>data;
				// GLVBuffer
				data2.proc(()=> {
					gl.enableVertexAttribArray(a.index);
					const info = data2.typeinfo();
					gl.vertexAttribPointer(a.index, data2.dim(), info.id, false, info.bytesize*data2.dim(), 0);
				});
			}
			return a.index;
		}
	}
	// ------------- from Bindable -------------
	bind(): void {
		Assert(!this.isDiscarded(), "already discarded");
		Assert(!this._bBind, "already binded");
		gl.useProgram(this.id());
		this._bBind = true;
	}
	unbind(id: WebGLProgram|null = null): void {
		Assert(this._bBind, "not binding anywhere");
		gl.useProgram(id);
		this._bBind = false;
	}
	proc(cb: ()=>void): void {
		if(this.contextLost())
			return;
		const prev:WebGLProgram|null = gl.getParameter(gl.CURRENT_PROGRAM);
		this.bind();
		cb();
		this.unbind(prev);
	}
	// ------------- from Discardable -------------
	discard() {
		Assert(!this._bBind);
		this.onContextLost();
		this._rf.discard();
	}
	isDiscarded() {
		return this._rf.isDiscarded();
	}
	// ------------- from GLContext -------------
	onContextLost(): void {
		this._rf.onContextLost((): void=> {
			gl.deleteProgram(this.id());
			this._id = null;
		});
	}
	onContextRestored(): void {
		this._rf.onContextRestored((): void=> {
			if(this._vs.contextLost())
				this._vs.onContextRestored();
			if(this._fs.contextLost())
				this._fs.onContextRestored();

			const prog = gl.createProgram();
			gl.attachShader(prog, this._vs.id());
			gl.attachShader(prog, this._fs.id());
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
		});
	}
	contextLost(): boolean {
		return this._rf.contextLost();
	}
}
