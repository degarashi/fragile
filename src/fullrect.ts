import ResourceGen from "./resourcegen";
import RPGeometry from "./resourcegen/geometry";
import DObject from "./dobject";
import ResourceWrap from "./resource_wrap";
import Geometry from "./geometry";
import {engine, gl} from "./global";
import {DrawWithGeom} from "./utilfuncs";
import GLTexture from "./gl_texture";

export default class FullRect extends DObject {
	private _rect: ResourceWrap<Geometry>
				= <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01"));
	texture: GLTexture;
	alpha: number = 1;

	onDraw(): void {
		if(!this.texture)
			return;
		engine.setTechnique("rect");
		engine.setUniform("u_texture", this.texture);
		engine.setUniform("u_alpha", this.alpha);
		engine.draw(()=> {
			DrawWithGeom(this._rect.data, gl.TRIANGLES);
		});
	}
}
