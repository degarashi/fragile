import Clonable from "./clonable";
import Vector from "./vector";
import Matrix from "./matrix";
import Geometry from "./geometry";
import {gl, engine} from "./global";
import FontChar from "./fontchar";
import TypedArray from "./typedarray";

export function BlockPlace(dst: TypedArray, dstWidth: number,
						dim: number,
						px: number, py: number,
						src: TypedArray, srcWidth: number): void
{
	const srcHeight = src.length / srcWidth;
	for(let i=0 ; i<srcHeight ; i++) {
		const db = i*dstWidth*dim;
		const sb = i*srcWidth*dim;
		for(let j=0 ; j<srcWidth ; j++) {
			for(let k=0 ; k<dim ; k++)
				dst[db+j*dim+k] = src[sb+j*dim+k];
		}
	}
}
// 一行分を切り出す
export function GetLine(fp: FontChar[], from: number) {
	const len = fp.length;
	let i = from;
	for(; i<len ; i++) {
		const f = fp[i];
		if(!f.chara) {
			if(f.char === "\n")
				return i;
		}
	}
	return i;
}
export function FractString(f: number, n: number) {
	let str = "";
	while(n-- > 0 && f > 0) {
		f *= 10;
		str += Math.floor(f);
	}
	return str;
}
export function PaddingString(n: number, c: string) {
	let str = "";
	while(n-- > 0)
		str += c;
	return str;
}
export function FixedInteger(nAll: number, num: number, pad=" ") {
	let str = String(num);
	const remain = nAll - str.length;
	if(remain > 0) {
		str = PaddingString(remain, pad) + str;
	}
	return str;
}
export function AddLineNumber(src: string|null, lineOffset: number, viewNum: number, prevLR: boolean, postLR: boolean): string {
	let res = "";
	if(src === null)
		return res;
	if(prevLR)
		res += "\n";
	const padding = PaddingString(5, " ") + "  ";
	const srcA = src.split("\n");
	const srcLen = srcA.length;
	for(let lnum=0 ; lnum<srcLen ; ++lnum) {
		if(lnum >= viewNum)
			res += FixedInteger(5, lnum+lineOffset-viewNum) + ": ";
		else
			res += padding;
		res += `${srcA[lnum]}\n`;
	}
	if(postLR)
		res += "\n";
	return res;
}
export function FixedNumber(nAll: number, nFract: number, num: number, pad=" ") {
	const L = Math.floor(num);
	let str = String(L);
	const F = num-L;
	if(F === 0)
		return L;
	str += "." + FractString(F, Math.min(nFract, 8));
	const remain = nAll - str.length;
	if(remain > 0)
		str = PaddingString(remain, pad) + str;
	return str;
}
export function AssertF(msg?: string) {
	throw Error(msg || "assertion failed");
}
export function Assert(cond: boolean, msg?: string) {
	if(!cond)
		throw Error(msg || "assertion failed");
}
export function ExtractExtension(fname: string) {
	const r = /([a-zA-Z0-9_\-]+\.)+([a-zA-Z0-9_\-]+)/;
	const r2 = r.exec(fname);
	if(r2) {
		return r2[2];
	}
	return null;
}
export function Saturation(val: number, min: number, max: number) {
	if(val <= min)
		return min;
	if(val >= max)
		return max;
	return val;
}
export function DeepCopy_Array<T>(v: Array<T>): Array<T>;
export function DeepCopy_Array(v: any): any {
	if(v instanceof Array) {
		const ret:any = {};
		Object.keys(v).forEach((k:any)=> {
			const v2:any = v[k];
			ret[k] = DeepCopy(v2);
		});
		Object.setPrototypeOf(ret, Object.getPrototypeOf(v));
		return ret;
	}
	return v;
}
export function DeepCopy(v: Clonable): Clonable;
export function DeepCopy(v: any): any {
	if(v.clone) {
		return v.clone();
	}
	return DeepCopy_Array(v);
}
export function VectorToArray(...va: Vector[]): Float32Array {
	const n = va.length;
	if(n === 0)
		return new Float32Array(0);
	if(n === 1)
		return va[0].value;

	const dim = va[0].dim();
	const ret = new Float32Array(dim*n);
	for(let i=0 ; i<n ; i++) {
		const v = va[i].value;
		for(let j=0 ; j<dim ; j++) {
			ret[i*dim+j] = v[j];
		}
	}
	return ret;
}
export function MatrixToArray(...ma: Matrix[]): Float32Array {
	const n = ma.length;
	if(n === 0)
		return new Float32Array(0);
	if(n === 1)
		return ma[0].value;

	const dim_m = ma[0].dim_m(),
		dim_n = ma[0].dim_n();
	const ret = new Float32Array(dim_m*dim_n*n);
	for(let i=0 ; i<n ; i++) {
		const m = ma[i].value;
		for(let j=0 ; j<dim_m*dim_n ; j++) {
			ret[i*dim_m*dim_n+j] = m[j];
		}
	}
	return ret;
}
export function VMToArray(vm: any): Float32Array {
	if(IsMatrix(vm))
		return MatrixToArray(vm);
	return VectorToArray(vm);
}
export function IsVector(v: any): v is Vector {
	return v.dim !== undefined;
}
export function IsMatrix(m: any): m is Matrix {
	return m.dim_m !== undefined;
}
export function IsVM(vm: any): boolean {
	return IsVector(vm) || IsMatrix(vm);
}
export const RequestAnimationFrame =
	window.requestAnimationFrame
	|| (function(){
		return window.webkitRequestAnimationFrame ||
			function(cb: ()=>void) {
				window.setTimeout(cb, 1000/60);
			};
	})();
export const CancelAnimationFrame =
	window.cancelAnimationFrame
	|| (function(){
		return window.webkitCancelAnimationFrame ||
			function(id: number) {
				window.clearTimeout(id);
			};
	})();

export function DrawWithGeom(geom: Geometry, flag: number) {
	const vbg = geom.vbuffer;
	let count = 0;
	for(let name in vbg) {
		const vb = vbg[name];
		count = vb.nElem();
		engine.program().setVStream(name, vb);
	}
	const ib = geom.ibuffer;
	if(ib) {
		ib.proc(()=> {
			gl.drawElements(flag, ib.nElem(), ib.typeinfo().id, 0);
		});
	} else {
		gl.drawArrays(flag, 0, count);
	}
}
export function BitCount32(b: number): number {
	b = ((b & 0xaaaaaaaa)>>>1) + (b & 0x55555555);
	b = ((b & 0xcccccccc)>>>2) + (b & 0x33333333);
	b = ((b & 0xf0f0f0f0)>>>4) + (b & 0x0f0f0f0f);
	b = ((b & 0xff00ff00)>>>8) + (b & 0x00ff00ff);
	return ((b & 0xffff0000)>>>16) + (b & 0x0000ffff);
}
export function IsPowValue(v: number): boolean {
	return BitCount32(v) === 1;
}
export function LowBits32(b: number): number {
	b |= b>>>1;
	b |= b>>>2;
	b |= b>>>4;
	b |= b>>>8;
	b |= b>>>16;
	return b;
}
export function GetPowValue(v: number): number {
	if(v <= 1)
		return 1;
	return (v & ~LowBits32(v>>>1)) << 1;
}

