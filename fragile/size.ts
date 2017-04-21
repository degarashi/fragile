import Vec4 from "./vector4";

class Size {
	constructor(public width:number, public height:number) {}
	equal(s: Size): boolean {
		return this.width === s.width &&
				this.height === s.height;
	}
	toVec4(): Vec4 {
		return new Vec4(
			this.width,
			this.height,
			1 / this.width,
			1 / this.height
		);
	}
	mul(s: number): Size {
		return new Size(
			this.width * s,
			this.height * s
		);
	}
	mulSelf(s: number): Size {
		this.width *= s;
		this.height *= s;
		return this;
	}
}
export default Size;
