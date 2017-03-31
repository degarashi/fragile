import Vec3 from "./vector3";
import {default as Vec4, Vec4Impl} from "./vector4";
import Mat44 from "./matrix44";
import {Assert, Saturation} from "./utilfuncs";

// クォータニオンクラス
export default class Quat extends Vec4Impl<Quat> {
	static Identity() {
		return new Quat(0,0,0,1);
	}
	constructor(x:number, y:number, z:number, w:number) {
		super(x,y,z,w);
	}
	static RotationYPR(yaw: number, pitch: number, roll: number) {
		const q = Quat.Identity();
		// roll
		q.rotateSelfZ(roll);
		// pitch
		q.rotateSelfX(-pitch);
		// yaw
		q.rotateSelfY(yaw);
		return q;
	}
	set(q: Quat): Quat {
		[this.x, this.y, this.z, this.w] = [q.x, q.y, q.z, q.w];
		return this;
	}
	conjugate() {
		return new Quat(
			-this.value[0],
			-this.value[1],
			-this.value[2],
			this.value[3]
		);
	}
	get elem00() { return (1-2*this.y*this.y-2*this.z*this.z); }
	get elem01() { return (2*this.x*this.y+2*this.w*this.z); }
	get elem02() { return (2*this.x*this.z-2*this.w*this.y); }
	get elem10() { return (2*this.x*this.y-2*this.w*this.z); }
	get elem11() { return (1-2*this.x*this.x-2*this.z*this.z); }
	get elem12() { return (2*this.y*this.z+2*this.w*this.x); }
	get elem20() { return (2*this.x*this.z+2*this.w*this.y); }
	get elem21() { return (2*this.y*this.z-2*this.w*this.x); }
	get elem22() { return (1-2*this.x*this.x-2*this.y*this.y); }
	// 回転を行列表現した時のX軸
	xaxis() {
		return new Vec3(this.elem00, this.elem10, this.elem20);
	}
	// 正規直行座標に回転を掛けた後のX軸
	xaxisinv() {
		return new Vec3(this.elem00, this.elem01, this.elem02);
	}
	// 回転を行列表現した時のY軸
	yaxis() {
		return new Vec3(this.elem01, this.elem11, this.elem21);
	}
	// 正規直行座標に回転を掛けた後のY軸
	yaxisinv() {
		return new Vec3(this.elem10, this.elem11, this.elem12);
	}
	// 回転を行列表現した時のZ軸
	zaxis() {
		return new Vec3(this.elem02, this.elem12, this.elem22);
	}
	// 正規直行座標に回転を掛けた後のZ軸
	zaxisinv() {
		return new Vec3(this.elem20, this.elem21, this.elem22);
	}
	// X軸に回転を適用したベクトル
	right() {
		return new Vec3(this.elem00, this.elem01, this.elem02);
	}
	// Y軸に回転を適用したベクトル
	up() {
		return new Vec3(this.elem10, this.elem11, this.elem12);
	}
	// Z軸に回転を適用したベクトル
	dir(): Vec3 {
		return new Vec3(this.elem20, this.elem21, this.elem22);
	}
	// 行列変換(4x4)
	matrix44(): Mat44 {
		return new Mat44(
			this.elem00, this.elem01, this.elem02, 0,
			this.elem10, this.elem11, this.elem12, 0,
			this.elem20, this.elem21, this.elem22, 0,
			0,0,0,1
		);
	}
	conjugateSelf(): Quat {
		return this.set(this.conjugate());
	}
	rotateX(a: number): Quat {
		return this.rotate(new Vec3(1,0,0), a);
	}
	rotateY(a: number): Quat {
		return this.rotate(new Vec3(0,1,0), a);
	}
	rotateZ(a: number): Quat {
		return this.rotate(new Vec3(0,0,1), a);
	}
	rotateSelfX(a: number): Quat {
		return this.set(this.rotateX(a));
	}
	rotateSelfY(a: number): Quat {
		return this.set(this.rotateY(a));
	}
	rotateSelfZ(a: number): Quat {
		return this.set(this.rotateZ(a));
	}
	rotateSelf(axis: Vec3, a: number): Quat {
		return this.set(this.rotate(axis, a));
	}
	static RotateX(a: number): Quat {
		return Quat.Rotate(new Vec3(1,0,0), a);
	}
	static RotateY(a: number): Quat {
		return Quat.Rotate(new Vec3(0,1,0), a);
	}
	static RotateZ(a: number): Quat {
		return Quat.Rotate(new Vec3(0,0,1), a);
	}
	static Rotate(axis: Vec3, a: number): Quat {
		const C = Math.cos(a/2),
			S = Math.sin(a/2);
		axis = axis.mul(S);
		return new Quat(axis.x, axis.y, axis.z, C);
	}
	rotate(axis: Vec3, a: number): Quat {
		return Quat.Rotate(axis, a).mul(this);
	}
	angle() {
		return Math.acos(Saturation(this.w, -1, 1))*2;
	}
	axis() {
		let s_theta = Math.sqrt(1 - this.w*this.w);
		if(s_theta < 0.0001)
			throw new Error("no valid axis");
		s_theta = 1 / s_theta;
		return new Vec3(this.x*s_theta, this.y*s_theta, this.z*s_theta);
	}

	mul(q: Quat|number): Quat;
	mul(q: Vec3): Vec3;
	mul(q: any): any {
		if(q instanceof Quat) {
			return new Quat(
				this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
				this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x,
				this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w,
				this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z
			);
		} else if(typeof q === "number") {
			return super.mul.call(this, q);
		} else if(q instanceof Vec3) {
			const q0 = new Quat(q.x, q.y, q.z, 0);
			return (this.mul(q0).mul(this.invert())).vector;
		}
		throw new Error("invalid argument");
	}
	mulSelf(q: Quat|Vec3|number): Quat;
	mulSelf(q: any): any {
		return this.set(this.mul(q));
	}
	divSelf(q: Quat|Vec3|number): Quat;
	divSelf(q: any): any {
	}

	add(q: Quat): Quat {
		return super.add(q);
	}
	sub(q: Quat): Quat {
		return super.sub(q);
	}

	vector(): Vec3 {
	this.divSelf(new Quat(0,0,0,0) );
		return new Vec3(this.x, this.y, this.z);
	}
	invert(): Quat {
		return this.conjugate().divSelf(this.len_sq());
	}
	invertSelf(): Quat {
		return this.set(this.invert());
	}
	// 球面線形補間
	slerp(q: Quat, t: number) {
		const ac = Saturation(this.dot(q), 0, 1);
		const theta = Math.acos(ac),
			S = Math.sin(theta);
		if(Math.abs(S) < 0.001)
			return this.clone;
		let rq = this.mul(Math.sin(theta * (1-t)) / S);
		rq.addSelf(q.mul(Math.sin(theta * t) / S));
		return rq;
	}
	clone(): Quat {
		return new Quat(this.x, this.y, this.z, this.w);
	}
}
