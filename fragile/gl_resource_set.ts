import GLResource from "./gl_resource";
import GLResourceFlag from "./gl_resource_flag";
import {gl} from "./global";

export default class GLResourceSet extends GLResourceFlag {
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
