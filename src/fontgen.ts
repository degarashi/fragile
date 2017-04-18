import GLTexture2D from "./gl_texture2d";
import {TexDataFormat, InterFormat} from "./gl_const";
import {Assert} from "./utilfuncs";
import Rect from "./rect";
import Range from "./range";
import Size from "./size";
import {gl} from "./global";

// フォントテクスチャのうちの一行分
class FontLane {
	private _width: number;
	private _cur: number;
	// CharCode -> Range(X)
	private _map: {[key: number]: Range;};
	constructor(w: number) {
		this._width = w;
		this._cur = 0;
		this._map = {};
	}
	get(code: number, str: string, ctx:CanvasRenderingContext2D, fw: number, fh: Range, baseY: number, tex: GLTexture2D) {
		// 既に計算してあればそれを返す
		{
			const ret = this._map[code];
			if(ret)
				return ret;
		}
		// これ以上スペースが無ければnull
		if(this._cur + fw > this._width)
			return null;

		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, fw, fh.to);
		ctx.fillStyle = "white";
		ctx.fillText(str, 0, 0);

		const dat = ctx.getImageData(0, fh.from, fw, fh.width());
		const data = dat.data;
		const u8data = new Uint8Array(fw * fh.width());
		for(let i=0 ; i<u8data.length ; i++) {
			u8data[i] = data[i*4];
		}
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		tex.setSubData(
			new Rect(
				this._cur,
				baseY+fh.width(),
				this._cur+fw,
				baseY
			),
			InterFormat.Alpha,
			TexDataFormat.UB,
			u8data
		);
		// キャッシュに格納
		const range = new Range(this._cur, this._cur+fw);
		this._map[code] = range;
		this._cur += fw;
		return range;
	}
}
class FontCacheItem {
	constructor(
		public uvrect: Rect,
		public width: number,
		public height: Range
	) {}
}
// フォントテクスチャ一枚分(Lane複数)
class FontPlane {
	readonly texture: GLTexture2D;
	private _laneH: number;
	private _lane: FontLane[];
	// CharCode -> {UVRect, width, heightR}
	private _map: {[key: number]: FontCacheItem;};
	constructor(w: number, h: number, laneH: number) {
		Assert(h >= laneH);
		this._laneH = laneH;
		// ビットマップを保持するテクスチャ
		const tex = new GLTexture2D();
		tex.setData(InterFormat.Alpha, w, h,
			InterFormat.Alpha, TexDataFormat.UB, undefined);
		tex.setLinear(true, true, 0);
		this.texture = tex;
		// hをlaneHの高さで埋められるだけのサイズ(FontLane)配列
		this._lane = [];
		const nLane = Math.floor(h/laneH);
		for(let i=0 ; i<nLane ; i++) {
			this._lane.push(new FontLane(w));
		}
		this._map = {};
	}
	get(code: number, str: string, ctx: CanvasRenderingContext2D, fw: number, fh: Range): FontCacheItem|null {
		// 既に計算してあればそれを返す
		{
			const ret = this._map[code];
			if(ret)
				return ret;
		}
		const tw = this.texture.size().width,
			th = this.texture.size().height;
		const len = this._lane.length;
		for(let i=0 ; i<len ; i++) {
			const lane = this._lane[i];
			const ret = lane.get(code, str, ctx, fw, fh, i*fh.width(), this.texture);
			if(ret) {
				const rect = new Rect(ret.from, (i+1)*this._laneH, ret.to, i*this._laneH);
				rect.left /= tw;
				rect.top /= th;
				rect.right /= tw;
				rect.bottom /= th;

				const fc = new FontCacheItem(rect, fw, fh);
				return this._map[code] = fc;
			}
		}
		// もう入り切るスペースが無ければnullを返す
		return null;
	}
}
import FontChar from "./fontchar";
// フォントファミリと一体一で対応
class FontCache {
	private _plane: FontPlane[] = [];
	// CharCode -> FontChar
	private _map:{[key: number]: FontChar;} = {};
	constructor(
		private _width: number,
		private _height: number,
		private _laneH: number
	) {
		this._addNewPlane();
	}
	_addNewPlane(): void {
		this._plane.push(new FontPlane(this._width, this._height, this._laneH));
	}
	/*! \param[in] str 対象の文字列(そのうちの一文字分を処理) */
	get(str: string, idx: number, ctx: CanvasRenderingContext2D, fh: Range): FontChar {
		const code = str.charCodeAt(idx);
		// 既に計算してあればそれを返す
		{
			const ret = this._map[code];
			if(ret)
				return ret;
		}
		const sstr = str.substr(idx, 1);
		const fw = Math.ceil(ctx.measureText(sstr).width)+2;
		let ret;
		for(;;) {
			ret = this._plane.back().get(code, sstr, ctx, fw, fh);
			if(ret)
				break;
			this._addNewPlane();
		}
		// キャッシュに登録
		ret = {
			texture: this._plane.back().texture,
			uvrect: ret.uvrect,
			width: ret.width,
			height: ret.height,
			chara: true,
			char: str.charAt(idx),
			code: code
		};
		this._map[code] = ret;
		return ret;
	}
}
export default class FontGen {
	private _cache: FontCache;
	constructor(w: number, h: number, laneH: number) {
		this._cache = new FontCache(w, h, laneH);
	}
	// \return [{texture,uvrect,height,width}, ...]
	get(str: string, ctx: CanvasRenderingContext2D, fh: Range): FontChar[] {
		const ret:FontChar[] = [];
		for(let i=0 ; i<str.length ; i++) {
			const ch = str.charAt(i);
			switch(ch) {
			case "\n":
				ret.push({
					chara: false,
					char: ch,
					code: str.charCodeAt(i)
				});
				break;
			default:
				ret.push(this._cache.get(str, i, ctx, fh));
			}
		}
		return ret;
	}
}
