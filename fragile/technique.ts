/// <reference path="arrayfunc.ts" />
import GLProgram from "./gl_program";
import GLValueSet from "./gl_valueset";
import {resource} from "./global";
import Resource from "./resource";
import ResourceWrap from "./resource_wrap";
import {NoSuchResource} from "./resstack";
import {MoreResource} from "./resource_aux";
import {Assert} from "./utilfuncs";

interface TechSource {
	depandancy: string[],
	technique: {[key: string]: TechSourceDef;};
}
interface TechSourceDef {
	vshader: string;
	fshader: string;
	valueset: string | Object;
	boolset?: string[];
}
export interface TechDef {
	valueset: GLValueSet;
	program: GLProgram;
}
type TechDefMap = {[key: string]: TechDef;};
export default class Technique extends ResourceWrap<null> {
	private _tech: TechDefMap;

	private _checkResource(src: TechSource): string[] {
		const later: string[] = [];
		Object.keys(src.technique).forEach((k: string)=> {
			const v = src.technique[k];
			const chk = (key: string)=> {
				if(!resource.checkResource(key))
					later.push(key);
			};
			if(v.valueset instanceof Object) {
				Assert(v.boolset instanceof Object);
			} else
				chk(<string>v.valueset);
			chk(v.vshader);
			chk(v.fshader);
		});
		return later;
	}
	private _loadResource(src: TechSource): void {
		const tech:TechDefMap = {};
		Object.keys(src.technique).forEach((k: string)=> {
			const v = src.technique[k];
			let vs:GLValueSet;
			if(v.valueset instanceof Object) {
				vs = GLValueSet.FromJSON(
					{
						boolset: <string[]>v.boolset,
						valueset: <{[key: string]: any}>v.valueset
					}
				);
			} else {
				vs = GLValueSet.FromJSON(resource.getResource(v.valueset).data);
			}
			tech[k] = {
				valueset: vs,
				program: new GLProgram(
					resource.getResource(v.vshader),
					resource.getResource(v.fshader)
				)
			};
		});
		this._tech = tech;
	}
	constructor(src: TechSource) {
		super(null);
		// 必要なリソースが揃っているかのチェック
		const later = this._checkResource(src);
		if(!later.empty())
			throw new MoreResource(...later);
		// 実際のローディング
		this._loadResource(src);
	}
	technique(): TechDefMap {
		return this._tech;
	}
}
