interface Timer {
	reset(): void;
	get(): number;
	advance(dt: number): boolean;
}
export default Timer;
