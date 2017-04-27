#version 100
#pragma glslify: import(./rectvalue)

uniform sampler2D u_texture;
uniform float u_alpha;

void main() {
	vec4 c = texture2D(u_texture, v_uv);
	gl_FragColor = vec4(c.rgb, u_alpha);
}
