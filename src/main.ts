import Clear from "./clear";
import {MainLoop_RF, LoadingScene} from "./mainloop";
import Scene from "./scene";
import State from "./state";
import FPSCamera from "./fpscamera";
import {PSpriteDraw} from "./psprite";
import {default as TextDraw, Text} from "./text";
import Size from "./size";
import Vec2 from "./vector2";
import Vec4 from "./vector4";
import {engine, resource} from "./global";
import "./resource_loaddef/json";
import "./resource_loaddef/shader";
import "./resource_loaddef/technique";
import "./resource_loaddef/image";

// particle dance
class StParticle extends State<MyScene> {
	private _alpha: number;
	private _psp: PSpriteDraw;

	onEnter(self: MyScene, prev:State<MyScene>): void {
		const psp = new PSpriteDraw();
		psp.alpha = 0;
		self.drawGroup().add(psp);
		this._alpha = 0;
		this._psp = psp;
	}
	onUpdate(self: MyScene, dt: number): boolean {
		this._alpha += dt/2;
		this._psp.advance(dt);
		this._psp.alpha = Math.min(1, this._alpha);
		return true;
	}
}
class StFadeout extends State<MyScene> {
	private _alpha: number;

	onEnter(self: MyScene, prev: State<MyScene>): void {
		this._alpha = 1;
	}
	onUpdate(self: MyScene, dt: number): boolean {
		this._alpha -= dt;
		self._text.alpha = this._alpha;
		if(this._alpha < 0)
			self.setState(new StParticle());
		return true;
	}
}
// show "HELLO WORLD"
class StText extends State<MyScene> {
	onUp(self: MyScene): void {
		const t = new TextDraw(new Text());
		t.priority = 10;
		const str = "HELLO WORLD";
		t.text.setText(str);
		t.text.setSize(new Size(1024, 512));
		const rs = t.text.resultSize();
		const w = engine.width(),
			h = engine.height();
		t.offset = new Vec2(
			Math.floor(w/2 - rs.width/2),
			Math.floor(h/2 - rs.height/2)
		);

		self.drawGroup().add(t);
		self._text = t;

		const fpsc = new FPSCamera();
		engine.sys3d().camera = fpsc.camera;
		self.updateGroup().add(fpsc);
		engine.addTechnique(resource.getResource("prog"));
		self.drawGroup().add(new Clear(0, new Vec4(0,0,0,1)));
	}
	onUpdate(self: MyScene, dt: number): boolean {
		if(self._text.advance(dt*15)) {
			self.setState(new StFadeout());
		}
		return true;
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
