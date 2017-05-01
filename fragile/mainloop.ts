import Engine from "./engine";
import InputMgr from "./inputmgr";
import SceneMgr from "./scenemgr";
import {IScene} from "./scene";
import Loop from "./loop";
import ResStack from "./resstack";
import {RequestAnimationFrame, CancelAnimationFrame} from "./utilfuncs";
import * as G from "./global";
import GLResourceSet from "./gl_resource_set";
import {gl} from "./global";

type Alias_t = {[key: string]: string;};
function _MainLoop<T>(base: string, cbAlias: ()=>void, cbMakeScene: ()=>IScene) {
	G.SetResource(new ResStack(base));
	cbAlias();
	G.SetEngine(new Engine());
	G.SetInput(new InputMgr());
	G.SetScene(new SceneMgr(cbMakeScene(), true));
	G.SetGLRes(new GLResourceSet());
	G.glres.onContextRestored();
}
import Alias from "./_alias";
export function MainLoop<T>(alias: Alias_t, base: string, cbMakeScene: ()=>IScene) {
	_MainLoop(base, ()=> {
		G.resource.addAlias(Alias);
		G.resource.addAlias(alias);
	}, cbMakeScene);

	RequestAnimationFrame(function Loop() {
		const id = RequestAnimationFrame(Loop);
		if(gl.isContextLost())
			return;
		if(!G.scene.onDraw()) {
			CancelAnimationFrame(id);
		}
	});
	const loop = new Loop();
	loop.start(60, (tick: number) => {
		// 最大50msまでの経過時間
		tick = Math.min(50, tick);
		G.input.update();
		if(!G.scene.onUpdate(tick)) {
			loop.stop();
		}
	});
}
export function MainLoop_RF<T>(alias: Alias_t, base: string, cbMakeScene: ()=>IScene) {
	_MainLoop(base, ()=> {
		G.resource.addAlias(Alias);
		G.resource.addAlias(alias);
	}, cbMakeScene);

	let prev = new Date().getTime();
	RequestAnimationFrame(function Loop() {
		RequestAnimationFrame(Loop);

		const now = new Date().getTime();
		// 最大50msまでの経過時間
		const tick = Math.min(50, now - prev);
		prev = now;

		G.input.update();
		G.scene.onUpdate(tick / 1000);
		if(gl.isContextLost())
			return;
		G.scene.onDraw();
	});
}
