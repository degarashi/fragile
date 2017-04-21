import Timer from "./timer";
import Range from "./range";

export default class LinearTimer implements Timer {
	cur: number = 0;
	range: Range = new Range(0,0);

	constructor(init: number, end: number) {
		this.range.from = init;
		this.range.to = end;
	}
	reset(): void {
		this.cur = this.range.from;
	}
	get(): number {
		return this.cur;
	}
	advance(dt: number): boolean {
		if(this.cur >= this.range.to) {
			return true;
		}
		this.cur += dt;
		return false;
	}
}
