import GLBuffer from "./gl_buffer";
import {BufferType, BufferQuery} from "./gl_const";

class GLVBuffer extends GLBuffer {
	typeId() {
		return BufferType.Vertex;
	}
	typeQueryId() {
		return BufferQuery.Vertex;
	}
}
export default GLVBuffer;
