#version 100
#pragma glslify: import(./gaussvalue)
#pragma glslify: GaussMix9 = require(./gauss_mix9)

void main() {
	vec2 diff = vec2(0.0, 17.0 * u_mapSize.w);
	gl_FragColor = GaussMix9(v_texC, v_tex, u_weight, u_texDiffuse, diff);
}
