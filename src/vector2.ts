import VectorImpl from "./vectorimpl";

class Vec2 extends VectorImpl<Vec2> {
	constructor(x:number, y:number = x) {
		super(2, x,y);
	}
	clone() {
		return new Vec2(this.x, this.y);
	}
}
export default Vec2;
