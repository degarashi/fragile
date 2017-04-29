interface Discardable {
	acquire(): void;
	discard(cb?: ()=>void): void;
	count(): number;
}
export default Discardable;
