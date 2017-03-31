import GLShader from "./gl_shader";
import {ShaderType} from "./gl_const";

class GLVShader extends GLShader {
	constructor(src: string) {
		super(ShaderType.Vertex, src);
	}
}
export default GLVShader;
