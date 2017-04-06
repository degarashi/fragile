import {PaddingString, AddLineNumber, Assert} from "./utilfuncs";
import {gl} from "./global";
import {ShaderType} from "./gl_const";
import glc from "./gl_const";
import Discardable from "./discardable";
import GLContext from "./gl_context";
import ResourceFlag from "./resource_flag";

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
abstract class GLShader implements Discardable, GLContext {
	private _rf: ResourceFlag = new ResourceFlag();
	private _id: WebGLShader | null = null;
	private _source: string;

	abstract typeId(): ShaderType;
	constructor(src: string) {
		this._source = src;
		if(!gl.isContextLost())
			this.onContextRestored();
	}
	id() {
		return this._id;
	}
	// --------------- from GLContext ---------------
	onContextLost(): void {
		this._rf.onContextLost((): void=> {
			gl.deleteShader(this._id);
			this._id = null;
		});
	}
	onContextRestored(): void {
		this._rf.onContextRestored((): void=> {
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
	contextLost(): boolean {
		return this._rf.contextLost();
	}
	// --------------- from Discardable ---------------
	isDiscarded(): boolean {
		return this._rf.isDiscarded();
	}
	discard(): void {
		this.onContextLost();
		this._rf.discard();
	}
}
export default GLShader;
