class Size {
	constructor(public width:number, public height:number) {}
	equal(s: Size): boolean {
		return this.width === s.width &&
				this.height === s.height;
	}
}
export default Size;
