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
export default class Text {
	protected _rf: Refresh;
	static readonly TagFont = "font";
	static readonly TagText = "text";
	static readonly TagSize = "size";
	static readonly TagFontHeight = "fontheight";
	static readonly TagFontGen = "fontgen";
	static readonly TagFontPlane = "fontplane";
	static readonly TagLength = "length";
	static readonly TagResultSize = "resultsize";
	constructor() {
		this._rf = new Refresh({
			[Text.TagFont]: null,
			[Text.TagText]: null,
			[Text.TagSize]: null,
			[Text.TagFontHeight]: {
				depend: [Text.TagFont],
				func: (prev: any)=> {
					return (<ResourceWrap<Range>>ResourceGen.get(new RPFontHeight(this.font()))).data;
				}
			},
			[Text.TagFontGen]: {
				depend: [Text.TagFontHeight],
				func: (prev: any)=> {
					const fh = this.fontHeight();
					return new FontGen(512, 512, fh.width());
				}
			},
			[Text.TagFontPlane]: {
				depend: [Text.TagFontHeight, Text.TagFontGen, Text.TagText, Text.TagSize],
				func: (prev: any)=> {
					const fa = this._makeFontA();
					return CharPlace(fa.fontA, fa.fh.to, this.size());
				}
			},
			[Text.TagLength]: {
				depend: [Text.TagFontPlane],
				func: (prev: any)=> {
					return this.fontplane().length;
				}
			},
			[Text.TagResultSize]: {
				depend: [Text.TagFontPlane],
				func: (prev: any)=> {
					return this.fontplane().resultSize;
				}
			}
		});
		this.setFont(new Font("arial", "30pt", "100", false));
		this.setText("DefaultText");
		this.setSize(new Size(512,512));
	}
	setFont(f: Font): void { this._rf.set(Text.TagFont, f); }
	setText(t: string): void { this._rf.set(Text.TagText, t); }
	setSize(r: Size): void { this._rf.set(Text.TagSize, r); }
	font(): Font { return this._rf.get(Text.TagFont); }
	text(): string { return this._rf.get(Text.TagText); }
	size(): Size { return this._rf.get(Text.TagSize); }
	fontplane(): CharPlaceResult { return this._rf.get(Text.TagFontPlane); }
	length() { return this.fontplane().length; }
	resultSize() { return this._rf.get(Text.TagResultSize); }
	fontHeight(): Range { return this._rf.get(Text.TagFontHeight); }
	fontGen(): FontGen { return this._rf.get(Text.TagFontGen); }

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
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number) {
		const plane = this.fontplane().plane;
		for(let i=0 ; i<plane.length ; i++) {
			plane[i].draw(offset, time, timeDelay, alpha);
		}
	}
}
