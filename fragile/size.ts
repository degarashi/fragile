import Vec2 from "./vector2";
import Vec4 from "./vector4";
import Clonable from "./clonable";

class Size implements Clonable {
	constructor(public width:number, public height:number) {}
	private _calc(proc: (a:number,b:number)=>number, s: Size|number): Size {
		if(s instanceof Size) {
			return new Size(
				proc(this.width, s.width),
				proc(this.height, s.height)
			);
		}
		return new Size(
			proc(this.width, s),
			proc(this.height, s)
		);
	}
	set(s: Size): Size {
		this.width = s.width;
		this.height = s.height;
		return this;
	}
	equal(s: Size): boolean {
		return this.width === s.width &&
				this.height === s.height;
	}
	toVec2(): Vec2 {
		return new Vec2(
			this.width,
			this.height
		);
	}
	toVec4(): Vec4 {
		return new Vec4(
			this.width,
			this.height,
			1 / this.width,
			1 / this.height
		);
	}

	add(s: Size|number): Size {
		return this._calc((a,b)=>a+b, s);
	}
	addSelf(s: Size|number): Size {
		return this.set(this.add(s));
	}
	sub(s: Size|number): Size {
		return this._calc((a,b)=>a-b, s);
	}
	subSelf(s: Size|number): Size {
		return this.set(this.sub(s));
	}
	mul(s: Size|number): Size {
		return this._calc((a,b)=>a*b, s);
	}
	mulSelf(s: Size|number): Size {
		return this.set(this.mul(s));
	}
	div(s: Size|number): Size {
		return this._calc((a,b)=>a/b, s);
	}
	divSelf(s: Size|number): Size {
		return this.set(this.div(s));
	}
	clone(): Size {
		return new Size(this.width, this.height);
	}
}
export default Size;
