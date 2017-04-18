vec4 GaussMix9(vec2 uvc, vec4 uv[4], float w[9], sampler2D tex, vec2 diff) {
	vec4 c;
	c = w[0] * texture2D(tex, uvc);
	c += w[1] * (texture2D(tex, uv[0].xy)
				+ texture2D(tex, uv[3].zw - diff));
	c += w[2] * (texture2D(tex, uv[0].zw)
				+ texture2D(tex, uv[3].xy - diff));
	c += w[3] * (texture2D(tex, uv[1].xy)
				+ texture2D(tex, uv[2].zw - diff));
	c += w[4] * (texture2D(tex, uv[1].zw)
				+ texture2D(tex, uv[2].xy - diff));
	c += w[5] * (texture2D(tex, uv[2].xy)
				+ texture2D(tex, uv[1].zw - diff));
	c += w[6] * (texture2D(tex, uv[2].zw)
				+ texture2D(tex, uv[1].xy - diff));
	c += w[7] * (texture2D(tex, uv[3].xy)
				+ texture2D(tex, uv[0].zw - diff));
	c += w[8] * (texture2D(tex, uv[3].zw)
				+ texture2D(tex, uv[0].xy - diff));
	c.w = 1.0;
	return c;
}
#pragma glslify: export(GaussMix9)
