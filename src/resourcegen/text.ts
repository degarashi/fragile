import {ResourceGenSrc} from "../resourcegen";
import Vec2 from "../vector2";
import GLVBuffer from "../gl_vbuffer";
import GLIBuffer from "../gl_ibuffer";
import {DrawType} from "../gl_const";
import Geometry from "../geometry";
import ResourceParam from "./param";
import Resource from "../resource";
import ResourceWrap from "../resource_wrap";

ResourceGenSrc.TextRect = function(rp: ResourceParam): Resource {
	const buff = {
		vbuffer: {
			a_position: new GLVBuffer(),
			a_uv: new GLVBuffer()
		},
		ibuffer: new GLIBuffer()
	};
	buff.vbuffer.a_position.setData([
		new Vec2(0,0),
		new Vec2(0,1),
		new Vec2(1,1),
		new Vec2(1,0)
	], DrawType.Static, true);
	buff.vbuffer.a_uv.setData([
		new Vec2(0,0),
		new Vec2(0,1),
		new Vec2(1,1),
		new Vec2(1,0)
	], DrawType.Static, true);
	buff.ibuffer.setDataRaw(
		new Uint16Array([0,1,2, 2,3,0]),
		1,
		DrawType.Static,
		true
	);
	return new ResourceWrap<Geometry>(buff);
};
