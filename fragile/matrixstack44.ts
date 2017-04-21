import Mat44 from "./matrix44";
import {Assert} from "./utilfuncs";

// 4x4行列スタック
export default class MatrixStack44 {
	private _array: Mat44[] = [Mat44.Identity()];

	// 次にpopした時用にスタック先頭を複製して積む
	mark(): void {
		this._array.push(this.top().clone());
	}
	// スタック先頭の行列への積算 (スタックには積まない)
	push(m: Mat44): void {
		this._array[this._array.length-1] = this._array.back().mul(m);
	}
	// スタックから行列を1つ取り除く
	pop(): Mat44|undefined {
		Assert(!this._array.empty(), "can't pop matrix from stack");
		return this._array.pop();
	}
	length(): number {
		return this._array.length;
	}
	top(): Mat44 {
		return this._array.front();
	}
}
