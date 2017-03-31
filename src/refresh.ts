import {Assert} from "./utilfuncs";

class RefreshDep {
	constructor(
		public depend: string[]|null,	// 依存パラメータリスト(string)
		public flag: number,			// 該当フラグ値
		public upperFlag: number,		// パラメータを更新した場合にセットするフラグ値(後で計算)
		public lowerFlag: number,		// パラメータを更新した場合にクリアするフラグ値(後で計算)
		public value: any
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
	constructor(def: {[key: string]: string[]|null;}) {
		let flagCur = 0x01;
		this._entry = {};
		const keys = Object.keys(def);
		keys.forEach((k) => {
			this._entry[k] = new RefreshDep(
				def[k],
				flagCur,
				0,
				0,
				null
			);
			Assert(flagCur <= 0x80000000);
			flagCur <<= 1;
		});
		// Depフラグ計算
		keys.forEach((k) => {
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
	set(key: string, value: any): void {
		const ent = this._entry[key];
		ent.value = value;
		this._reflag &= ~ent.lowerFlag;
		this._reflag |= ent.upperFlag;
	}
	get(key: string): any {
		const ent = this._entry[key];
		if(this._reflag & ent.flag) {
			ent.value = (<any>this)[`_refresh_${key}`]();
			this._reflag &= ~ent.flag;
		}
		return ent.value;
	}
}
