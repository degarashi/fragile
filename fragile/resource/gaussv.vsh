#version 100
precision mediump float;
#define VShader
#pragma glslify: import(./gaussvalue)
#pragma glslify: UV9 = require(./uv9)

void main() {
	vec2 uv = a_uv * (u_uvrect.zy-u_uvrect.xw) + u_uvrect.xw;
	UV9(v_tex, v_texC, uv, u_mapSize.zw, vec2(0, 1.5), vec2(0, 2));
	gl_Position = vec4(a_position, 0, 1);
}
