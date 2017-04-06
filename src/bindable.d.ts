interface Bindable {
	bind(): void;
	unbind(): void;
	proc(cb: ()=>void): void;
}
export default Bindable;
