import Engine from "./engine";
import InputMgr from "./inputmgr";
import SceneMgr from "./scenemgr";
import {IScene} from "./scene";
import Scene from "./scene";
import State from "./state";
import Loop from "./loop";
import ResStack from "./resstack";
import {RequestAnimationFrame} from "./utilfuncs";
import * as G from "./global";
import GLResourceSet from "./gl_resource_set";
import {gl} from "./global";

class St extends State<LoadingScene> {}
export class LoadingScene extends Scene<LoadingScene> {
	constructor(res: string[], nextScene: IScene) {
		super(0, new St());
		G.resource.loadFrame(
			res,
			()=> {
				try {
					G.scene.push(nextScene, true);
				} catch (e) {
					alert(e);
				}
			},
			()=> {
				alert("ERROR");
			}
		);
	}
}
type Alias_t = {[key: string]: string;};
function _MainLoop<T>(alias: Alias_t, base: string, cbMakeScene: ()=>IScene) {
	G.SetResource(new ResStack(base));
	G.resource.addAlias(alias);
	G.SetEngine(new Engine());
	G.SetInput(new InputMgr());
	G.SetScene(new SceneMgr(cbMakeScene()));
	G.SetGLRes(new GLResourceSet());
	G.glres.onContextRestored();
}
export function MainLoop<T>(alias: Alias_t, base: string, cbMakeScene: ()=>IScene) {
	_MainLoop(alias, base, cbMakeScene);

	RequestAnimationFrame(function Loop() {
		RequestAnimationFrame(Loop);
		if(gl.isContextLost())
			return;
		G.scene.onDraw();
	});
	const loop = new Loop();
	loop.start(60, (tick) => {
		G.input.update();
		if(!G.scene.onUpdate(tick)) {
			loop.stop();
		}
	});
}
export function MainLoop_RF<T>(alias: Alias_t, base: string, cbMakeScene: ()=>IScene) {
	_MainLoop(alias, base, cbMakeScene);

	let prev = new Date().getTime();
	RequestAnimationFrame(function Loop() {
		RequestAnimationFrame(Loop);

		const now = new Date().getTime();
		const tick = now - prev;
		prev = now;

		G.input.update();
		G.scene.onUpdate(tick / 1000);
		if(gl.isContextLost())
			return;
		G.scene.onDraw();
	});
}
