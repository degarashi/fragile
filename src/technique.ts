import GLProgram from "./gl_program";
import GLValueSet from "./gl_valueset";
import {resource} from "./global";
import Resource from "./resource";
import ResourceWrap from "./resource_wrap";

interface TechSource {
	depandancy: string[],
	technique: {[key: string]: TechSourceDef;};
}
interface TechSourceDef {
	vshader: string;
	fshader: string;
	valueset: string;
}
export interface TechDef {
	valueset: GLValueSet;
	program: GLProgram;
}
type TechDefMap = {[key: string]: TechDef;};
export default class Technique extends ResourceWrap<null> {
	private _tech: TechDefMap;
	constructor(src: TechSource) {
		super(null);
		const tech:TechDefMap = {};
		Object.keys(src.technique).forEach((k)=> {
			const v = src.technique[k];
			tech[k] = {
				valueset: GLValueSet.FromJSON(resource.getResource(v.valueset).data),
				program: new GLProgram(
					resource.getResource(v.vshader),
					resource.getResource(v.fshader)
				)
			};
		});
		this._tech = tech;
	}
	technique(): TechDefMap {
		return this._tech;
	}
}
