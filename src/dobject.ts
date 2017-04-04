import {engine} from "./global";
import Drawable from "./drawable";
import BaseObject from "./baseobject";

// 描画ソートをする為の優先度値など
export class DrawTag {
	priority: number = 0;
	technique: string = "";

	apply(): void {
		if(this.technique.length > 0)
			engine.setTechnique(this.technique);
	}
}
abstract class DObject extends BaseObject implements Drawable {
	readonly drawtag: DrawTag = new DrawTag();
	abstract onDraw(): void;
}
export default DObject;
