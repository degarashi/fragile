import DObject from "./dobject";
import ResourceGen from "./resourcegen";
import ResourceWrap from "./resource_wrap";
import RPGeometry from "./resourcegen/geometry";
import GLTexture from "./gl_texture";
import Geometry from "./geometry";
import {engine} from "./global";
import Rect from "./rect";
import Vec2 from "./vector2";

export default class WrapRect extends DObject {
	private _rect = <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01_01"));
	texture: GLTexture;
	zoom: number = 1;
	vflip: boolean = false;

	constructor() {
		super("rect");
	}
	onDraw(): void {
		if(!this.texture)
			return;
		engine.setUniform("u_texture", this.texture);
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
		engine.setUniform("u_alpha", 1.0);
		engine.drawGeometry(this._rect.data);
	}
}