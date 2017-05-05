import VectorImpl from "./vectorimpl";
import Vec4 from "./vector4";
import Clonable from "./clonable";

class Size extends VectorImpl<Size> implements Clonable {
	constructor(width:number, height:number) {
		super(2, width, height);
	}
	get width(): number { return this.x; }
	get height(): number { return this.y; }
	set width(v: number) { this.x = v; }
	set height(v: number) { this.y = v; }

	set(s: Size): Size {
		this.width = s.width;
		this.height = s.height;
		return this;
	}
	toVec4(): Vec4 {
		return new Vec4(
			this.width,
			this.height,
			1 / this.width,
			1 / this.height
		);
	}
	equal(s: Size): boolean {
		return this.width === s.width &&
				this.height === s.height;
	}
	clone(): Size {
		return new Size(this.width, this.height);
	}
}
export default Size;
