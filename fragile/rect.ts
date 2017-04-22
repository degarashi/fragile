import Vec2 from "./vector2";
import Vec4 from "./vector4";
import Clonable from "./clonable";

class Rect implements Clonable {
	constructor(
		public left:number,
		public top:number,
		public right:number,
		public bottom:number
	) {}
	lt() {
		return new Vec2(this.left, this.top);
	}
	rb() {
		return new Vec2(this.right, this.bottom);
	}
	width() {
		return this.right - this.left;
	}
	height() {
		return this.top - this.bottom;
	}
	add(ofs: Vec2): Rect {
		return new Rect(
			this.left + ofs.x,
			this.top + ofs.y,
			this.right + ofs.x,
			this.bottom + ofs.y
		);
	}
	mul(sc: Vec2): Rect {
		return new Rect(
			this.left * sc.x,
			this.top * sc.y,
			this.right * sc.x,
			this.bottom * sc.y
		);
	}
	toVec4(): Vec4 {
		return new Vec4(
			this.left,
			this.top,
			this.right,
			this.bottom
		);
	}
	center(): Vec2 {
		return new Vec2(
			(this.left+this.right)/2,
			(this.top+this.bottom)/2
		);
	}
	clone(): Rect {
		return new Rect(
			this.left,
			this.top,
			this.right,
			this.bottom
		);
	}
}
export default Rect;
