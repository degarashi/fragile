#version 100
#define VShader
#pragma glslify: import(./gaussvalue)
#pragma glslify: UV9 = require(./uv9)

void main() {
	vec2 uv = a_uv * (u_uvrect.zy-u_uvrect.xw) + u_uvrect.xw;
	UV9(v_tex, v_texC, uv, u_mapSize.zw, vec2(1.5, 0), vec2(2, 0));
	gl_Position = vec4(a_position, 0, 1);
}
