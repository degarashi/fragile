import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import RPCanvas from "./canvas";
import RPWebGLCtx from "./webglctx";
import Resource from "../resource";
import ResourceWrap from "../resource_wrap";

ResourceGenSrc.FontCtx = function(rp: RPWebGLCtx): Resource {
	const c = <ResourceWrap<HTMLCanvasElement>>ResourceGen.get(new RPCanvas(rp.canvasId));
	// 後で変える
	c.data.width = c.data.height = 512;
	const ctx = <CanvasRenderingContext2D>c.data.getContext("2d");
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	return new ResourceWrap<CanvasRenderingContext2D>(ctx);
};
export default class extends RPWebGLCtx {
	get name() { return "FontCtx"; }
	get key() { return `FontCtx_${this.canvasId}`; }
}
