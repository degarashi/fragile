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
	constructor(
		res: string[],
		nextScene: ()=>IScene,
		cbProgress?: (loaded:number, total:number)=>void,
		cbTaskProgress?: (taskIndex: number, loadedBytes: number, totalBytes: number)=>void
	) {
		super(0, new St());
		resource.loadFrame(
			res,
			{
				completed: ()=> {
					scene.push(nextScene(), true, true);
				},
				error: (msg: string)=> {
					scene.pop(1, new LoadFailed(msg));
				},
				progress: cbProgress || function(){},
				taskprogress: cbTaskProgress || function(){}
			}
		);
	}
}
