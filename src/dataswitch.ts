export default class DataSwitch<T> {
	private _data: T[] = [];
	private _sw: number = 0;

	constructor(data0: T, data1: T) {
		this._data[0] = data0;
		this._data[1] = data1;
	}
	current(): T {
		return this._data[this._sw];
	}
	prev(): T {
		return this._data[this._sw ^ 1];
	}
	swap(): void {
		this._sw ^= 1;
	}
}
