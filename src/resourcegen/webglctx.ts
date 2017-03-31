import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import RPCanvas from "./canvas";
import ResourceParam from "./param";

export default class RPWebGLCtx implements ResourceParam {
	constructor(public canvasId: string) {}
	get name() { return "WebGL"; }
	get key() { return `WebGL_${this.canvasId}`; }
}

ResourceGenSrc.WebGL = function(rp: RPWebGLCtx): WebGLRenderingContext|null {
	const canvas = ResourceGen.get(new RPCanvas(rp.canvasId));
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
		const gl = canvas.getContext(webgl_text[i], param);
		if(gl)
			return gl;
	}
	return null;
};
