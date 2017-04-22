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

class Tag {
	static readonly Source = "source";
	static readonly Dispersion = "dispersion";
	static readonly Coeff = "coeff";
	static readonly Dest = "dest";
}
export default class GaussFilter extends DObject {
	private _fb: GLFramebuffer[];
	private _rect: ResourceWrap<Geometry>;
	private _rf: Refresh;
	static Tag = Tag;
	static TechName: string[] = ["gaussh", "gaussv"];

	// [Horizontal Blur] -> [Vertical Blur]
	constructor() {
		super();
		this._rf = new Refresh({
			[Tag.Source]: null,
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
			},
			[Tag.Dest]: {
				depend: [Tag.Source],
				func: (prev: GLTexture2DP[])=> {
					const ss = this._source().size();
					const ds = prev[0].size();
					if(ds.width < ss.width || ds.height < ss.height) {
						for(let i=0 ; i<2 ; i++)
							prev[i].setData(InterFormat.RGBA, ss.width, ss.height, InterFormat.RGBA, TexDataFormat.UB);
					}
					return prev;
				}
			}
		});
		this._fb = [new GLFramebuffer(), new GLFramebuffer()];
		const dest = [new GLTexture2DP(), new GLTexture2DP()];
		this._rf.set(Tag.Dest, dest);
		for(let i=0 ; i<2 ; i++) {
			dest[i].setLinear(true, true, 0);
			dest[i].setWrap(UVWrap.Clamp, UVWrap.Clamp);
			this._fb[i].attach(Attachment.Color0, dest[i]);
		}
		this._rect = <ResourceWrap<Geometry>>rgen.get(new RPGeometry("Rect01"));
	}
	setSource(src: GLTexture2DP): void {
		this._rf.set(Tag.Source, src);
	}
	private _dest(): GLTexture2DP[] {
		return this._rf.get(Tag.Dest);
	}
	private _source(): GLTexture2DP {
		return this._rf.get(Tag.Source);
	}
	private _coeff(): number[] {
		return this._rf.get(Tag.Coeff);
	}
	result(): GLTexture2DP {
		return this._dest()[1];
	}
	setDispersion(d: number): void {
		this._rf.set(Tag.Dispersion, d);
	}
	onDraw(): void {
		if(this._source()) {
			const coeff = this._coeff();
			for(let i=0 ; i<2 ; i++) {
				engine.setTechnique(GaussFilter.TechName[i]);
				const src = (i===0) ? this._source() : this._dest()[0];
				engine.setUniforms({
					u_weight: coeff,
					u_mapSize: src.truesize().toVec4(),
					u_uvrect: src.uvrect().toVec4(),
					u_texDiffuse: src
				});
				this._fb[i].attach(Attachment.Color0, this._dest()[i]);
				this._fb[i].vp_proc(()=> {
					engine.drawGeometry(this._rect.data);
				});
			}
		}
	}
}
