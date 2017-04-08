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
	onUpdate(self: FPSCamera, dt: number): void {
		if(input.isMKeyPressed(0)) {
			self.setState(new StLook());
		} else {
			const c = self.camera;
			let dx = 0,
				dy = 0;
			// A = 65
			if(input.isKeyPressing(65)) {
				dx = -1;
			// D = 68
			} else if(input.isKeyPressing(68)) {
				dx = 1;
			}
			// W = 87
			if(input.isKeyPressing(87)) {
				dy = 1;
			// S = 83
			} else if(input.isKeyPressing(83)) {
				dy = -1;
			}
			const r = c.rot.right();
			c.pos.addSelf(r.mul(dx*dt*self._speed));
			const u = c.rot.dir();
			c.pos.addSelf(u.mul(dy*dt*self._speed));
		}
	}
}
class StLook extends State<FPSCamera> {
	onUpdate(self: FPSCamera, dt: number): void {
		if(!input.isMKeyPressing(0)) {
			self.setState(new StIdle());
		} else {
			const d = input.positionDelta();
			self._yaw += d.x*self._rotSpeed;
			self._pitch -= d.y*self._rotSpeed;

			const pi = Math.PI;
			self._pitch = Saturation(self._pitch, -(pi/2-0.01), (pi/2-0.01));

			const c = self.camera;
			c.rot = Quat.RotationYPR(self._yaw, self._pitch, 0);
			c.rot.normalizeSelf();
		}
	}
}

export default class FPSCamera extends FSMachine<FPSCamera> {
	_yaw: number;
	_pitch: number;
	camera: Camera3D;
	_speed: number;
	_rotSpeed: number;

	constructor() {
		super(0, new StIdle());
		this._yaw = this._pitch = 0;
		this._speed = 3;
		this._rotSpeed = 0.003;

		const c = new Camera3D();
		c.fov = TM.Deg2rad(90);
		const s = engine.size();
		c.aspect = s.width / s.height;
		c.nearZ = 0.01;
		c.farZ = 200;
		c.pos = new Vec3(0,0,-1);
		this.camera = c;
	}
}
