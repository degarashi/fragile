void UV9(
	out vec4 dst[4],			// [(0)x,y | (1)z,w]
	out vec2 dstC,
	const vec2 uv,				// 基準となるUV座標
	const vec2 mapWidthInv,		// テクスチャサイズ逆数
	const vec2 initDiff,		// 初回の1テクセルをずらす距離
	const vec2 diff				// 1テクセル毎にずらす距離
) {
	dstC = uv;
	vec2 cur = uv + initDiff * mapWidthInv;
	vec2 td = diff * mapWidthInv;
	dst[0].xy = cur;
	cur += td;
	dst[0].zw = cur;
	cur += td;
	dst[1].xy = cur;
	cur += td;
	dst[1].zw = cur;
	cur += td;
	dst[2].xy = cur;
	cur += td;
	dst[2].zw = cur;
	cur += td;
	dst[3].xy = cur;
	cur += td;
	dst[3].zw = cur;
}
#pragma glslify: export(UV9)
