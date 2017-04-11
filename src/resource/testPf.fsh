precision mediump float;
uniform float u_alpha;
uniform sampler2D u_texture;
varying float v_dist;
varying vec3 v_hsv;
#pragma glslify: HSVtoRGB = require(./hsv)

void main() {
	vec4 c = texture2D(u_texture, gl_PointCoord);
	if(c.w < 0.1)
		discard;
	vec3 r = HSVtoRGB(v_hsv);
	c.xyz *= r;
	c.xyz *= 1.0 - min(1.0, v_dist/2.0);
	c.w = u_alpha;
	gl_FragColor = c;
}
