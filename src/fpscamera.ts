import FSMachine from "./fsmachine";
import Camera3D from "./camera3d";
import Vec3 from "./vector3";
import Quat from "./quat";
import TM from "./tmath";
import State from "./state";
import {Saturation} from "./utilfuncs";
import {engine, input} from "./global";
import Engine from "./engine";

class StIdle extends State<FPSCamera> {
	onUpdate(self: FPSCamera, dt: number) {
		if(input.isMKeyPressed(0)) {
			self.setState(new StLook());
		} else {
			const c = self._camera;
			if(input.isKeyPressing(65)) {
				c.pos.x -= dt*5;
			}
			if(input.isKeyPressing(68)) {
				c.pos.x += dt*5;
			}
			if(input.isKeyPressing(87)) {
				c.pos.y += dt*5;
			}
			if(input.isKeyPressing(83)) {
				c.pos.y -= dt*5;
			}
		}
	}
}
class StLook extends State<FPSCamera> {
	onUpdate(self: FPSCamera, dt: number) {
		if(!input.isMKeyPressing(0)) {
			self.setState(new StIdle());
		} else {
			const d = input.positionDelta();
			self._yaw += d.x*0.005;
			self._pitch -= d.y*0.005;

			const pi = Math.PI;
			self._pitch = Saturation(self._pitch, -(pi/2-0.01), (pi/2-0.01));

			const c = self._camera;
			c.rot = Quat.RotationYPR(self._yaw, self._pitch, 0);
			c.rot.normalizeSelf();
		}
	}
}

export default class FPSCamera extends FSMachine<FPSCamera> {
	_yaw: number;
	_pitch: number;
	_camera: Camera3D;

	constructor() {
		super(0, new StIdle());
		this._yaw = this._pitch = 0;

		const c = new Camera3D();
		c.fov = TM.Deg2rad(90);
		c.aspect = engine.width() / engine.height();
		c.nearZ = 0.01;
		c.farZ = 200;
		c.pos = new Vec3(0,0,-1);
		c.rot = Quat.Identity();
		this._camera = c;

		engine.sys3d().camera = c;
	}
}
