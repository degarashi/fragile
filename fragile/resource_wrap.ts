import Resource from "./resource";
import {Assert} from "./utilfuncs";
import RefCount from "./refcount";

export default class ResourceWrap<T> extends RefCount implements Resource {
	constructor(public data: T) {
		super();
	}
}
