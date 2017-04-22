import Vec2 from "./vector2";
import Vec4 from "./vector4";
import Clonable from "./clonable";
import Size from "./size";

class Rect implements Clonable {
	constructor(
		public left:number,
		public top:number,
		public right:number,
		public bottom:number
	) {}
	static FromPointSize(lb: Vec2, s: Size) {
		return Rect.FromPoints(lb, lb.add(s.toVec2()));
	}
	static FromPoints(lb: Vec2, rt: Vec2) {
		return new Rect(
			lb.x,
			rt.y,
			rt.x,
			lb.y
		);
	}
	lb() {
		return new Vec2(this.left, this.bottom);
	}
	rt() {
		return new Vec2(this.right, this.top);
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
