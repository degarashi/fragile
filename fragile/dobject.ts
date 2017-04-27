import {engine} from "./global";
import Drawable from "./drawable";
import BaseObject from "./baseobject";
import DrawTag from "./drawtag";

abstract class DObject extends BaseObject implements Drawable {
	readonly drawtag: DrawTag = new DrawTag();
	constructor(tech: string|null, priority: number = 0) {
		super();
		this.drawtag.technique = tech;
		this.drawtag.priority = priority;
	}
	abstract onDraw(): void;
}
export default DObject;
