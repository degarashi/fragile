import Clonable from "./clonable";
interface Matrix extends Clonable {
	dim_m(): number;
	dim_n(): number;
	getAt(x: number, y: number): number;
	setAt(x: number, y: number, val: number): number;
	readonly value: Float32Array;
}
export default Matrix;
