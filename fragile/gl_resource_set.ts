import GLResource from "./gl_resource";
import GLResourceBase from "./gl_resource_base";
import {gl} from "./global";

export default class GLResourceSet extends GLResourceBase {
	private readonly _set:Set<GLResource> = new Set<GLResource>();

	onContextLost(): void {
		super.onContextLost(()=> {
			this._set.forEach((r: GLResource)=> {
				r.onContextLost();
			});
		});
	}
	onContextRestored(): void {
		super.onContextRestored(()=> {
			this._set.forEach((r: GLResource)=> {
				r.onContextRestored();
			});
		});
	}
	add(r: GLResource): void {
		this._set.add(r);
		if(!gl.isContextLost())
			r.onContextRestored();
	}
	remove(r: GLResource): void {
		this._set.delete(r);
	}
}
