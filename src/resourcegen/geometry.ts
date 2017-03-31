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

ResourceGenSrc.Rect01 = function(rp: ResourceParam):Geometry {
	const buff = {
		vbuffer: {
			a_position: new GLVBuffer()
		},
		ibuffer: new GLIBuffer()
	};
	const h = 0.5;
	buff.vbuffer.a_position.setData([
		new Vec2(-h,-h),
		new Vec2(-h,h),
		new Vec2(h,h),
		new Vec2(h,-h)
	], DrawType.Static);
	buff.ibuffer.setDataRaw(
		new Uint16Array([0,1,2, 2,3,0]),
		1,
		DrawType.Static
	);
	return buff;
};
ResourceGenSrc.Trihedron = function():Geometry {
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
	], DrawType.Static);
	buff.vbuffer.a_uv.setData([
		new Vec4(1,1,1,1),
		new Vec4(1,0,0,1),
		new Vec4(0,0,1,1),
		new Vec4(0,1,0,1)
	], DrawType.Static);
	buff.ibuffer.setDataRaw(
		new Uint16Array([
			2,1,0,
			1,3,0,
			2,3,1,
			0,3,2
		]),
		1,
		DrawType.Static
	);
	return buff;
};
export default class RPGeometry extends RPString {}
