import {engine} from "./global";
// 描画ソートをする為の優先度値など
export default class DrawTag {
	priority: number = 0;
	technique: string = "";

	apply(): void {
		if(this.technique.length > 0)
			engine.setTechnique(this.technique);
	}
}
