import GLVBuffer from "./gl_vbuffer";
import GLIBuffer from "./gl_ibuffer";
interface Geometry {
	vbuffer: {[key: string]: GLVBuffer;};
	ibuffer?: GLIBuffer;
}
export default Geometry;
