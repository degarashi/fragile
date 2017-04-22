import {Assert} from "./utilfuncs";

type RefreshFunc = (prev: any)=>any;
class RefreshDep {
	constructor(
		public depend: string[]|null,			// 依存パラメータリスト(string)
		public func: RefreshFunc | null, // キャッシュを更新する為の関数
		public flag: number,			// 該当フラグ値
		public upperFlag: number,		// パラメータを更新した場合にセットするフラグ値(後で計算)
		public lowerFlag: number,		// パラメータを更新した場合にクリアするフラグ値(後で計算)
		public value: any				// キャッシュに対応する任意の値
	) {}
}
class RDefEnt {
	constructor(
		public depend: string[],
		public func: (prev: any)=>any
	) {}
}
export default class Refresh {
	/*
		{
			keyname: ([dependancies...] or null),
			...
		}
	*/
	private _entry: {[key: string]: RefreshDep;};
	private _reflag: number;
	constructor(def: {[key: string]: RDefEnt|null;}) {
		let flagCur = 0x01;
		this._entry = {};
		const len = def.length;
		const keys = Object.keys(def);
		keys.forEach((k: string)=> {
			const ent = def[k];
			this._entry[k] = new RefreshDep(
				ent ? ent.depend : null,
				ent ? ent.func : null,
				flagCur,
				0,
				0,
				null
			);
			Assert(flagCur <= 0x80000000);
			flagCur <<= 1;
		});
		// Depフラグ計算
		keys.forEach((k: string) => {
			const ent = this._entry[k];
			ent.lowerFlag = this._calcLower(k, 0);
			Assert((ent.upperFlag & ent.lowerFlag) === 0);
			Assert((ent.flag & ent.lowerFlag) === ent.flag);
		});
		this.reset();
	}
	private _calcLower(k: string, upper: number): number {
		const ent = this._entry[k];
		ent.upperFlag |= upper;
		let flag = ent.flag;
		if(ent.depend) {
			for(let i=0 ; i<ent.depend.length ; i++) {
				flag |= this._calcLower(ent.depend[i], upper|ent.flag);
			}
		}
		return flag;
	}
	reset(): void {
		this._reflag = ~0;
	}
	setFuncs(funcs: {[key: string]: RefreshFunc;}) {
		const keys = Object.keys(funcs);
		keys.forEach((k: string)=> {
			this.setFunc(k, funcs[k]);
		});
	}
	// 更新関数の上書き
	setFunc(key: string, func: RefreshFunc): void {
		const ent = this._entry[key];
		Assert(Boolean(ent));
		ent.func = func;
		this._reflag |= ent.upperFlag | ent.flag;
	}
	set(key: string, value: any): void {
		const ent = this._entry[key];
		ent.value = value;
		// 該当フラグをクリア
		this._reflag &= ~ent.lowerFlag;
		this._reflag |= ent.upperFlag;
	}
	ref(key: string): any {
		const ent = this._entry[key];
		// 該当フラグをクリア
		this._reflag &= ~ent.lowerFlag;
		this._reflag |= ent.upperFlag;
		return ent.value;
	}
	get(key: string): any {
		const ent = this._entry[key];
		if(this._reflag & ent.flag && ent.func) {
			// 更新関数を呼び出す
			ent.value = (<RefreshFunc>ent.func)(ent.value);
			// 更新された変数のフラグはクリア
			this._reflag &= ~ent.flag;
		}
		return ent.value;
	}
}
