import glc from "./gl_const";
import {EnumBase, BoolSetting, BoolString} from "./gl_const";
import {gl} from "./global";

function ToLowercaseKeys(ar: any): any {
	const ret:{[key: string]: any;} = {};
	Object.keys(ar).forEach(
		function(k: string) {
			let val = ar[k];
			if(typeof val === "string")
				val = val.toLowerCase();
			else if(val instanceof Array) {
				for(let i=0 ; i<val.length ; i++) {
					if(typeof val[i] === "string")
						val[i] = val[i].toLowerCase();
				}
			}
			ret[k.toLowerCase()] = val;
		}
	);
	return ret;
}
interface ValueSetParam {
	boolset: string[];
	valueset: {[key: string]: any;};
}
export default class GLValueSet {
	private _boolset: {[key: string]: boolean;};
	private _valueset: {[key: string]: number|string|string[]|number[];};

	static FromJSON(js: ValueSetParam) {
		const ret = new GLValueSet();
		const bs = js.boolset;
		const bsf:{[key: string]: any;} = {};
		for(let i=0 ; i<bs.length ; i++) {
			bsf[bs[i]] = true;
		}
		ret._boolset = ToLowercaseKeys(bsf);
		ret._valueset = ToLowercaseKeys(js.valueset);
		return ret;
	}
	enable(name: string): void {
		this._boolset[name] = true;
	}
	disable(name: string): void {
		delete this._boolset[name];
	}
	apply(): void {
		// boolset
		for(let i=0 ; i<BoolString.length ; i++) {
			const key = BoolString[i];
			const func = (this._boolset[key] === true) ? gl.enable : gl.disable;
			func.call(gl, glc.BoolSettingC.convert(i+EnumBase.Num));
		}
		// valueset
		for(let k in this._valueset) {
			const args = this._valueset[k];
			const func = glc.ValueSetting[k];
			if(args instanceof Array)
				func.call(gl, args[0], args[1], args[2], args[3]);
			else
				func.call(gl, args);
		}
	}
}
