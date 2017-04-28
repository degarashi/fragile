import DObject from "./dobject";
import ResourceGen from "./resourcegen";
import ResourceWrap from "./resource_wrap";
import RPGeometry from "./resourcegen/geometry";
import GLTexture from "./gl_texture";
import Geometry from "./geometry";
import {engine} from "./global";
import Vec2 from "./vector2";
import Vec3 from "./vector3";
import Rect from "./rect";
import RPBeta from "./resourcegen/beta";
import GLTexture2D from "./gl_texture2d";

export default class WrapRectBase extends DObject {
	private _rect = <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01_01"));
	texture: GLTexture;
	zoom: number = 1;
	alpha: number = 1;
	vflip: boolean = false;
	color: Vec3 = new Vec3(1);

	constructor(tech: string) {
		super(tech);
	}
	onDraw(): void {
		if(!this.texture) {
			this.texture = <GLTexture2D>ResourceGen.get(new RPBeta(new Vec3(1,1,1)));
		}
		engine.setUniform("u_texture", this.texture);
		engine.setUniform("u_alpha", this.alpha);
		engine.setUniform("u_color", this.color);
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
		engine.drawGeometry(this._rect.data);
	}
}
