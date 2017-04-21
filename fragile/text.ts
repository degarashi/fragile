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

class Tag {
	static readonly Font = "font";
	static readonly Text = "text";
	static readonly Size = "size";
	static readonly FontHeight = "fontheight";
	static readonly FontGen = "fontgen";
	static readonly FontPlane = "fontplane";
	static readonly Length = "length";
	static readonly ResultSize = "resultsize";
}
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
	static readonly Tag = Tag;
	constructor() {
		this._rf = new Refresh({
			[Tag.Font]: null,
			[Tag.Text]: null,
			[Tag.Size]: null,
			[Tag.FontHeight]: {
				depend: [Tag.Font],
				func: (prev: any)=> {
					return (<ResourceWrap<Range>>ResourceGen.get(new RPFontHeight(this.font()))).data;
				}
			},
			[Tag.FontGen]: {
				depend: [Tag.FontHeight],
				func: (prev: any)=> {
					const fh = this.fontHeight();
					return new FontGen(512, 512, fh.width());
				}
			},
			[Tag.FontPlane]: {
				depend: [Tag.FontHeight, Tag.FontGen, Tag.Text, Tag.Size],
				func: (prev: any)=> {
					const fa = this._makeFontA();
					return CharPlace(fa.fontA, fa.fh.to, this.size());
				}
			},
			[Tag.Length]: {
				depend: [Tag.FontPlane],
				func: (prev: any)=> {
					return this.fontplane().length;
				}
			},
			[Tag.ResultSize]: {
				depend: [Tag.FontPlane],
				func: (prev: any)=> {
					return this.fontplane().resultSize;
				}
			}
		});
		this.setFont(new Font("arial", "30pt", "100", false));
		this.setText("DefaultText");
		this.setSize(new Size(512,512));
	}
	setFont(f: Font): void { this._rf.set(Tag.Font, f); }
	setText(t: string): void { this._rf.set(Tag.Text, t); }
	setSize(r: Size): void { this._rf.set(Tag.Size, r); }
	font(): Font { return this._rf.get(Tag.Font); }
	text(): string { return this._rf.get(Tag.Text); }
	size(): Size { return this._rf.get(Tag.Size); }
	fontplane(): CharPlaceResult { return this._rf.get(Tag.FontPlane); }
	length() { return this.fontplane().length; }
	resultSize() { return this._rf.get(Tag.ResultSize); }
	fontHeight(): Range { return this._rf.get(Tag.FontHeight); }
	fontGen(): FontGen { return this._rf.get(Tag.FontGen); }

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
