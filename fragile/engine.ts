import {Assert, JoinEntries} from "./utilfuncs";
import SysUnif3D from "./sysunif3d";
import GLTexture from "./gl_texture";
import ResourceGen from "./resourcegen";
import RPCanvas from "./resourcegen/canvas";
import RPWebGLCtx from "./resourcegen/webglctx";
import {BlendFunc} from "./gl_const";
import GLConst from "./gl_const";
import {resource, gl, glres, SetGL} from "./global";
import Vec2 from "./vector2";
import GLProgram from "./gl_program";
import Technique from "./technique";
import {TechDef} from "./technique";
import ResourceWrap from "./resource_wrap";
import Size from "./size";
import Geometry from "./geometry";
import glc from "./gl_const";

type UnifMap = {[key: string]: any;};
export default class Engine {
	private _doubling: number;
	private _sys3d: SysUnif3D;
	private _tech: {[key: string]: TechDef;};
	private _size: Size;
	private _unif: UnifMap;
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
			glres.onContextLost();
		});
		canvas.data.addEventListener("webglcontextrestored", function(e: Event){
			glres.onContextRestored();
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
	setUniforms(tbl: UnifMap): void {
		JoinEntries(this._unif, tbl);
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
		if(!this._active)
			throw new Error(`No such technique: ${name}`);
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
	drawGeometry(geom: Geometry): void {
		this.draw(()=> {
			const idxL: number[] = [];
			const vbg = geom.vbuffer;
			let count = 0;
			for(let name in vbg) {
				const vb = vbg[name];
				count = vb.nElem();
				idxL.push(<number>this.program().setVStream(name, vb));
			}
			const ib = geom.ibuffer;
			const glflag = glc.PrimitiveC.convert(geom.type);
			if(ib) {
				ib.proc(()=> {
					gl.drawElements(glflag, ib.nElem(), ib.typeinfo().id, 0);
				});
			} else {
				gl.drawArrays(glflag, 0, count);
			}
			for(let i=0 ; i<idxL.length ; i++)
				gl.disableVertexAttribArray(idxL[i]);
		});
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
