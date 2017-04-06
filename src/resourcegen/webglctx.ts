import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import RPCanvas from "./canvas";
import ResourceParam from "./param";
import Resource from "../resource";
import ResourceWrap from "../resource_wrap";

export default class RPWebGLCtx implements ResourceParam {
	constructor(public canvasId: string) {}
	get name() { return "WebGL"; }
	get key() { return `WebGL_${this.canvasId}`; }
}

ResourceGenSrc.WebGL = function(rp: RPWebGLCtx): Resource {
	const canvas = <ResourceWrap<HTMLCanvasElement>>ResourceGen.get(new RPCanvas(rp.canvasId));
	const param = {
		preserveDrawingBuffer: false
	};
	const webgl_text = [
		"webgl",
		"experimental-webgl",
		"webkit-3d",
		"moz-webgl",
		"3d"
	];
	for(let i=0 ; i<webgl_text.length ; i++) {
		const gl = canvas.data.getContext(webgl_text[i], param);
		if(gl)
			return new ResourceWrap<WebGLRenderingContext>(<WebGLRenderingContext>gl);
	}
	throw Error("webgl not found");
};
