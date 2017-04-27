precision mediump float;
#ifdef VShader
	attribute vec2 a_position;
	attribute vec2 a_uv;
#else
	uniform float u_weight[9];
	uniform sampler2D u_texDiffuse;
#endif
// [(0)x,y | (1)z,w]
varying vec4 v_tex[4];
varying vec2 v_texC;
// [x,y | z(xInv),w(yInv)]
uniform vec4 u_mapSize;
uniform vec4 u_uvrect;
