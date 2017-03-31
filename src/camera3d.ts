import Pose3D from "./pose3d";
import Vec2 from "./vector2";
import Vec3 from "./vector3";
import Vec4 from "./vector4";
import Mat44 from "./matrix44";

export default class Camera3D extends Pose3D {
	fov: number = 90;
	aspect: number = 1;
	nearZ: number = 1e-2;
	farZ: number = 10;

	getView(): Mat44 {
		return Mat44.LookDir(this.pos, this.rot.dir(), new Vec3(0,1,0));
	}
	getProjection(): Mat44 {
		return Mat44.PerspectiveFov(
			this.fov,
			this.aspect,
			this.nearZ,
			this.farZ
		);
	}
	getViewProjection(): Mat44 {
		return this.getProjection().mul(this.getView());
	}
	/*! \param[in] pt	スクリーン座標(Vec2) */
	unproject(pt: Vec2): Vec2 {
		let vp:Mat44 = this.getViewProjection();
		vp = vp.invert();
		let v0 = new Vec4(pt.x, pt.y, 0, 1),
			v1 = new Vec4(pt.x, pt.y, 1, 1);
		v0 = <Vec4>vp.mul(v0);
		v1 = <Vec4>vp.mul(v1);
		v0.divSelf(v0.w);
		v1.divSelf(v1.w);
		const ret4 = v1.subSelf(v0).normalizeSelf();
		return new Vec2(ret4.x, ret4.y);
	}
	clone(): Camera3D {
		return new Camera3D(this.pos, this.rot, this.scale);
	}
}
