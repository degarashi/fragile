import Font from "./font";
import RPFontCtx from "./resourcegen/fontctx";
import RPFontHeight from "./resourcegen/fontheight";
import ResourceGen from "./resourcegen";
import Vec2 from "./vector2";
import DObject from "./dobject";
import FontGen from "./fontgen";
import {CharPlaceResult, CharPlaceLines, CharPlace} from "./charplace";
import Size from "./size";
import Refresh from "./refresh";
import "./resourcegen/text";

// スクリーン上に配置するテキスト
/*
	[shader requirements]
	attribute {
		vec2 a_position;
		vec4 a_uv;
		float a_time;
	}
	uniform {
		float u_time;
		float u_alpha;
		float u_delay;
		vec2 u_offset;
		vec2 u_screenSize;
		sampler2D u_texture;
	}
*/
export class Text extends Refresh {
	static TagFont = "font";
	static TagText = "text";
	static TagSize = "size";
	static TagFontHeight = "fontheight";
	static TagFontGen = "fontgen";
	static TagFontPlane = "fontplane";
	static TagLength = "length";
	constructor() {
		super({
			[Text.TagFont]: null,
			[Text.TagText]: null,
			[Text.TagSize]: null,
			[Text.TagFontHeight]: [Text.TagFont],
			[Text.TagFontGen]: [Text.TagFontHeight],
			[Text.TagFontPlane]: [Text.TagFontHeight, Text.TagFontGen, Text.TagText, Text.TagSize],
			[Text.TagLength]: [Text.TagFontPlane],
		});
		this.setFont(new Font("arial", "30pt", "100", false));
		this.setText("DefaultText");
		this.setSize(new Size(512,512));
	}
	setFont(f: Font): void { this.set(Text.TagFont, f); }
	setText(t: string): void { this.set(Text.TagText, t); }
	setSize(r: Size): void { this.set(Text.TagSize, r); }
	font(): Font { return this.get(Text.TagFont); }
	text(): string { return this.get(Text.TagText); }
	size(): Size { return this.get(Text.TagSize); }
	fontplane(): CharPlaceResult { return this.get(Text.TagFontPlane); }
	length() { return this.fontplane().length; }
	resultSize() { return this.fontplane().resultSize; }
	fontHeight(): Range { return this.get(Text.TagFontHeight); }
	fontGen(): FontGen { return this.get(Text.TagFontGen); }

	_refresh_fontheight() {
		return ResourceGen.get(new RPFontHeight(this.font()));
	}
	_refresh_fontgen() {
		const fh = this.fontHeight();
		return new FontGen(512, 512, fh.width());
	}
	_makeFontA() {
		const fh = this.fontHeight();
		const gen = this.fontGen();
		const ctx = ResourceGen.get(new RPFontCtx("fontcanvas"));
		ctx.font = this.font().fontstr();
		return {
			fontA: gen.get(this.text(), ctx, fh),
			fh: fh
		};
	}
	_refresh_fontplane(): any {
		const fa = this._makeFontA();
		return CharPlace(fa.fontA, fa.fh.to, this.size());
	}
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number) {
		engine.setTechnique("text");
		const plane = this.fontplane().plane;
		for(let i=0 ; i<plane.length ; i++) {
			plane[i].draw(offset, time, timeDelay, alpha);
		}
	}
}
import Range from "./range";
export class TextLines extends Text {
	// 行ディレイ(1行毎に何秒遅らせるか)
	lineDelay: number = 0;

	_refresh_fontplane(): any {
		const fa = super._makeFontA();
		return CharPlaceLines(fa.fontA, fa.fh.to, this.size().width);
	}
	length(): number {
		const fps = <CharPlaceResult[]>this.get("fontplane");
		if(fps.length === 0)
			return 0;
		let len:number = 0;
		for(let i=0 ; i<fps.length ; i++) {
			len = Math.max(len, fps[i].length + this.lineDelay*i);
		}
		return len;
	}
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number) {
		engine.setTechnique("text");
		const fh = this.fontHeight();
		const ps = <CharPlaceResult[]>this.get("fontplane");
		offset = offset.clone();
		for(let k=0 ; k<ps.length ; k++) {
			const plane = ps[k].plane;
			for(let i=0 ; i<plane.length ; i++) {
				plane[i].draw(offset, time, timeDelay, alpha);
				offset.y += fh.to;
				time -= this.lineDelay;
			}
		}
	}
}

import {engine} from "./global";
export default class TextDraw extends DObject {
	text: Text;
	time: number;
	offset: Vec2;
	alpha: number;
	delay: number;

	constructor(text: Text) {
		super();
		this.text = text;
		this.time = 0;
		this.offset = new Vec2(0,0);
		this.alpha = 1;
		this.delay = 8;
	}
	endTime(): number {
		return this.text.length() + this.delay;
	}
	advance(dt: number): boolean {
		if(this.time >= this.endTime()) {
			return true;
		}
		this.time += dt;
		return false;
	}
	onUpdate(dt: number): boolean {
		if(super.onUpdate(dt)) {
			engine.setTechnique("text");
			this.text.draw(this.offset, this.time, this.delay, this.alpha);
			return true;
		}
		return false;
	}
}
