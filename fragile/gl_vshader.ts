import GLShader from "./gl_shader";
import {ShaderType} from "./gl_const";

class GLVShader extends GLShader {
	typeId() {
		return ShaderType.Vertex;
	}
}
export default GLVShader;
