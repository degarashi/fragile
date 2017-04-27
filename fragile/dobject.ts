import {engine} from "./global";
import Drawable from "./drawable";
import BaseObject from "./baseobject";
import DrawTag from "./drawtag";

abstract class DObject extends BaseObject implements Drawable {
	readonly drawtag: DrawTag = new DrawTag();
	abstract onDraw(): void;
}
export default DObject;
