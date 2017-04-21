import Camera3D from "./camera3d";
import Mat44 from "./matrix44";
import GLProgram from "./gl_program";

export default class SysUnif3D {
	camera: Camera3D = new Camera3D();
	worldMatrix: Mat44 = Mat44.Identity();

	apply(prog: GLProgram): void {
		if(prog.hasUniform("u_mWorld")) {
			prog.setUniform("u_mWorld", this.worldMatrix);
		}
		if(prog.hasUniform("u_mTrans")) {
			const m = this.camera.getViewProjection().mulSelf(this.worldMatrix);
			prog.setUniform("u_mTrans", m);
		}
		if(prog.hasUniform("u_eyePos")) {
			prog.setUniform("u_eyePos", this.camera.pos);
		}
	}
}
