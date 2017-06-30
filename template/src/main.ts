import Clear from "fragile/clear";
import {MainLoop_RF} from "fragile/mainloop";
import LoadingScene from "fragile/loadingscene";
import Scene from "fragile/scene";
import State from "fragile/state";
import Vec4 from "fragile/vector4";

import {DrawSort} from "fragile/drawsort";
// show "HELLO WORLD"
class StDefault extends State<MyScene> {
	onUp(self: MyScene): void {
		const cls = new Clear(new Vec4(0,0,0,1));
		cls.drawtag.priority = 0;
		self.asDrawGroup().group.add(cls, true);
		self.asDrawGroup().setSortAlgorithm(DrawSort.Priority);
	}
	onUpdate(self: MyScene, dt: number): void {
	}
}
class MyScene extends Scene<MyScene> {}

import Alias from "./_alias";
window.onload = function() {
	const base = ".";
	const res: string[] = [];
	const sc = new MyScene(0, new StDefault());
	MainLoop_RF(Alias, base, ()=> {
		return new LoadingScene(
			res,
			function(){
				return sc;
			}
		);
	});
};
