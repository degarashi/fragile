import {PaddingString, AddLineNumber, Assert} from "./utilfuncs";
import {gl} from "./global";
import Discardable from "./discardable";
import {ShaderType} from "./gl_const";
import glc from "./gl_const";

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
class GLShader implements Discardable {
	_id: WebGLShader | null;

	// シェーダーを読み込んでコンパイル
	constructor(type: ShaderType, src: string) {
		const id = gl.createShader(glc.ShaderTypeC.convert(type));
		gl.shaderSource(id, src);
		gl.compileShader(id);
		if(gl.getShaderParameter(id, gl.COMPILE_STATUS)) {
			this._id = id;
		} else {
			throw new ShaderError(id);
		}
	}
	id() {
		return this._id;
	}
	isDiscarded() {
		return this._id === null;
	}
	discard() {
		Assert(<boolean>this.id(), "already discarded");
		this._id = null;
	}
}
export default GLShader;
