import {ResourceGenSrc} from "../resourcegen";
import ResourceParam from "./param";

function MakeCanvas(id: string) {
	const canvas = document.createElement("canvas");
	canvas.id = id;
	canvas.textContent = "Canvas not supported.";
	return canvas;
}
function MakeCanvasToBody(id: string) {
	const c = MakeCanvas(id);
	document.body.appendChild(c);
	return c;
}
ResourceGenSrc.Canvas = function(rp: RPCanvas) {
	return MakeCanvasToBody(rp.id);
};

export default class RPCanvas implements ResourceParam {
	constructor(public id: string) {}

	get name() { return "Canvas"; }
	get key() { return `Canvas_${this.id}`; }
}
