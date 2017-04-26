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
	// 左下とサイズを指定して矩形を生成
	static FromPointSize(lb: Vec2, s: Size) {
		return Rect.FromPoints(lb, lb.add(s.toVec2()));
	}
	// 左下と右上の座標から矩形を生成
	static FromPoints(lb: Vec2, rt: Vec2) {
		return new Rect(
			lb.x,
			rt.y,
			rt.x,
			lb.y
		);
	}
	shrinkAt(s: number, pos: Vec2): Rect {
		return new Rect(
			(this.left - pos.x) * s + pos.x,
			(this.top - pos.y) * s + pos.y,
			(this.right - pos.x) * s + pos.x,
			(this.bottom - pos.y) * s + pos.y
		);
	}
	// 指定の倍率で拡縮
	shrink(s: number): Rect {
		return this.shrinkAt(s, this.center());
	}
	// 左下の座標
	lb() {
		return new Vec2(this.left, this.bottom);
	}
	// 右上の座標
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
	toSize(): Size {
		return new Size(
			this.width(),
			this.height()
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
	// 中心座標をベクトルで取得
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
