import GLVBuffer from "./gl_vbuffer";
import {DrawType} from "./gl_const";
import Mat44 from "./matrix44";
import Vec3 from "./vector3";
import DObject from "./dobject";
import GObject from "./gobject";
import {DrawWithGeom} from "./utilfuncs";
import {scene, engine, gl, resource} from "./global";
import GLTexture2D from "./gl_texture2d";
import {VectorToArray} from "./utilfuncs";

function Rand01() {
	return (Math.random()-0.5) * 2;
}
interface Algorithm {
	initialize(): any;
	advance(points: any, dt: number): void;
}
class Points {
	readonly position: Vec3[] = [];
	readonly hsv: Vec3[] = [];
}
class Alg implements Algorithm {
	private readonly _nP: number;
	private readonly _veloc: Vec3[];
	constructor(n: number) {
		this._nP = n;
		this._veloc = [];
	}
	initialize(): Points {
		const ret = new Points();
		const vpos = ret.position;
		const vhsv = ret.hsv;
		const veloc = this._veloc;
		for(let i=0 ; i<this._nP ; i++) {
			vpos[i] = new Vec3(Rand01(), -1, Rand01());
			veloc[i] = new Vec3(Rand01(), 0.1, Rand01()).normalizeSelf();
			vhsv[i] = new Vec3(Math.random(), 0.8, 1);
		}
		return ret;
	}
	advance(points: Points, dt: number): void {
		const veloc = this._veloc;
		const len = veloc.length;
		for(let i=0 ; i<len ; i++) {
			points.position[i].addSelf(veloc[i].mul(dt));
			let dir = points.position[i].minus();
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
	private _points: Points;
	hueOffset: number;
	constructor(alg: Algorithm) {
		this._alg = alg;
		this._points = alg.initialize();
		const vbc = new GLVBuffer();
		vbc.setVectorData(this._points.hsv, DrawType.Dynamic, true);
		const vb = new GLVBuffer();
		vb.setVectorData(this._points.position, DrawType.Dynamic, true);
		this._geom = {
			vbuffer: {
				a_position: vb,
				a_hsv: vbc
			}
		};
		this.hueOffset = 0;
	}
	advance(dt: number): void {
		this._alg.advance(this._points, dt);
		const vr = VectorToArray(...this._points.position);
		this._geom.vbuffer.a_position.setSubData(0, vr.buffer);
		const vsv = VectorToArray(...this._points.hsv);
		this._geom.vbuffer.a_hsv.setSubData(0, vsv.buffer);
	}
	draw(alpha: number): void {
		engine.setTechnique("psprite");
		if(this.texture)
			engine.setUniform("u_texture", this.texture);
		engine.sys3d().worldMatrix = Mat44.Identity();
		engine.setUniform("u_alpha", alpha);
		engine.setUniform("u_hue", this.hueOffset);
		engine.draw(()=> { DrawWithGeom(this._geom, gl.POINTS); });
	}
}
export class PSpriteDraw extends DObject {
	private readonly _psprite: PSprite;
	alpha: number;
	constructor(n: number) {
		super();
		this._psprite = new PSprite(new Alg(n));
		const tex = <GLTexture2D>resource.getResource("sphere");
		tex.setLinear(true, true, 0);
		this._psprite.texture = tex;
		this.alpha = 1;
	}
	advance(dt: number) {
		this._psprite.hueOffset += dt*0.1;
		this._psprite.advance(dt/2);
	}
	onDraw(): void {
		this._psprite.draw(this.alpha);
	}
}
class PSpriteObj extends GObject {
	private _draw: PSpriteDraw;
	private _nParticle: number;

	constructor(np: number) {
		super();
		this._nParticle = np;
	}
	onConnected() {
		this._draw = new PSpriteDraw(this._nParticle);
		scene.top().asDrawGroup().group.add(this._draw);
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
