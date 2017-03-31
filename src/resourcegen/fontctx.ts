import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import RPCanvas from "./canvas";
import RPWebGLCtx from "./webglctx";

ResourceGenSrc.FontCtx = function(rp: RPWebGLCtx) {
	const c = ResourceGen.get(new RPCanvas(rp.canvasId));
	// 後で変える
	c.width = c.height = 512;
	const ctx = c.getContext("2d");
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	return ctx;
};
export default class extends RPWebGLCtx {
	get name() { return "FontCtx"; }
	get key() { return `FontCtx_${this.canvasId}`; }
}
