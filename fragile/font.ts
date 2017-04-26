export default class {
	constructor(
		public family: string,
		public size: string,
		public weight: string,
		public italic: boolean
	) {}
	fontstr() {
		let res = "";
		if(this.italic)
			res += "italic";
		const add = (ent: string)=>{
			const val = (<any>this)[ent];
			if(val) {
				res += " ";
				res += String(val);
			}
		};
		add("weight");
		add("size");
		add("family");
		return res;
	}
}
