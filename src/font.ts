export default class {
	constructor(
		public family: string,
		public size: string,
		public weight: string,
		public italic: boolean
	) {}
	fontstr() {
		const italic = this.italic ? "italic" : "";
		return `${italic} ${this.weight} ${this.size} ${this.family}`;
	}
}
