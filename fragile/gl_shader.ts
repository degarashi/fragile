import {PaddingString, AddLineNumber, Assert} from "./utilfuncs";
import {gl, glres} from "./global";
import {ShaderType} from "./gl_const";
import glc from "./gl_const";
import GLResource from "./gl_resource";
import GLResourceBase from "./gl_resource_base";

export class ShaderError extends Error {
	constructor(id: WebGLShader|null) {
		super(
			"\n"
			+ PaddingString(32, "-")
			+ AddLineNumber(gl.getShaderSource(id), 1, 0, true, false)
			+ PaddingString(32, "-")
			+ "\n"
			+ gl.getShaderInfoLog(id)
			+ "\n"
		);
	}
	get name() {
		return "ShaderError";
	}
}
abstract class GLShader extends GLResourceBase implements GLResource {
	private _id: WebGLShader | null = null;
	private _source: string;

	abstract typeId(): ShaderType;
	constructor(src: string) {
		super();
		this._source = src;
		glres.add(this);
	}
	id() {
		return this._id;
	}
	// --------------- from GLContext ---------------
	onContextLost(): void {
		super.onContextLost((): void=> {
			gl.deleteShader(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		super.onContextRestored((): void=> {
			// シェーダーを読み込んでコンパイル
			const id = gl.createShader(glc.ShaderTypeC.convert(this.typeId()));
			gl.shaderSource(id, this._source);
			gl.compileShader(id);
			if(gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
				this._id = id;
			} else {
				throw new ShaderError(id);
			}
		});
	}
	// --------------- from GLResourceBase ---------------
	discard(cb?:()=>void): void {
		super.discard(()=>{
			if(cb)
				cb();
			this.onContextLost();
			glres.remove(this);
		});
	}
}
export default GLShader;
