import {default as ResourceGen, ResourceGenSrc} from "../resourcegen";
import RP_FontCtx from "./fontctx";
import ResourceParam from "./param";
import Range from "../range";
import Font from "../font";

ResourceGenSrc.FontHeight = function(rp: RPFontHeight) {
	const c = ResourceGen.get(new RP_FontCtx("fontcanvas"));
	c.font = rp.font.fontstr();

	const canvas = c.canvas;
	const cw = canvas.width,
		ch = canvas.height;
	c.fillStyle = "black";
	c.fillRect(0,0, cw, ch);
	c.fillStyle = "white";
	c.fillText("あいうえおAEglq", 0, 0);
	const fw = c.measureText("Eg").width;
	const pixels = c.getImageData(0, 0, fw, ch);

	let top:number=0, bottom:number=ch;
	// Find top border
	Top: for(let i=0 ; i<ch ; i++) {
		const idx = pixels.width*i * 4;
		for(let j=0 ; j<pixels.width ; j++) {
			if(pixels.data[idx+j*4] !== 0) {
				// found top border
				top = i;
				break Top;
			}
		}
	}
	// Find bottom border
	Bottom: for(let i=ch-1 ; i>=0 ; i--) {
		const idx = pixels.width*i * 4;
		for(let j=0 ; j<pixels.width ; j++) {
			if(pixels.data[idx+j*4] !== 0) {
				// found bottom border
				bottom = i;
				break Bottom;
			}
		}
	}
	return new Range(top, bottom+1);
};
export default class RPFontHeight implements ResourceParam {
	constructor(public font: Font) {}
	get name() { return "FontHeight"; }
	get key() {
		return `FontHeight_${this.font.fontstr()}`;
	}
}
