import LinearTimer from "./lineartimer";
import {engine} from "./global";
import DObject from "./dobject";
import Vec2 from "./vector2";
import Text from "./text";

export default class TextDraw extends DObject {
	private readonly _text: Text;
	readonly timer: LinearTimer;
	offset: Vec2;
	alpha: number;
	readonly delay: number;

	constructor(text: Text, delay: number) {
		super("text");
		this._text = text;
		this.timer = new LinearTimer(0, text.length()+delay);
		this.offset = new Vec2(0,0);
		this.alpha = 1;
		this.delay = delay;
	}
	advance(dt: number): boolean {
		return this.timer.advance(dt);
	}
	onDraw(): void {
		this._text.draw(this.offset, this.timer.get(), this.delay, this.alpha);
	}
}
