import Font from "./font";
import RPFontCtx from "./resourcegen/fontctx";
import RPFontHeight from "./resourcegen/fontheight";
import ResourceGen from "./resourcegen";
import Vec2 from "./vector2";
import FontGen from "./fontgen";
import {CharPlaceResult, CharPlace} from "./charplace";
import Size from "./size";
import Refresh from "./refresh";
import "./resourcegen/text";
import ResourceWrap from "./resource_wrap";
import Range from "./range";
import {engine} from "./global";

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
export default class Text extends Refresh {
	static TagFont = "font";
	static TagText = "text";
	static TagSize = "size";
	static TagFontHeight = "fontheight";
	static TagFontGen = "fontgen";
	static TagFontPlane = "fontplane";
	static TagLength = "length";
	static TagResultSize = "resultsize";
	constructor() {
		super({
			[Text.TagFont]: null,
			[Text.TagText]: null,
			[Text.TagSize]: null,
			[Text.TagFontHeight]: [Text.TagFont],
			[Text.TagFontGen]: [Text.TagFontHeight],
			[Text.TagFontPlane]: [Text.TagFontHeight, Text.TagFontGen, Text.TagText, Text.TagSize],
			[Text.TagLength]: [Text.TagFontPlane],
			[Text.TagResultSize]: [Text.TagFontPlane]
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
	resultSize() { return this.get(Text.TagResultSize); }
	fontHeight(): Range { return this.get(Text.TagFontHeight); }
	fontGen(): FontGen { return this.get(Text.TagFontGen); }

	_refresh_fontheight() {
		return (<ResourceWrap<Range>>ResourceGen.get(new RPFontHeight(this.font()))).data;
	}
	_refresh_fontgen() {
		const fh = this.fontHeight();
		return new FontGen(512, 512, fh.width());
	}
	_refresh_resultsize(): Size {
		return this.fontplane().resultSize;
	}
	_makeFontA() {
		const fh = this.fontHeight();
		const gen = this.fontGen();
		const ctx = <ResourceWrap<CanvasRenderingContext2D>>ResourceGen.get(new RPFontCtx("fontcanvas"));
		ctx.data.font = this.font().fontstr();
		return {
			fontA: gen.get(this.text(), ctx.data, fh),
			fh: fh
		};
	}
	_refresh_fontplane(): any {
		const fa = this._makeFontA();
		return CharPlace(fa.fontA, fa.fh.to, this.size());
	}
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number) {
		const plane = this.fontplane().plane;
		for(let i=0 ; i<plane.length ; i++) {
			plane[i].draw(offset, time, timeDelay, alpha);
		}
	}
}
