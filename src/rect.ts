import Vec2 from "./vector2";

class Rect {
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
		return this.bottom- this.top;
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
}
export default Rect;
