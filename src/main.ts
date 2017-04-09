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
import {PlaceCenter} from "./utilfuncs";

// particle dance
class StParticle extends State<MyScene> {
	private _alpha: number;
	private _psp: PSpriteDraw;

	onEnter(self: MyScene, prev:State<MyScene>): void {
		const psp = new PSpriteDraw();
		psp.alpha = 0;
		self.asDrawGroup().group.add(psp);
		this._alpha = 0;
		this._psp = psp;
	}
	onUpdate(self: MyScene, dt: number): void {
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
		const str = "HELLO WORLD\n\nfrom\nWebGL";
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
