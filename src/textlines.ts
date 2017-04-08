import Text from "./text";
import {CharPlaceResult, CharPlaceLines} from "./charplace";
import Size from "./size";
import {engine} from "./global";
import Vec2 from "./vector2";

export default class TextLines extends Text {
	// 行ディレイ(1行毎に何秒遅らせるか)
	readonly lineDelay: number = 0;

	constructor(lineDelay: number) {
		super();
		this.lineDelay = lineDelay;
	}
	_refresh_fontplane(): any {
		const fa = super._makeFontA();
		return CharPlaceLines(fa.fontA, fa.fh.to, this.size().width);
	}
	_refresh_resultsize(): Size {
		const fp = <CharPlaceResult[]>this.get(Text.TagFontPlane);
		const ret = new Size(0,0);
		for(let i=0 ; i<fp.length ; i++) {
			ret.width = Math.max(ret.width, fp[i].resultSize.width);
			ret.height += this.fontHeight().to;
		}
		return ret;
	}
	length(): number {
		const fps = <CharPlaceResult[]>this.get(Text.TagFontPlane);
		if(fps.length === 0)
			return 0;
		let len:number = 0;
		for(let i=0 ; i<fps.length ; i++) {
			len = Math.max(len, fps[i].length + this.lineDelay*i);
		}
		return len;
	}
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number) {
		const fh = this.fontHeight();
		const ps = <CharPlaceResult[]>this.get(Text.TagFontPlane);
		offset = offset.clone();
		for(let k=0 ; k<ps.length ; k++) {
			const plane = ps[k].plane;
			for(let i=0 ; i<plane.length ; i++) {
				plane[i].draw(offset, time, timeDelay, alpha);
				time -= this.lineDelay;
			}
			offset.y += fh.to;
		}
	}
}
