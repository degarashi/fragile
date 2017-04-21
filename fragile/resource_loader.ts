import Resource from "./resource";

interface ResourceLoader {
	begin(cbCompleted: ()=>void, cbError: ()=>void): void;
	abort(): void;
	errormsg(): string;
	status(): string;
	result(): Resource;
}
export default ResourceLoader;
