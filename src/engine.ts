import {Assert} from "./utilfuncs";
import SysUnif3D from "./sysunif3d";
import GLTexture from "./gl_texture";
import ResourceGen from "./resourcegen";
import RPCanvas from "./resourcegen/canvas";
import RPWebGLCtx from "./resourcegen/webglctx";
import {BlendFunc} from "./gl_const";
import GLConst from "./gl_const";
import {resource, gl, SetGL} from "./global";
import Vec2 from "./vector2";
import GLProgram from "./gl_program";
import Technique from "./technique";
import {TechDef} from "./technique";
import ResourceWrap from "./resource_wrap";
import Size from "./size";

export default class Engine {
	private _doubling: number;
	private _sys3d: SysUnif3D;
	private _tech: {[key: string]: TechDef;};
	private _size: Size;
	private _unif: {[key: string]: any;};
	private _active: TechDef;
	static CanvasName: string = "maincanvas";

	private _onResized(): void {
		const canvas = <ResourceWrap<HTMLCanvasElement>>ResourceGen.get(new RPCanvas(Engine.CanvasName));
		const w = window.innerWidth,
			h = window.innerHeight;
		this._size = new Size(w, h);
		const dbl = this._doubling;
		[canvas.data.width, canvas.data.height] = [w/dbl, h/dbl];
		gl.viewport(0, 0, w/dbl, h/dbl);
		canvas.data.style.cssText = "width:100%;height:100%";
	}
	sys3d(): SysUnif3D {
		return this._sys3d;
	}
	size(): Size {
		return this._size;
	}
	private _initGL(): void {
		Assert(!gl, "already initialized");
		SetGL((<ResourceWrap<WebGLRenderingContext>>ResourceGen.get(new RPWebGLCtx(Engine.CanvasName))).data);
		if(!gl)
			throw new Error("WebGL not supported.");
		const canvas = <ResourceWrap<HTMLCanvasElement>>ResourceGen.get(new RPCanvas(Engine.CanvasName));
		canvas.data.addEventListener("webglcontextlost", function(e: Event){
		});
		canvas.data.addEventListener("webglcontextrestored", function(e: Event){
		});

		window.onresize = () => {
			this._onResized();
		};
		this._onResized();
		new GLConst(gl);
	}
	constructor() {
		this._doubling = 1;
		this._sys3d = new SysUnif3D();
		this._tech = {};
		this._size = new Size(0,0);
		this._initGL();
	}
	draw(cb: ()=>void): void {
		const prog = this.technique().program;
		this.sys3d().apply(prog);
		let tc = 0;
		let tex:GLTexture[] = [];
		Object.keys(this._unif).forEach((k: string)=> {
			const v = this._unif[k];
			if(v instanceof GLTexture) {
				gl.activeTexture(gl.TEXTURE0 + tc);
				v.bind_loose();
				prog.setUniform(k, tc++);
				tex.push(v);
			} else {
				prog.setUniform(k, v);
			}
		});
		cb();
		for(let i=0 ; i<tex.length ; i++)
			tex[i].unbind();
	}
	setUniform(name: string, value: any): void {
		this._unif[name] = value;
	}
	addTechnique(sh: Technique): void {
		const techL = sh.technique();
		Object.keys(techL).forEach((k: string)=> {
			const v = techL[k];
			this._tech[k] = v;
		});
	}
	setTechnique(name: string): void {
		if(this._active)
			this._active.program.unbind();

		this._active = this._tech[name];
		this._active.valueset.apply();
		this._active.program.bind();
		this._unif = {};
	}
	technique(): TechDef {
		return this._active;
	}
	program(): GLProgram {
		return this.technique().program;
	}
	getScreenCoord(pos: Vec2) {
		pos = pos.clone();
		const s = this.size();
		const w2 = s.width/2,
			h2 = s.height/2;
		pos.x = pos.x/w2 - 1;
		pos.y = -pos.y/h2 + 1;
		return pos;
	}
}
