import Vec2 from "./vector2";
import Vec3 from "./vector3";
import Vec4 from "./vector4";
import Size from "./size";
import Rect from "./rect";
import Range from "./range";
import Geometry from "./geometry";
import GLVBuffer from "./gl_vbuffer";
import GLIBuffer from "./gl_ibuffer";
import GLTexture2D from "./gl_texture2d";
import {Primitive, DrawType} from "./gl_const";
import {GetLine} from "./utilfuncs";
import {engine} from "./global";

class PlaneSingleDraw implements Geometry {
	readonly vbuffer: {[key: string]: GLVBuffer;};
	readonly ibuffer: GLIBuffer;
	readonly type: Primitive;
	readonly texture: GLTexture2D;
	constructor(src: PlaneSingle) {
		const vbP = new GLVBuffer();
		vbP.setVectorData(src.position, DrawType.Static, true);
		const vbU = new GLVBuffer();
		vbU.setVectorData(src.uv, DrawType.Static, true);
		const ib = new GLIBuffer();
		ib.setData(new Uint16Array(src.index), 1, DrawType.Static, true);
		const vbT = new GLVBuffer();
		vbT.setData(new Float32Array(src.time), 1, DrawType.Static, true);

		this.texture = src.texture;
		this.vbuffer = {
			a_position: vbP,
			a_uv: vbU,
			a_time: vbT,
		};
		this.ibuffer = ib;
		this.type = Primitive.Triangles;
	}
	draw(offset: Vec2, time: number, timeDelay: number, alpha: number): void {
		engine.setUniform("u_texture", this.texture);
		const s = engine.size();
		engine.setUniform("u_screenSize", new Vec2(s.width, s.height));
		engine.setUniform("u_offset", offset);
		engine.setUniform("u_time", time);
		engine.setUniform("u_alpha", alpha);
		engine.setUniform("u_delay", timeDelay);
		engine.drawGeometry(this);
	}
}
import FontChar from "./fontchar";
class PlaneSingle {
	readonly texture: GLTexture2D;
	readonly position: Vec2[];
	readonly uv: Vec4[];
	readonly time: number[];
	index: number[];
	private _accumTime: number;
	readonly _tpix: Vec2;
	constructor(tex: GLTexture2D) {
		this.texture = tex;
		this.position = [];
		this.uv = [];
		this.time = [];
		this.index = [];
		this._accumTime = 0;		// 総時間
		const s = tex.size();
		this._tpix = new Vec2(0.5/s.width, 0.5/s.height);
	}
	add(ofs: Vec2, fc: FontChar, t: number): void {
		const fw = <number>fc.width;
		const fh = <Range>fc.height;
		const idxBase = this.position.length;
		{
			const pos = this.position;
			pos.push(new Vec2(ofs.x+0.5,		ofs.y+fh.from+0.5));
			pos.push(new Vec2(ofs.x+fw-0.5,		ofs.y+fh.from+0.5));
			pos.push(new Vec2(ofs.x+0.5,		ofs.y+fh.to-0.5));
			pos.push(new Vec2(ofs.x+fw-0.5,		ofs.y+fh.to-0.5));
		}
		{
			// [xy=テクスチャuv, zw=ローカルUV]
			const uv = this.uv;
			const r = <Rect>fc.uvrect;
			const tp = this._tpix;
			uv.push(new Vec4(r.left+tp.x,	r.bottom+tp.y,	0,		1));
			uv.push(new Vec4(r.right-tp.x,	r.bottom+tp.y,	1,		1));
			uv.push(new Vec4(r.left+tp.x,	r.top-tp.y,		0,		0));
			uv.push(new Vec4(r.right-tp.x,	r.top-tp.y,		1,		0));
		}
		{
			const time = this.time;
			for(let i=0 ; i<4; i++)
				time.push(t);
		}
		this.index = this.index.concat([
			idxBase+0,
			idxBase+1,
			idxBase+3,
			idxBase+0,
			idxBase+3,
			idxBase+2
		]);
	}
	makeBuffer() {
		return new PlaneSingleDraw(this);
	}
}
export interface CharPlaceResult {
	length: number;
	plane: PlaneSingleDraw[];
	inplace: boolean;
	resultSize: Size;
}
// 行毎に文字列を配置
export function CharPlaceLines(fp: FontChar[], lineH: number, width: number): CharPlaceResult[] {
	const ret = [];
	let cur = 0;
	while(cur < fp.length) {
		const to = GetLine(fp, cur);
		if(cur !== to) {
			const fpL = CharPlace(fp, lineH, new Size(width, 512), cur, to);
			ret.push(fpL);
		} else {
			const empty = {
				length: 0,
				plane: [],
				inplace: true,
				resultSize: new Size(0,0),
			};
			ret.push(empty);
		}
		cur = to+1;
	}
	return ret;
}
// 指定された矩形に文字列を配置
export function CharPlace(fp: FontChar[], lineH: number, size: Size, from: number=0, to:number=fp.length): CharPlaceResult {
	// {[texture]: PlaneSingle}
	const vi = new Map();
	const cur = new Vec2(0,0);
	const nl = ()=> {
		cur.x = 0;
		cur.y += lineH;
		if(cur.y+lineH > size.height) {
			return false;
		}
		resultSize.height += lineH;
		return true;
	};
	let time = 0;
	// 実際に配置された矩形サイズ
	const resultSize = new Size(0,0);
	// 引数の矩形に収まったかのフラグ
	let inPlace = true;
	Place: for(let i=from ; i<to ; i++) {
		const f = fp[i];
		if(f.chara) {
			// 通常の文字コード
			// 枠を越えるなら改行
			if(cur.x+<number>f.width > size.width) {
				if(!nl()) {
					inPlace = false;
					break Place;
				}
			}
			let ps;
			if(vi.has(f.texture))
				ps = vi.get(f.texture);
			else {
				ps = new PlaneSingle(<GLTexture2D>f.texture);
				vi.set(f.texture, ps);
			}
			ps.add(cur, f, time++);
			cur.x += <number>f.width;
			resultSize.width = Math.max(resultSize.width, cur.x);
		} else {
			// 制御文字
			switch(f.char) {
			case "\n":
				// 改行
				if(!nl()) {
					inPlace = false;
					break Place;
				}
				break;
			}
		}
	}
	resultSize.height += lineH;
	// 配列に詰め直し
	const plane = [];
	const itr = vi.entries();
	for(;;) {
		const ent = itr.next();
		if(ent.done)
			break;
		plane.push(ent.value[1].makeBuffer());
	}
	return {
		length: time,
		plane: plane,
		inplace: inPlace,
		resultSize: resultSize,
	};
}
