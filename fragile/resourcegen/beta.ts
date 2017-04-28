import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import ResourceParam from "./param";
import Vec3 from "../vector3";
import Size from "../size";
import Resource from "../resource";

export default class RPBeta implements ResourceParam {
	constructor(public color: Vec3) {}
	get name() { return "Beta"; }
	get key() {
		const c = this.color;
		return `Beta_${c.x}_${c.y}_${c.z}`;
	}
}
import GLTexture2D from "../gl_texture2d";
import {UVWrap, InterFormat, TexDataFormat} from "../gl_const";
ResourceGenSrc.Beta = function(rp: RPBeta): Resource {
	const ret = new GLTexture2D();
	ret.setLinear(true, true, 0);
	ret.setWrap(UVWrap.Clamp, UVWrap.Clamp);
	const dim = rp.color.dim();
	const ub = new Uint8Array(dim);
	for(let i=0 ; i<dim ; i++) {
		ub[i] = rp.color.value[i] * 255;
	}
	ret.setData(InterFormat.RGB, 1, 1, InterFormat.RGB, TexDataFormat.UB, ub);
	return ret;
};
