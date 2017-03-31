import GLBuffer from "./gl_buffer";
import {BufferType} from "./gl_const";

class GLIBuffer extends GLBuffer {
	typeId() {
		return BufferType.Index;
	}
}
export default GLIBuffer;
