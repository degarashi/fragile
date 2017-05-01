import DObject from "./dobject";
import GLFramebuffer from "./gl_framebuffer";
import GLTexture2DP from "./gl_texture2dp";
import {InterFormat, TexDataFormat, Attachment, UVWrap} from "./gl_const";
import {engine} from "./global";
import RPGeometry from "./resourcegen/geometry";
import rgen from "./resourcegen";
import Geometry from "./geometry";
import ResourceWrap from "./resource_wrap";
import Vec4 from "./vector4";
import Refresh from "./refresh";
import DrawGroup from "./drawgroup";

class STag {
	static readonly Source = "source";
	static readonly Dest = "dest";
	static readonly FB = "fb";
}
class GaussSub extends DObject {
	coeff: number[];
	private readonly _rf: Refresh;
	private readonly _rect: Geometry =  (<ResourceWrap<Geometry>>rgen.get(new RPGeometry("Rect01"))).data;
	constructor(tech: string) {
		super(tech);
		this._rf = new Refresh({
			[STag.Source]: null,
			[STag.Dest]: {
				depend: [STag.Source],
				func: (prev: GLTexture2DP): GLTexture2DP => {
					if(!prev)
						prev = new GLTexture2DP();
					const ss = this.source().size();
					const ds = prev.size();
					if(ds.width < ss.width || ds.height < ss.height) {
						prev.setLinear(true, true, 0);
						prev.setWrap(UVWrap.Clamp, UVWrap.Clamp);
						prev.setData(InterFormat.RGBA, ss.width, ss.height, InterFormat.RGBA, TexDataFormat.UB);
					}
					return prev;
				}
			},
			[STag.FB]: {
				depend: [STag.Dest],
				func: (prev: GLFramebuffer): GLFramebuffer => {
					if(!prev)
						prev = new GLFramebuffer();
					prev.attach(Attachment.Color0, this.dest());
					return prev;
				}
			}
		});
	}
	setSource(src: GLTexture2DP): void {
		this._rf.set(STag.Source, src);
	}
	source(): GLTexture2DP {
		return this._rf.get(STag.Source);
	}
	dest(): GLTexture2DP {
		return this._rf.get(STag.Dest);
	}
	private _fb(): GLFramebuffer {
		return this._rf.get(STag.FB);
	}
	onDraw(): void {
		const src = this.source();
		const coeff = this.coeff;
		engine.setUniforms({
			u_weight: coeff,
			u_mapSize: src.truesize().toVec4(),
			u_uvrect: src.uvrect().toVec4(),
			u_texDiffuse: src
		});
		this._fb().vp_proc(()=> {
			engine.drawGeometry(this._rect);
		});
	}
}
class Tag {
	static readonly Dispersion = "dispersion";
	static readonly Coeff = "coeff";
}
export default class GaussFilter extends DObject {
	private readonly _pass: DrawGroup;
	private readonly _sub: GaussSub[];
	private readonly _rf: Refresh;
	static Tag = Tag;

	// [Horizontal Blur] -> [Vertical Blur]
	constructor() {
		super(null);
		this._rf = new Refresh({
			[Tag.Dispersion]: null,
			[Tag.Coeff]: {
				depend: [Tag.Dispersion],
				func: (prev: any):number[] => {
					const d:number = this._rf.get(Tag.Dispersion);
					const nc = 9;
					const ca:number[] = [];
					let total = 0;
					for(let i=0 ; i<nc ; i++) {
						ca[i] = Math.exp(-0.5 * (i*i)/d);
						if(i === 0)
							total += ca[i];
						else
							total += ca[i] * 2;
					}
					total = 1 / total;
					for(let i=0 ; i<nc ; i++) {
						ca[i] *= total;
					}
					return ca;
				}
			}
		});
		this._pass = new DrawGroup();
		this._sub = [new GaussSub("gaussh"), new GaussSub("gaussv")];
		for(let i=0 ; i<2 ; i++) {
			this._pass.group.add(this._sub[i], false);
		}
	}
	setSource(src: GLTexture2DP): void {
		this._sub[0].setSource(src);
		this._sub[1].setSource(this._sub[0].dest());
	}
	private _coeff(): number[] {
		return this._rf.get(Tag.Coeff);
	}
	result(): GLTexture2DP {
		return this._sub[1].dest();
	}
	setDispersion(d: number): void {
		this._rf.set(Tag.Dispersion, d);
	}
	onDraw(): void {
		if(this._sub[0].source()) {
			const coeff = this._coeff();
			for(let i=0 ; i<2 ; i++) {
				this._sub[i].coeff = coeff;
			}
			this._pass.onDraw();
		}
	}
}
