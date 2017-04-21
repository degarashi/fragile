import {Assert, IsMatrix, IsVector} from "./utilfuncs";
import Matrix from "./matrix";
import Clonable from "./clonable";
import Vector from "./vector";
import Vec4 from "./vector4";
import Mat44 from "./matrix44";
import {MakeVector} from "./vectorutil";

class MatrixImpl<T extends Matrix> implements Matrix {
	readonly value: Float32Array;
	private readonly _m: number;
	private readonly _n: number;
	constructor(m:number, n:number , ...arg: number[]) {
		this._m = m;
		this._n = n;
		this.value = new Float32Array(m*n);
		for(let i=0 ; i<m*n ; i++)
			this.value[i] = arg[i] || 0;
	}
	dim_m(): number {
		return this._m;
	}
	dim_n(): number {
		return this._n;
	}
	set(m: Matrix): T {
		const n = this.dim_m() * this.dim_n();
		for(let i=0 ; i<n ; i++) {
			this.value[i] = m.value[i];
		}
		return this._asT();
	}
	getAt(x: number, y: number): number {
		return this.value[x*4 + y];
	}
	setAt(x: number, y: number, val: number): number {
		return this.value[x*4 + y] = val;
	}
	clone(): T {
		const ret = new MatrixImpl<T>(this.dim_m(), this.dim_n());
		ret.set(this);
		return ret._asT();
	}
	private _asT(): T {
		const tmp:any = this;
		return <T>tmp;
	}
	private _mulMatrix(m: Matrix): T {
		const ret = this.clone();
		const [w,h] = [this.dim_n(), this.dim_m()];
		for(let i=0 ; i<h ; i++) {
			for(let j=0 ; j<w ; j++) {
				let sum = 0;
				for(let k=0 ; k<w ; k++) {
					sum += this.getAt(k,i) * m.getAt(j,k);
				}
				ret.setAt(j,i, sum);
			}
		}
		return ret;
	}
	private _mulVector(v: Vector) {
		const w = this.dim_n(),
			h = this.dim_m();
		const ret = MakeVector(w, 0);
		for(let i=0 ; i<h ; i++) {
			for(let k=0 ; k<w ; k++) {
				ret.value[i] += this.getAt(k,i) * v.value[k];
			}
		}
		return ret;
	}
	private _mulFloat(f: number): T {
		const ret = this.clone();
		const n = this.dim_m() * this.dim_n();
		for(let i=0 ; i<n ; i++)
			ret.value[i] = this.value[i] * f;
		return ret;
	}
	mul(m: Matrix|number): T;
	mul(m: Vector): Vector;
	mul(m: any): any {
		if(IsMatrix(m))
			return this._mulMatrix(m);
		if(IsVector(m))
			return this._mulVector(m);
		Assert(typeof m === "number");
		return this._mulFloat(m);
	}
	mulSelf(m: Matrix): T {
		return this.set(this.mul(m));
	}
	toString(): string {
		let str = "Matrix:\n";
		const w = this.dim_n(),
			h = this.dim_m();
		for(let i=0 ; i<h ; i++) {
			for(let j=0 ; j<w ; j++) {
				str += this.getAt(j,i);
				if(j !== w)
					str += ", ";
			}
			if(i !== h)
				str += "\n";
		}
		return str;
	}
}
export default MatrixImpl;
