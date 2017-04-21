import GLShader from "./gl_shader";
import {ShaderType} from "./gl_const";

class GLFShader extends GLShader {
	typeId() {
		return ShaderType.Fragment;
	}
}
export default GLFShader;
