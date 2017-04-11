import GLFramebuffer from "../gl_framebuffer";
import DObject from "../dobject";
import Drawable from "../drawable";
import {gl} from "../global";
import Rect from "../rect";
import {Attachment} from "../gl_const";
import Size from "../size";
import Vec2 from "../vector2";

interface VPSet {
	getPixelRect(s: Size): Rect;
}
// 割合による矩形指定
class VPRatio implements VPSet {
	constructor(public rect: Rect) {}
	getPixelRect(s: Size): Rect {
		return this.rect.mul(new Vec2(s.width, s.height));
	}
}
// ピクセルによる矩形指定
class VPPixel implements VPSet {
	constructor(public rect: Rect) {}
	getPixelRect(s: Size): Rect {
		return this.rect;
	}
}
interface ISize {
	size(): Size;
}
import GLTexture2D from "../gl_texture2d";
export default class FBSwitch extends DObject implements Drawable {
	lower: Drawable;
	private _vpset: VPSet;

	constructor(public buffer: GLFramebuffer) {
		super();
		this.setVPByRatio(new Rect(0,0,1,1));
	}
	setVPByPixel(r: Rect): void {
		this._vpset = new VPPixel(r);
	}
	setVPByRatio(r: Rect): void {
		this._vpset = new VPRatio(r);
	}
	private _setViewport(r: Rect) {
		gl.viewport(r.left, r.top, r.width(), r.height());
	}
	private _getViewport(): Rect {
		const vpA = <Int32Array>gl.getParameter(gl.VIEWPORT);
		return new Rect(vpA[0], vpA[1], vpA[0]+vpA[2], vpA[1]+vpA[3]);
	}
	onDraw(): void {
		const c0 = this.buffer.getAttachment(Attachment.Color0);
		if(c0) {
			// 前のビューポートを保存しておく
			const prev = this._getViewport();
			{
				const r = <ISize>c0;
				const vp = this._vpset.getPixelRect(r.size());
				this._setViewport(vp);
				this.buffer.proc(()=> {
						this.lower.onDraw();
						});
			}
			// 前のビューポートを復元
			this._setViewport(prev);
		}
	}
}
