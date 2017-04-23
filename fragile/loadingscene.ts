import Scene from "./scene";
import State from "./state";
import {IScene} from "./scene";
import {resource, scene} from "./global";

export class LoadFailed extends Error {
	constructor(msg: string) {
		super(msg);
	}
}
class St extends State<LoadingScene> {}
export default class LoadingScene extends Scene<LoadingScene> {
	constructor(res: string[], nextScene: IScene) {
		super(0, new St());
		resource.loadFrame(
			res,
			()=> {
				scene.push(nextScene, true);
			},
			(msg: string)=> {
				scene.pop(1, new LoadFailed(msg));
			}
		);
	}
}
