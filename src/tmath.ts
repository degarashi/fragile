// 数学関連のクラス
namespace TM {
	export const EQUAL_THRESHOLD = 1e-5;
	export function IsEqual(f0: number, f1: number) {
		return Math.abs(f0-f1) <= TM.EQUAL_THRESHOLD;
	}
	export function Deg2rad(deg: number) {
		return (deg/180) * Math.PI;
	}
	export function Rad2deg(rad: number) {
		return rad/Math.PI * 180;
	}
	export function Square(v: number) {
		return v*v;
	}
	export function GCD(a: number, b: number) {
		if(a===0 || b===0)
			return 0;
		while(a !== b) {
			if(a > b)	a -= b;
			else		b -= a;
		}
		return a;
	}
	export function LCM(a: number, b: number) {
		const div = TM.GCD(a,b);
		if(div === 0)
			return 0;
		return (a / div) * b;
	}
}
export default TM;
