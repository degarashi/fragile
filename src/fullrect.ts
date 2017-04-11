import ResourceGen from "./resourcegen";
import RPGeometry from "./resourcegen/geometry";
import DObject from "./dobject";
import ResourceWrap from "./resource_wrap";
import Geometry from "./geometry";
import {engine, gl} from "./global";
import {DrawWithGeom} from "./utilfuncs";
import GLTexture from "./gl_texture";

export default class FullRect extends DObject {
	private _rect = <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01_01"));
	texture: GLTexture;
	alpha: number = 1;
	zoom: number = 1;
	alphablend: boolean = false;

	onDraw(): void {
		if(!this.texture)
			return;
		engine.setTechnique(this.alphablend ? "rectAdd" : "rect");
		engine.setUniform("u_texture", this.texture);
		engine.setUniform("u_alpha", this.alpha);
		engine.setUniform("u_zoom", 1/this.zoom);
		engine.draw(()=> {
			DrawWithGeom(this._rect.data, gl.TRIANGLES);
		});
	}
}
