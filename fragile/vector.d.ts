import Clonable from "./clonable";
interface Vector extends Clonable {
	dim(): number;
	len_sq(): number;
	length(): number;
	value: Float32Array;
}
export default Vector;
