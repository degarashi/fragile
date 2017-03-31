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
	move(ofs: Vec2) {
		this.left += ofs.x;
		this.right += ofs.x;
		this.top += ofs.y;
		this.bottom += ofs.y;
	}
}
export default Rect;
