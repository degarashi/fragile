import GLVBuffer from "./gl_vbuffer";
import GLIBuffer from "./gl_ibuffer";
import Vec4 from "./vector4";
import Pose3D from "./pose3d";
import {DrawType} from "./gl_const";
import Geometry from "./geometry";
import {engine, gl} from "./global";
import {DrawWithGeom} from "./utilfuncs";

// モデル管理
class Model implements Geometry {
	vbuffer: {[key: string]: GLVBuffer;};
	ibuffer: GLIBuffer;
	pose: Pose3D;
	angle: number;
	private _param: any;

	constructor(idata: GLIBuffer, ...vdata: any[]) {
		// モデルジオメトリの初期化
		this.vbuffer = {};
		for(let i=0 ; i<vdata.length ; i++) {
			const vd = vdata[i];
			const vb = new GLVBuffer();
			vb.setData(vd.data, DrawType.Static);
			this.vbuffer[vd.name] = vb;
		}
		const ib = new GLIBuffer();
		ib.setDataRaw(idata, 1, DrawType.Static);
		this.ibuffer = ib;

		// 座標など
		this.pose = new Pose3D();

		this.angle = 0;
		this._param = {};
	}
	setParam(name: string, value: any): void {
		this._param[name] = value;
	}
	private _applyParam(): void {
		for(let k in this._param) {
			engine.setUniform(k, this._param[k]);
		}
	}
	draw(): void {
		this._applyParam();

		engine.setUniform("u_color", new Vec4(0,0,1,1));
		engine.sys3d().worldMatrix = this.pose.asMatrix();
		engine.draw(()=> { DrawWithGeom(this, gl.TRIANGLES); });
	}
}
export default Model;
