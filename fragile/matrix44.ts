import MatrixImpl from "./matriximpl";
import Vec3 from "./vector3";
import Vec4 from "./vector4";
import TM from "./tmath";

export class NoInvertedMatrix extends Error {}
export default class Mat44 extends MatrixImpl<Mat44> {
	constructor(...arg: number[]) {
		super(4,4, ...arg);
	}
	// 行優先
	static FromRow(
		m00:number, m01:number, m02:number, m03:number,
		m10:number, m11:number, m12:number, m13:number,
		m20:number, m21:number, m22:number, m23:number,
		m30:number, m31:number, m32:number, m33:number
	) {
		return new Mat44(
			m00, m10, m20, m30,
			m01, m11, m21, m31,
			m02, m12, m22, m32,
			m03, m13, m23, m33
		);
	}
	static FromVec3s(x:Vec3, y:Vec3, z:Vec3) {
		return new Mat44(
			x.x, y.x, z.x, 0,
			x.y, y.y, z.y, 0,
			x.z, y.z, z.z, 0,
			0, 0, 0, 1
		);
	}
	static FromVec4s(x:Vec4, y:Vec4, z:Vec4, w:Vec4) {
		return new Mat44(
			x.x, y.x, z.x, w.x,
			x.y, y.y, z.y, w.y,
			x.z, y.z, z.z, w.z,
			x.w, y.w, z.w, w.w
		);
	}
	static LookDir(pos:Vec3, dir:Vec3, up:Vec3) {
		const rdir = up.cross(dir);
		rdir.normalizeSelf();
		up = dir.cross(rdir);
		up.normalizeSelf();
		return new Mat44(
			rdir.x, up.x, dir.x, 0,
			rdir.y, up.y, dir.y, 0,
			rdir.z, up.z, dir.z, 0,
			-rdir.dot(pos), -up.dot(pos), -dir.dot(pos), 1
		);
	}
	static LookAt(pos:Vec3, at:Vec3, up:Vec3) {
		return Mat44.LookDir(pos, at.sub(pos).normalizeSelf(), up);
	}
	static Scaling(x: number, y: number, z: number) {
		return new Mat44(
			x,0,0,0,
			0,y,0,0,
			0,0,z,0,
			0,0,0,1
		);
	}
	static PerspectiveFov(fov: number, aspect: number, znear: number, zfar: number) {
		const h = 1 / Math.tan(fov/2);
		const w = h / aspect;
		const f0 = zfar / (zfar - znear),
			f1 = -znear * zfar/(zfar - znear);
		return new Mat44(
			w, 0, 0, 0,
			0, h, 0, 0,
			0, 0, f0, 1,
			0, 0, f1, 0
		);
	}
	static Translation(x: number, y: number, z: number) {
		return new Mat44(
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			x,y,z,1
		);
	}
	static Rotation(axis: Vec3, angle: number) {
		const C = Math.cos(angle),
			S = Math.sin(angle),
			RC = 1-C;
		const axis0 = axis.x,
			axis1 = axis.y,
			axis2 = axis.z;
		return Mat44.FromRow(
			C+TM.Square(axis0)*RC,		axis0*axis1*RC-axis2*S,		axis0*axis2*RC+axis1*S,		0,
			axis0*axis1*RC+axis2*S,			C+TM.Square(axis1)*RC,	axis1*axis2*RC-axis0*S,		0,
			axis0*axis2*RC-axis1*S,			axis1*axis2*RC+axis0*S,		C+TM.Square(axis2)*RC,	0,
			0, 0, 0, 1
		);
	}
	static RotationX(angle: number) {
		return Mat44.Rotation(new Vec3(1,0,0), angle);
	}
	static RotationY(angle: number) {
		return Mat44.Rotation(new Vec3(0,1,0), angle);
	}
	static RotationZ(angle: number) {
		return Mat44.Rotation(new Vec3(0,0,1), angle);
	}

	static Zero() {
		return new Mat44(0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0);
	}
	static Identity() {
		return new Mat44(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
	}
	static Iterate(f: (x:number,y:number)=>void) {
		for(let i=0 ; i<4 ; i++) {
			for(let j=0 ; j<4 ; j++)
				f(j,i);
		}
	}
	get _m00() { return this.value[0]; }
	get _m01() { return this.value[4]; }
	get _m02() { return this.value[8]; }
	get _m03() { return this.value[12]; }
	get _m10() { return this.value[0+1]; }
	get _m11() { return this.value[4+1]; }
	get _m12() { return this.value[8+1]; }
	get _m13() { return this.value[12+1]; }
	get _m20() { return this.value[0+2]; }
	get _m21() { return this.value[4+2]; }
	get _m22() { return this.value[8+2]; }
	get _m23() { return this.value[12+2]; }
	get _m30() { return this.value[0+3]; }
	get _m31() { return this.value[4+3]; }
	get _m32() { return this.value[8+3]; }
	get _m33() { return this.value[12+3]; }

	determinant() {
		return this._m00 * this._m11 * this._m22 * this._m33 + this._m00 * this._m12 * this._m23 * this._m31 + this._m00 * this._m13 * this._m21 * this._m32
			+ this._m01 * this._m10 * this._m23 * this._m32 + this._m01 * this._m12 * this._m20 * this._m33 + this._m01 * this._m13 * this._m22 * this._m30
			+ this._m02 * this._m10 * this._m21 * this._m33 + this._m02 * this._m11 * this._m23 * this._m30 + this._m02 * this._m13 * this._m20 * this._m31
			+ this._m03 * this._m10 * this._m22 * this._m31 + this._m03 * this._m11 * this._m20 * this._m32 + this._m03 * this._m12 * this._m21 * this._m30
			- this._m00 * this._m11 * this._m23 * this._m32 - this._m00 * this._m12 * this._m21 * this._m33 - this._m00 * this._m13 * this._m22 * this._m31
			- this._m01 * this._m10 * this._m22 * this._m33 - this._m01 * this._m12 * this._m23 * this._m30 - this._m01 * this._m13 * this._m20 * this._m32
			- this._m02 * this._m10 * this._m23 * this._m31 - this._m02 * this._m11 * this._m20 * this._m33 - this._m02 * this._m13 * this._m21 * this._m30
			- this._m03 * this._m10 * this._m21 * this._m32 - this._m03 * this._m11 * this._m22 * this._m30 - this._m03 * this._m12 * this._m20 * this._m31;
	}
	invert(): Mat44 {
		let det = this.determinant();
		if(Math.abs(det) > 1e-5) {
			const b:number[] = [
				this._m11 * this._m22 * this._m33 + this._m12 * this._m23 * this._m31 + this._m13 * this._m21 * this._m32 - this._m11 * this._m23 * this._m32 - this._m12 * this._m21 * this._m33 - this._m13 * this._m22 * this._m31,
				this._m01 * this._m23 * this._m32 + this._m02 * this._m21 * this._m33 + this._m03 * this._m22 * this._m31 - this._m01 * this._m22 * this._m33 - this._m02 * this._m23 * this._m31 - this._m03 * this._m21 * this._m32,
				this._m01 * this._m12 * this._m33 + this._m02 * this._m13 * this._m31 + this._m03 * this._m11 * this._m32 - this._m01 * this._m13 * this._m32 - this._m02 * this._m11 * this._m33 - this._m03 * this._m12 * this._m31,
				this._m01 * this._m13 * this._m22 + this._m02 * this._m11 * this._m23 + this._m03 * this._m12 * this._m21 - this._m01 * this._m12 * this._m23 - this._m02 * this._m13 * this._m21 - this._m03 * this._m11 * this._m22,

				this._m10 * this._m23 * this._m32 + this._m12 * this._m20 * this._m33 + this._m13 * this._m22 * this._m30 - this._m10 * this._m22 * this._m33 - this._m12 * this._m23 * this._m30 - this._m13 * this._m20 * this._m32,
				this._m00 * this._m22 * this._m33 + this._m02 * this._m23 * this._m30 + this._m03 * this._m20 * this._m32 - this._m00 * this._m23 * this._m32 - this._m02 * this._m20 * this._m33 - this._m03 * this._m22 * this._m30,
				this._m00 * this._m13 * this._m32 + this._m02 * this._m10 * this._m33 + this._m03 * this._m12 * this._m30 - this._m00 * this._m12 * this._m33 - this._m02 * this._m13 * this._m30 - this._m03 * this._m10 * this._m32,
				this._m00 * this._m12 * this._m23 + this._m02 * this._m13 * this._m20 + this._m03 * this._m10 * this._m22 - this._m00 * this._m13 * this._m22 - this._m02 * this._m10 * this._m23 - this._m03 * this._m12 * this._m20,

				this._m10 * this._m21 * this._m33 + this._m11 * this._m23 * this._m30 + this._m13 * this._m20 * this._m31 - this._m10 * this._m23 * this._m31 - this._m11 * this._m20 * this._m33 - this._m13 * this._m21 * this._m30,
				this._m00 * this._m23 * this._m31 + this._m01 * this._m20 * this._m33 + this._m03 * this._m21 * this._m30 - this._m00 * this._m21 * this._m33 - this._m01 * this._m23 * this._m30 - this._m03 * this._m20 * this._m31,
				this._m00 * this._m11 * this._m33 + this._m01 * this._m13 * this._m30 + this._m03 * this._m10 * this._m31 - this._m00 * this._m13 * this._m31 - this._m01 * this._m10 * this._m33 - this._m03 * this._m11 * this._m30,
				this._m00 * this._m13 * this._m21 + this._m01 * this._m10 * this._m23 + this._m03 * this._m11 * this._m20 - this._m00 * this._m11 * this._m23 - this._m01 * this._m13 * this._m20 - this._m03 * this._m10 * this._m21,

				this._m10 * this._m22 * this._m31 + this._m11 * this._m20 * this._m32 + this._m12 * this._m21 * this._m30 - this._m10 * this._m21 * this._m32 - this._m11 * this._m22 * this._m30 - this._m12 * this._m20 * this._m31,
				this._m00 * this._m21 * this._m32 + this._m01 * this._m22 * this._m30 + this._m02 * this._m20 * this._m31 - this._m00 * this._m22 * this._m31 - this._m01 * this._m20 * this._m32 - this._m02 * this._m21 * this._m30,
				this._m00 * this._m12 * this._m31 + this._m01 * this._m10 * this._m32 + this._m02 * this._m11 * this._m30 - this._m00 * this._m11 * this._m32 - this._m01 * this._m12 * this._m30 - this._m02 * this._m10 * this._m31,
				this._m00 * this._m11 * this._m22 + this._m01 * this._m12 * this._m20 + this._m02 * this._m10 * this._m21 - this._m00 * this._m12 * this._m21 - this._m01 * this._m10 * this._m22 - this._m02 * this._m11 * this._m20
			];
			det = 1 / det;
			for(let i=0 ; i<b.length ; i++)
				b[i] *= det;
			return Mat44.FromRow(
				b[0],b[1],b[2],b[3],
				b[4],b[5],b[6],b[7],
				b[8],b[9],b[10],b[11],
				b[12],b[13],b[14],b[15]
			);
		}
		throw new NoInvertedMatrix();
	}
	transposeSelf() {
		for(let i=0 ; i<4 ; i++) {
			for(let j=i ; j<4 ; j++) {
				let tmp = this.getAt(i,j);
				this.setAt(i,j, this.getAt(j,i));
				this.setAt(j,i, tmp);
			}
		}
		return this;
	}
	transform3(v: Vec3) {
		const ret = new Vec3(this.getAt(0,3), this.getAt(1,3), this.getAt(2,3));
		for(let i=0 ; i<3 ; i++) {
			for(let j=0 ; j<3 ; j++)
				ret.value[i] += this.getAt(i,j) * v.value[j];
		}
		return ret;
	}
}
