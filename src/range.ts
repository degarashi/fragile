class Range {
	constructor(public from:number, public to:number) {}
	width() {
		return this.to - this.from;
	}
	move(ofs: number) {
		this.from += ofs;
		this.to += ofs;
	}
}
export default Range;
