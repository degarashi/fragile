import Vec3 from "./vector3";
import Mat44 from "./matrix44";
import ResourceGen from "./resourcegen";
import RPGeometry from "./resourcegen/geometry";
import {DrawWithGeom} from "./utilfuncs";
import {gl, engine} from "./global";
import Geometry from "./geometry";
import GLTexture from "./gl_texture";

export default class Billboard {
	pos: Vec3;
	geom: Geometry;
	tex: GLTexture;
	constructor() {
		this.pos = new Vec3(0);
		this.geom = ResourceGen.get(new RPGeometry("Rect01"));
	}
	_calcMatrix(viewDir: Vec3): Mat44 {
		const pos = this.pos;
		return Mat44.Translation(
			pos.x, pos.y, pos.z
		).mul(
			Mat44.LookDir(
				new Vec3(0,0,0),
				viewDir,
				new Vec3(0,1,0)
			).transposeSelf()
		);
	}
	draw(viewDir: Vec3) {
		const m = this._calcMatrix(viewDir);
		engine.sys3d().worldMatrix = m;
		engine.setUniform("u_texture", this.tex);
		engine.draw(()=> { DrawWithGeom(this.geom, gl.TRIANGLES); });
	}
}