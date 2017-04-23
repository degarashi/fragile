export default class State<T> {
	onEnter(self: T, prev: State<T>): void {}
	onExit(self: T, next: State<T>): void {}
	onUpdate(self: T, dt: number): void {}
	onDown(self: T, ret: any): void {}
	onUp(self: T): void {}
}
export const BeginState = new State();
export const EndState = new State();
