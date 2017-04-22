import GLVBuffer from "./gl_vbuffer";
import GLIBuffer from "./gl_ibuffer";
import {Primitive} from "./gl_const";
interface Geometry {
	vbuffer: {[key: string]: GLVBuffer;};
	ibuffer?: GLIBuffer;
	type: Primitive;
}
export default Geometry;
