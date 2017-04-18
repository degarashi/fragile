import Clear from "./clear";
import {MainLoop_RF, LoadingScene} from "./mainloop";
import Scene from "./scene";
import State from "./state";
import FPSCamera from "./fpscamera";
import {PSpriteDraw} from "./psprite";
import Text from "./text";
import Size from "./size";
import Vec2 from "./vector2";
import Vec4 from "./vector4";
import {engine, resource} from "./global";
import "./resource_loaddef/json";
import "./resource_loaddef/shader";
import "./resource_loaddef/technique";
import "./resource_loaddef/image";
import TextDraw from "./textdraw";
import TextLines from "./textlines";
import {GetPowValue, PlaceCenter} from "./utilfuncs";

import GLTexture2DP from "./gl_texture2dp";
import GLFramebuffer from "./gl_framebuffer";
import GLRenderbuffer from "./gl_renderbuffer";
import {Attachment, RBFormat, InterFormat, TexDataFormat} from "./gl_const";
import FullRect from "./fullrect";
import FBSwitch from "./drawutil/fb_switch";
import DrawGroup from "./drawgroup";
import DataSwitch from "./dataswitch";
import GaussFilter from "./gauss";

// particle dance
class StParticle extends State<MyScene> {
	private _alpha: number;
	private _psp: PSpriteDraw;
	private _fr: FullRect;
	private _fr_m: FullRect;
	private _size: Size;
	private _fb: GLFramebuffer = new GLFramebuffer();
	private readonly _cb = [new GLTexture2DP(), new GLTexture2DP()];
	private readonly _rb = new GLRenderbuffer();
	private readonly _tex = new DataSwitch<GLTexture2DP>(this._cb[0], this._cb[1]);
	private _gauss: GaussFilter;

	private _allocateBuffer(size: Size) {
		this._size = size;
		for(let i=0 ; i<2 ; i++) {
			this._cb[i].setData(InterFormat.RGBA, size.width, size.height, InterFormat.RGBA, TexDataFormat.UB);
			this._cb[i].setLinear(true, true, 0);
		}
		// Depth16
		this._rb.allocate(RBFormat.Depth16, GetPowValue(size.width),GetPowValue(size.height));
	}

	onEnter(self: MyScene, prev:State<MyScene>): void {
		// 残像用のフレームバッファ
		this._allocateBuffer(engine.size());
		this._fb.attach(Attachment.Depth, this._rb);

		const dg_m = new DrawGroup();
		{
			const cls = new Clear(new Vec4(0,0,0,1), 1.0);
			cls.drawtag.priority = 0;
			dg_m.group.add(cls);
		}
		// パーティクル初期化
		{
			const psp = new PSpriteDraw(1000);
			psp.drawtag.priority = 10;
			psp.alpha = 0;
			dg_m.group.add(psp);
			this._alpha = 0;
			this._psp = psp;
		}
		// 残像上書き
		{
			const fr = new FullRect();
			fr.drawtag.priority = 20;
			fr.alpha = 0.85;
			fr.alphablend = true;
			dg_m.group.add(fr);
			this._fr_m = fr;
		}
		const dg = new DrawGroup();
		{
			const fbw = new FBSwitch(this._fb);
			fbw.drawtag.priority = 0;
			fbw.lower = dg_m;
			dg.group.add(fbw);
		}
		{
			const gf = new GaussFilter();
			this._gauss = gf;
			gf.setDispersion(50.1);
			gf.drawtag.priority = 5;
			dg.group.add(gf);
		}
		// 結果表示
		{
			const fr = new FullRect();
			fr.drawtag.priority = 10;
			fr.alpha = 1.0;
			fr.alphablend = false;
			dg.group.add(fr);
			this._fr = fr;
		}
		this._fr.texture = this._gauss.result();
		self.drawTarget = dg;
	}
	onUpdate(self: MyScene, dt: number): void {
		const size = engine.size();
		if(!this._size.equal(size)) {
			this._allocateBuffer(size);
		}
		this._tex.swap();
		this._fb.attach(Attachment.Color0, this._tex.current());
		this._fr_m.texture = this._tex.prev();
		this._gauss.setSource(this._tex.current());

		this._alpha += dt/2;
		this._psp.advance(dt);
		this._psp.alpha = Math.min(1, this._alpha);
	}
}
class StFadeout extends State<MyScene> {
	private _alpha: number;

	onEnter(self: MyScene, prev: State<MyScene>): void {
		this._alpha = 1;
	}
	onUpdate(self: MyScene, dt: number): void {
		this._alpha -= dt;
		self._text.alpha = this._alpha;
		if(this._alpha < 0)
			self.setState(new StParticle());
	}
}
import {DrawSort} from "./drawsort";
// show "HELLO WORLD"
class StText extends State<MyScene> {
	onUp(self: MyScene): void {
		const text = new TextLines(3);
		const str = "HELLO WORLD\n\nwith\nWebGL";
		text.setText(str);
		text.setSize(new Size(512, 512));
		const delay = 8;
		const t = new TextDraw(text, delay);
		t.drawtag.priority = 10;
		const rs = text.resultSize();
		t.offset = PlaceCenter(engine.size(), rs);

		self.asDrawGroup().group.add(t);
		self._text = t;

		const fpsc = new FPSCamera();
		engine.sys3d().camera = fpsc.camera;
		self.asUpdateGroup().group.add(fpsc);
		engine.addTechnique(resource.getResource("prog"));
		const cls = new Clear(new Vec4(0,0,0,1));
		cls.drawtag.priority = 0;
		self.asDrawGroup().group.add(cls);
		self.asDrawGroup().setSortAlgorithm(DrawSort.Priority);
	}
	onUpdate(self: MyScene, dt: number): void {
		if(self._text.advance(dt*15)) {
			self.setState(new StFadeout());
		}
	}
}
class MyScene extends Scene<MyScene> {
	_text: TextDraw;
}
import Alias from "./_alias";
window.onload = function() {
	const base = ".";
	const res = ["sphere", "prog"];
	const sc = new MyScene(0, new StText());
	MainLoop_RF(Alias, base, ()=> {
		return new LoadingScene(res, sc);
	});
};
