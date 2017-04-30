import Vector from "./vector";
import Clonable from "./clonable";
import TM from "./tmath";

class VectorImpl<T extends Vector> implements Vector {
	readonly value: Float32Array;
	constructor(n: number, ...elem: number[]) {
		this.value = new Float32Array(n);
		for(let i=0 ; i<n ; i++)
			this.value[i] = elem[i] || 0;
	}
	dim(): number {
		return this.value.length;
	}
	get x(): number { return this.value[0]; }
	set x(v) { this.value[0] = v; }
	get y(): number { return this.value[1]; }
	set y(v) { this.value[1] = v; }
	get z(): number { return this.value[2]; }
	set z(v) { this.value[2] = v; }
	get w(): number { return this.value[3]; }
	set w(v) { this.value[3] = v; }
	clone(): T {
		const ret = new VectorImpl<T>(this.dim());
		ret.set(this);
		return ret._asT();
	}
	private _asT(): T {
		const tmp:any = this;
		return <T>tmp;
	}

	saturate(vmin: number, vmax: number): T {
		const ret = this.clone();
		const n = this.dim();
		for(let i=0 ; i<n; i++) {
			const val = this.value[i];
			if(val >= vmax)
				this.value[i] = vmax;
			else if(val <= vmin)
				this.value[i] = vmin;
		}
		return ret;
	}
	equal(v: Vector): boolean {
		const n = this.dim();
		for(let i=0 ; i<n ; i++) {
			if(!TM.IsEqual(this.value[i], v.value[i]))
				return false;
		}
		return true;
	}
	lerp(v: Vector, t: number): T {
		const n = this.dim();
		const ret = this.clone();
		for(let i=0 ; i<n ; i++)
			ret.value[i] = (v.value[i]-this.value[i])*t + this.value[i];
		return ret;
	}
	private _unionDuplicate(): T {
		const ret = this.constructor(0);
		return ret;
	}
	set(v: Vector): T {
		const n = this.dim();
		for(let i=0 ; i<n ; i++)
			this.value[i] = v.value[i];
		return this._asT();
	}
	add(v: Vector): T {
		const n = this.dim();
		const ret = this.clone();
		for(let i=0 ; i<n ; i++)
			ret.value[i] = this.value[i] + v.value[i];
		return ret;
	}
	addSelf(v: Vector): T {
		return this.set(this.add(v));
	}
	sub(v: Vector): T {
		const n = this.dim();
		const ret = this.clone();
		for(let i=0 ; i<n ; i++)
			ret.value[i] = this.value[i] - v.value[i];
		return ret;
	}
	subSelf(v: Vector): T {
		return this.set(this.sub(v));
	}
	mul(s: number): T {
		const n = this.dim();
		const ret = this.clone();
		for(let i=0 ; i<n ; i++)
			ret.value[i] = this.value[i] * s;
		return ret;
	}
	mulSelf(s: number): T {
		return this.set(this.mul(s));
	}
	div(s: number): T {
		return this.mul(1/s);
	}
	divSelf(s: number): T {
		return this.set(this.div(s));
	}
	len_sq(): number {
		return this.dot(this);
	}
	length(): number {
		return Math.sqrt(this.len_sq());
	}
	normalize(): T {
		return this.div(this.length());
	}
	normalizeSelf(): T {
		return this.set(this.normalize());
	}
	dot(v: Vector): number {
		let d = 0;
		const n = this.dim();
		for(let i=0 ; i<n ; i++)
			d += this.value[i] * v.value[i];
		return d;
	}
	minus(): T {
		return this.mul(-1);
	}
	dist_sq(v: Vector): number {
		return this.sub(v).len_sq();
	}
	distance(v: Vector): number {
		return Math.sqrt(this.dist_sq(v));
	}
	toString(): string {
		const n = this.dim();
		let ret = `Vector${n}:[`;
		let bFirst = true;
		for(let i=0 ; i<n ; i++) {
			if(!bFirst)
				ret += ", ";
			ret += this.value[i];
			bFirst = false;
		}
		return ret + "]";
	}
}
export default VectorImpl;
