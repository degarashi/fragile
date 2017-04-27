import DObject from "./dobject";
import Geometry from "./geometry";
import Vec2 from "./vector2";
import Rect from "./rect";
import GLTexture from "./gl_texture";
import {engine} from "./global";
import ResourceGen from "./resourcegen";
import RPGeometry from "./resourcegen/geometry";
import ResourceWrap from "./resource_wrap";

export default class WrapRectAdd extends DObject {
	private _rect = <ResourceWrap<Geometry>>ResourceGen.get(new RPGeometry("Rect01_01"));
	texture: GLTexture;
	alpha: number = 1;
	zoom: number = 1;
	vflip: boolean = false;
	constructor() {
		super("rectAdd");
	}

	onDraw(): void {
		if(!this.texture)
			return;
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
		engine.drawGeometry(this._rect.data);
	}
}
