import GLBuffer from "./gl_buffer";
import {BufferType, BufferQuery} from "./gl_const";

class GLIBuffer extends GLBuffer {
	typeId() {
		return BufferType.Index;
	}
	typeQueryId() {
		return BufferQuery.Index;
	}
}
export default GLIBuffer;
