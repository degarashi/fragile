import VectorImpl from "./vectorimpl";
import Vector from "./vector";

export class Vec4Impl<T extends Vector> extends VectorImpl<T> {
	constructor(x:number, y:number = x, z:number = y, w:number = z) {
		super(4, x,y,z,w);
	}
}
export default class Vec4 extends Vec4Impl<Vec4> {
	clone() {
		return new Vec4(this.x, this.y, this.z, this.w);
	}
}
