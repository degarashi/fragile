import GLBuffer from "./gl_buffer";
import {BufferType} from "./gl_const";

class GLVBuffer extends GLBuffer {
	typeId() {
		return BufferType.Vertex;
	}
}
export default GLVBuffer;
