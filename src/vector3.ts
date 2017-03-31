import VectorImpl from "./vectorimpl";
import Vector from "./vector";

class Vec3 extends VectorImpl<Vec3> {
	constructor(x:number, y:number = x, z:number = y) {
		super(3, x,y,z);
	}
	cross(v: Vec3): Vec3 {
		const x=this.x,
			y=this.y,
			z=this.z;
		const vx = v.x,
			vy = v.y,
			vz = v.z;
		return new Vec3(
			y*vz - z*vy,
			z*vx - x*vz,
			x*vy - y*vx
		);
	}
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}
}
export default Vec3;
