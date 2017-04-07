interface TypedArray {
	[key:number]: number;
	buffer: ArrayBuffer;
	byteLength: number;
	byteOffset: number;
	length: number;
	slice(start?: number|undefined, end?: number|undefined): TypedArray;
}
export default TypedArray;
