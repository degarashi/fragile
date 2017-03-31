import GLShader from "./gl_shader";
import {ShaderType} from "./gl_const";

class GLFShader extends GLShader {
	constructor(src: string) {
		super(ShaderType.Fragment, src);
	}
}
export default GLFShader;
