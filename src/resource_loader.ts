interface ResourceLoader {
	begin(cbCompleted: ()=>void, cbError: ()=>void): void;
	abort(): void;
	errormsg(): string;
	status(): string;
	result(): any;
}
export default ResourceLoader;
