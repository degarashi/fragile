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
}
export default Size;
