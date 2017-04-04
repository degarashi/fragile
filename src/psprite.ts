import GLVBuffer from "./gl_vbuffer";
import {DrawType} from "./gl_const";
import Mat44 from "./matrix44";
import Vec3 from "./vector3";
import DObject from "./dobject";
import GObject from "./gobject";
import {DrawWithGeom} from "./utilfuncs";
import {scene, engine, gl, resource} from "./global";

function Rand01() {
	return (Math.random()-0.5) * 2;
}
interface Algorithm {
	initialize(): Vec3[];
	advance(vpos: Vec3[], dt: number): void;
}
class Alg implements Algorithm {
	private readonly _nP: number;
	private readonly _veloc: Vec3[];
	constructor(n: number) {
		this._nP = n;
		this._veloc = [];
	}
	initialize(): Vec3[] {
		const vpos = [];
		const veloc = this._veloc;
		for(let i=0 ; i<this._nP ; i++) {
			vpos[i] = new Vec3(Rand01(), -1, Rand01());
			veloc[i] = new Vec3(Rand01(), 0.1, Rand01()).normalizeSelf();
		}
		return vpos;
	}
	advance(vpos: Vec3[], dt: number): void {
		const veloc = this._veloc;
		const len = veloc.length;
		for(let i=0 ; i<len ; i++) {
			vpos[i].addSelf(veloc[i].mul(dt));
			let dir = vpos[i].minus();
			dir.mulSelf(dt);
			veloc[i] = veloc[i].add(dir).normalize();
		}
	}
}
/*!
	[shader requirements]
	attribute {
		vec3		a_position;
	}
	uniform {
		float		u_alpha;
		mat4		u_mTrans,
					u_mWorld;
		vec3		u_eyePos;
		sampler2D	u_texture;
	}
*/
import Geometry from "./geometry";
import GLTexture from "./gl_texture";
class PSprite {
	texture: GLTexture;
	private _geom: Geometry;
	private _alg: Algorithm;
	private _vpos: Vec3[];
	constructor(alg: Algorithm) {
		this._alg = alg;
		this._vpos = alg.initialize();
		const vb = new GLVBuffer();
		vb.setData(this._vpos, DrawType.Dynamic);
		this._geom = {
			vbuffer: {
				a_position: vb
			}
		};
	}
	advance(dt: number): void {
		this._alg.advance(this._vpos, dt);
		this._geom.vbuffer.a_position.setData(this._vpos, DrawType.Dynamic);
	}
	draw(alpha: number): void {
		engine.setTechnique("psprite");
		if(this.texture)
			engine.setUniform("u_texture", this.texture);
		engine.sys3d().worldMatrix = Mat44.Identity();
		engine.setUniform("u_alpha", alpha);
		engine.draw(()=> { DrawWithGeom(this._geom, gl.POINTS); });
	}
}
export class PSpriteDraw extends DObject {
	private readonly _psprite: PSprite;
	alpha: number;
	constructor() {
		super();
		this._psprite = new PSprite(new Alg(2000));
		this._psprite.texture = resource.getResource("sphere");
		this.alpha = 1;
	}
	advance(dt: number) {
		this._psprite.advance(dt/2);
	}
	onDraw(): void {
		this._psprite.draw(this.alpha);
	}
}
class PSpriteObj extends GObject {
	private _draw: PSpriteDraw;

	onConnected() {
		this._draw = new PSpriteDraw();
		scene.top().drawGroup().group.add(this._draw);
	}
	onUpdate(dt: number) {
		this._draw.advance(dt);
		return true;
	}
	destroy(): boolean {
		if(super.discard()) {
			this._draw.discard();
			return true;
		}
		return false;
	}
}
export default PSpriteObj;
