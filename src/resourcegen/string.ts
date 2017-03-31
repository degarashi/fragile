import ResourceParam from "./param";

export default class RPString implements ResourceParam {
	constructor(public name: string) {}
	get key() { return this.name; }
}
