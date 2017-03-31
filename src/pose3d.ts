import Mat44 from "./matrix44";
import Vec3 from "./vector3";
import Quat from "./quat";
import Clonable from "./clonable";

// 3D姿勢
export default class Pose3D implements Clonable {
	constructor(
		public pos: Vec3=new Vec3(0),
		public rot: Quat=Quat.Identity(),
		public scale: Vec3=new Vec3(1)
	) {}
	asMatrix(): Mat44 {
		// Scaling, Rotation, Position の順
		return Mat44.Translation(this.pos.x, this.pos.y, this.pos.z).mul(
			this.rot.matrix44().mul(
				Mat44.Scaling(this.scale.x, this.scale.y, this.scale.z)
			)
		);
	}
	clone(): Pose3D {
		return new Pose3D(this.pos, this.rot, this.scale);
	}
}
