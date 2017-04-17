import GLTexture2D from "./gl_texture2d";
import {InterFormat, TexDataFormat} from "./gl_const";
import {GetPowValue} from "./utilfuncs";
import Size from "./size";
import Rect from "./rect";

// 常に2の乗数サイズで確保されるテクスチャ
export default class GLTexture2DP extends GLTexture2D {
	private _psize: Size = new Size(0,0);

	setData(
		fmt:InterFormat, width:number, height:number,
		srcFmt:InterFormat, srcFmtType:TexDataFormat, pixels?:Uint8Array
	):void
	{
		const pw = GetPowValue(width),
				ph = GetPowValue(height);
		this._psize = new Size(width, height);
		super.setData(fmt, pw, ph, srcFmt, srcFmtType, pixels);
	}
	uvrect(): Rect {
		const ps = this.size();
		const ts = this.truesize();
		return new Rect(0,0, ps.width/ts.width, ps.height/ts.height);
	}
	size(): Size {
		return this._psize;
	}
	truesize(): Size {
		return super.size();
	}
}
