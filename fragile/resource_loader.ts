import Resource from "./resource";
import RLoaderCB from "./rloader_cb";

interface ResourceLoader {
	begin(callback: RLoaderCB, timeout:number): void;
	abort(): void;
	errormsg(): string;
	status(): string;
	result(): Resource;
}
export default ResourceLoader;
