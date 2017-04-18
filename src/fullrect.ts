import ResourceGen from "./resourcegen";
import RPGeometry from "./resourcegen/geometry";
import DObject from "./dobject";
import ResourceWrap from "./resource_wrap";
import Geometry from "./geometry";
import {engine, gl} from "./global";
import {DrawWithGeom} from "./utilfuncs";
import GLTexture from "./gl_texture";
import Rect from "./rect";
import Vec2 from "./vector2";

export default class FullRect extends DObject {
	private _rect = <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01_01"));
	texture: GLTexture;
	alpha: number = 1;
	zoom: number = 1;
	alphablend: boolean = false;
	vflip: boolean = false;

	onDraw(): void {
		if(!this.texture)
			return;
		engine.setTechnique(this.alphablend ? "rectAdd" : "rect");
		engine.setUniform("u_texture", this.texture);
		engine.setUniform("u_alpha", this.alpha);
		const ts = this.texture.truesize();
		const s = this.texture.size();
		const uv = new Rect(0, s.height/ts.height, s.width/ts.width, 0);
		engine.setUniform("u_uvcenter", uv.center());
		const vf = this.vflip ? -1 : 1;
		const zi = 1/this.zoom;
		engine.setUniform(
			"u_uvratio",
			new Vec2(
				uv.width()/2*zi,
				uv.height()/2*vf*zi
			)
		);
		engine.draw(()=> {
			DrawWithGeom(this._rect.data, gl.TRIANGLES);
		});
	}
}
