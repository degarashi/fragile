import {ResourceGenSrc} from "../resourcegen";
import Vec2 from "../vector2";
import Vec3 from "../vector3";
import Vec4 from "../vector4";
import GLVBuffer from "../gl_vbuffer";
import GLIBuffer from "../gl_ibuffer";
import {DrawType} from "../gl_const";
import RPString from "./string";
import ResourceParam from "./param";
import Geometry from "../geometry";
import Resource from "../resource";
import ResourceWrap from "../resource_wrap";

function MakeRect(ofs: Vec2, sc: Vec2) {
	return {
		vertex: [
			new Vec2(0, 0).addSelf(ofs),
			new Vec2(0, sc.y).addSelf(ofs),
			new Vec2(sc.x, sc.y).addSelf(ofs),
			new Vec2(sc.x, 0).addSelf(ofs)
		],
		index: [
			0,1,2, 2,3,0
		]
	};
}
function MakeRectVI(ofs: Vec2, sc: Vec2) {
	const buff = {
		vbuffer: {
			a_position: new GLVBuffer()
		},
		ibuffer: new GLIBuffer()
	};
	const rect = MakeRect(ofs, sc);
	buff.vbuffer.a_position.setData(rect.vertex, DrawType.Static, true);
	buff.ibuffer.setDataRaw(
		new Uint16Array(rect.index),
		1,
		DrawType.Static,
		true
	);
	return buff;
}
ResourceGenSrc.Rect05 = function(rp: ResourceParam):Resource {
	return new ResourceWrap<Geometry>(MakeRectVI(new Vec2(-0.5, -0.5), new Vec2(1)));
};
ResourceGenSrc.Rect01 = function(rp: ResourceParam): Resource {
	return new ResourceWrap<Geometry>(MakeRectVI(new Vec2(-1), new Vec2(2)));
};
ResourceGenSrc.Trihedron = function():Resource {
	const buff = {
		vbuffer: {
			a_position: new GLVBuffer(),
			a_color: new GLVBuffer(),
			a_uv: new GLVBuffer()
		},
		ibuffer: new GLIBuffer()
	};
	buff.vbuffer.a_position.setData([
		new Vec3(-1, -1, 1),
		new Vec3(0, -1, -1),
		new Vec3(1, -1, 1),
		new Vec3(0, 1, 0)
	], DrawType.Static, true);
	buff.vbuffer.a_uv.setData([
		new Vec4(1,1,1,1),
		new Vec4(1,0,0,1),
		new Vec4(0,0,1,1),
		new Vec4(0,1,0,1)
	], DrawType.Static, true);
	buff.ibuffer.setDataRaw(
		new Uint16Array([
			2,1,0,
			1,3,0,
			2,3,1,
			0,3,2
		]),
		1,
		DrawType.Static,
		true
	);
	return new ResourceWrap<Geometry>(buff);
};
export default class RPGeometry extends RPString {}
