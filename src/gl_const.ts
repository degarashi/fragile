export const enum EnumBase {
	Num = 0x800000000
}
export enum TextureType {
	Texture2D = EnumBase.Num
}
export enum TextureQuery {
	Texture2D = EnumBase.Num
}
export enum BufferType {
	Vertex = EnumBase.Num,
	Index
}
export enum BufferQuery {
	Vertex = EnumBase.Num,
	Index
}
export enum ShaderType {
	Vertex = EnumBase.Num,
	Fragment
}
export enum DrawType {
	Static = EnumBase.Num,
	Stream,
	Dynamic
}
export enum Attachment {
	Color0 = EnumBase.Num,
	Color1,
	Color2,
	Color3,
	Depth,
	Stencil,
	DepthStencil
}
export enum RBFormat {
	Depth16 = EnumBase.Num,
	Stencil8,
	RGBA4,
	RGB5_A1,
	RGB565
}
export enum InterFormat {
	Alpha = EnumBase.Num,
	RGB,
	RGBA,
	Luminance,
	LuminanceAlpha
}
export enum TexDataFormat {
	UB = EnumBase.Num,
	US565,
	US4444,
	US5551
}
export class GLSLTypeInfoItem {
	constructor(
		public id: number,
		public name: string,
		public size: number,
		public uniformF?: Function,
		public uniformAF?: Function,
		public vertexF?: Function
	) {}
}
export class GLTypeInfoItem {
	constructor(
		public id: number,
		public bytesize: number
	) {}
}
// gl.enable/disable
export enum BoolSetting {
	Blend = EnumBase.Num,
	Cullface,
	Depthtest,
	Dither,
	Polygonoffsetfill,
	Samplealphatocoverage,
	Samplecoverage,
	Scissortest,
	Stenciltest
}
export const BoolString: string[] = [
	"blend",
	"cullface",
	"depthtest",
	"dither",
	"polygonoffsetfill",
	"samplealphatocoverage",
	"samplecoverage",
	"scissortest",
	"stenciltest"
]
export enum BlendEquation {
	Add = EnumBase.Num,
	Sub,
	Reversesub
}
export enum BlendFunc {
	Zero = EnumBase.Num,
	One,
	SrcColor,
	DstColor,
	OneMinusSrcColor,
	OneMinusDstColor,
	SrcAlpha,
	DstAlpha,
	OneMinusSrcAlpha,
	OneMinusDstAlpha,
	ConstantColor,
	OneMinusConstantColor,
	ONEMinusConstantAlpha,
	SrcAlphaSaturate
}
export enum DepthStencilFunc {
	Never = EnumBase.Num,
	Always,
	Less,
	LessEqual,
	Equal,
	NotEqual,
	Greater,
	GreaterEqual
}
export enum StencilOp {
	Keep = EnumBase.Num,
	Zero,
	Replace,
	Increment,
	Decrement,
	Invert,
	IncrementWrap,
	DecrementWrap
}
export enum Face {
	Front = EnumBase.Num,
	Back,
	FrontAndBack
}
export enum CW {
	Cw = EnumBase.Num,
	Ccw
}
export enum DataFormat {
	Byte = EnumBase.Num,
	UByte,
	Short,
	UShort,
	Int,
	UInt,
	Float
}
export enum UVWrap {
	Repeat = EnumBase.Num,
	Mirror,
	Clamp
}
class Conv<E> {
	private readonly _i2gl: number[] = [];
	private readonly _gl2i: {[key: number]: number;} = {};
	private readonly _str2i: {[key: string]: number;} = {};
	private readonly _length: number;
	constructor(...arg: [string, number][]) {
		for(let i=0 ; i<arg.length ; i++) {
			const [name,num] = [arg[i][0], arg[i][1]];
			const id = EnumBase.Num + i;
			this._i2gl[id] = num;
			this._gl2i[num] = id;
			this._str2i[name] = id;
			this._str2i[name.toLowerCase()] = id;
		}
		this._length = arg.length;
	}
	convert(id: number): E;
	convert(id: E): number;
	convert(id: any): any {
		if(id < EnumBase.Num)
			return this._gl2i[id];
		return this._i2gl[id];
	}
	toString(id: E|number): string {
		if(id < EnumBase.Num)
			return this._gl2i[<number>id].toString();
		return id.toString();
	}
	fromString(name: string): E;
	fromString(name: any): any {
		return this._str2i[name];
	}
	fromStringToGL(name: string): number {
		return this.convert(this.fromString(name));
	}
	length(): number {
		return this._length;
	}
	indexToEnum(idx: number): E {
		return <E><any>(idx + EnumBase.Num);
	}
}
export default class GLConst {
	static TextureC: Conv<TextureType>;
	static TextureQueryC: Conv<TextureQuery>;
	static ShaderTypeC: Conv<ShaderType>;
	static BufferTypeC: Conv<BufferType>;
	static BufferQueryC: Conv<BufferQuery>;
	static DrawTypeC: Conv<DrawType>;
	static AttachmentC: Conv<Attachment>;
	static RBFormatC: Conv<RBFormat>;
	static InterFormatC: Conv<InterFormat>;
	static TexDataFormatC: Conv<TexDataFormat>;
	static DataFormatC: Conv<DataFormat>;
	static BoolSettingC: Conv<BoolSetting>;
	static BlendEquationC: Conv<BlendEquation>;
	static BlendFuncC: Conv<BlendFunc>;
	static DepthStencilFuncC: Conv<DepthStencilFunc>;
	static StencilOpC: Conv<StencilOp>;
	static FaceC: Conv<Face>;
	static CWC: Conv<CW>;
	static UVWrapC: Conv<UVWrap>;
	static readonly GLSLTypeInfo: {[key: number]: GLSLTypeInfoItem;} = {};
	static readonly GLTypeInfo: {[key: number]: GLTypeInfoItem;} = {};
	static readonly Type2GLType: {[key: string]: GLTypeInfoItem;} = {};
	static readonly ValueSetting: {[key: string]: Function;} = {};
	constructor(gl: WebGLRenderingContext) {
		const ItrBegin = EnumBase.Num;
		{
			let i=ItrBegin;
			GLConst.TextureC = new Conv<TextureType>(
				[TextureType[i++], gl.TEXTURE_2D]
			);
		}
		{
			let i=ItrBegin;
			GLConst.TextureQueryC = new Conv<TextureQuery>(
				[TextureQuery[i++], gl.TEXTURE_BINDING_2D]
			);
		}
		{
			let i=ItrBegin;
			GLConst.ShaderTypeC = new Conv<ShaderType>(
				[ShaderType[i++], gl.VERTEX_SHADER],
				[ShaderType[i++], gl.FRAGMENT_SHADER]
			);
		}
		{
			let i=ItrBegin;
			GLConst.BufferTypeC = new Conv<BufferType>(
				[BufferType[i++], gl.ARRAY_BUFFER],
				[BufferType[i++], gl.ELEMENT_ARRAY_BUFFER]
			);
		}
		{
			let i=ItrBegin;
			GLConst.BufferQueryC = new Conv<BufferQuery>(
				[BufferQuery[i++], gl.ARRAY_BUFFER_BINDING],
				[BufferQuery[i++], gl.ELEMENT_ARRAY_BUFFER_BINDING]
			);
		}
		{
			let i=ItrBegin;
			GLConst.DrawTypeC = new Conv<DrawType>(
				[DrawType[i++], gl.STATIC_DRAW],
				[DrawType[i++], gl.STREAM_DRAW],
				[DrawType[i++], gl.DYNAMIC_DRAW]
			);
		}
		{
			let i=ItrBegin;
			GLConst.AttachmentC = new Conv<Attachment>(
				[Attachment[i++], gl.COLOR_ATTACHMENT0],
				[Attachment[i++], gl.COLOR_ATTACHMENT0+1],
				[Attachment[i++], gl.COLOR_ATTACHMENT0+2],
				[Attachment[i++], gl.COLOR_ATTACHMENT0+3],
				[Attachment[i++], gl.DEPTH_ATTACHMENT],
				[Attachment[i++], gl.STENCIL_ATTACHMENT],
				[Attachment[i++], gl.DEPTH_STENCIL_ATTACHMENT]
			);
		}
		{
			let i=ItrBegin;
			GLConst.RBFormatC = new Conv<RBFormat>(
				[RBFormat[i++], gl.DEPTH_COMPONENT16],
				[RBFormat[i++], gl.STENCIL_INDEX8],
				[RBFormat[i++], gl.RGBA4],
				[RBFormat[i++], gl.RGB5_A1],
				[RBFormat[i++], gl.RGB565]
			);
		}
		{
			let i=ItrBegin;
			GLConst.InterFormatC = new Conv<InterFormat>(
				[InterFormat[i++], gl.ALPHA],
				[InterFormat[i++], gl.RGB],
				[InterFormat[i++], gl.RGBA],
				[InterFormat[i++], gl.LUMINANCE],
				[InterFormat[i++], gl.LUMINANCE_ALPHA]
			);
		}
		{
			let i=ItrBegin;
			GLConst.TexDataFormatC = new Conv<TexDataFormat>(
				[TexDataFormat[i++], gl.UNSIGNED_BYTE],
				[TexDataFormat[i++], gl.UNSIGNED_SHORT_5_6_5],
				[TexDataFormat[i++], gl.UNSIGNED_SHORT_4_4_4_4],
				[TexDataFormat[i++], gl.UNSIGNED_SHORT_5_5_5_1]
			);
		}
		{
			let i=ItrBegin;
			// gl.enable/disable
			GLConst.BoolSettingC = new Conv<BoolSetting>(
				[BoolSetting[i++], gl.BLEND],
				[BoolSetting[i++], gl.CULL_FACE],
				[BoolSetting[i++], gl.DEPTH_TEST],
				[BoolSetting[i++], gl.DITHER],
				[BoolSetting[i++], gl.POLYGON_OFFSET_FILL],
				[BoolSetting[i++], gl.SAMPLE_ALPHA_TO_COVERAGE],
				[BoolSetting[i++], gl.SAMPLE_COVERAGE],
				[BoolSetting[i++], gl.SCISSOR_TEST],
				[BoolSetting[i++], gl.STENCIL_TEST]
			);
		}
		{
			let i=ItrBegin;
			GLConst.BlendEquationC = new Conv<BlendEquation>(
				[BlendEquation[i++], gl.FUNC_ADD],
				[BlendEquation[i++], gl.FUNC_SUBTRACT],
				[BlendEquation[i++], gl.FUNC_REVERSE_SUBTRACT]
			);
		}
		{
			let i=ItrBegin;
			GLConst.BlendFuncC = new Conv<BlendFunc>(
				[BlendFunc[i++], gl.ZERO],
				[BlendFunc[i++], gl.ONE],
				[BlendFunc[i++], gl.SRC_COLOR],
				[BlendFunc[i++], gl.DST_COLOR],
				[BlendFunc[i++], gl.ONE_MINUS_SRC_COLOR],
				[BlendFunc[i++], gl.ONE_MINUS_DST_COLOR],
				[BlendFunc[i++], gl.SRC_ALPHA],
				[BlendFunc[i++], gl.DST_ALPHA],
				[BlendFunc[i++], gl.ONE_MINUS_SRC_ALPHA],
				[BlendFunc[i++], gl.ONE_MINUS_DST_ALPHA],
				[BlendFunc[i++], gl.CONSTANT_COLOR],
				[BlendFunc[i++], gl.ONE_MINUS_CONSTANT_COLOR],
				[BlendFunc[i++], gl.ONE_MINUS_CONSTANT_ALPHA],
				[BlendFunc[i++], gl.SRC_ALPHA_SATURATE]
			);
		}
		{
			let i=ItrBegin;
			GLConst.DataFormatC = new Conv<DataFormat>(
				[DataFormat[i++], gl.BYTE],
				[DataFormat[i++], gl.UNSIGNED_BYTE],
				[DataFormat[i++], gl.SHORT],
				[DataFormat[i++], gl.UNSIGNED_SHORT],
				[DataFormat[i++], gl.INT],
				[DataFormat[i++], gl.UNSIGNED_INT],
				[DataFormat[i++], gl.FLOAT]
			);
		}
		{
			let i=ItrBegin;
			GLConst.DepthStencilFuncC = new Conv<DepthStencilFunc>(
				[DepthStencilFunc[i++], gl.NEVER],
				[DepthStencilFunc[i++], gl.ALWAYS],
				[DepthStencilFunc[i++], gl.LESS],
				[DepthStencilFunc[i++], gl.LEQUAL],
				[DepthStencilFunc[i++], gl.EQUAL],
				[DepthStencilFunc[i++], gl.NOTEQUAL],
				[DepthStencilFunc[i++], gl.GREATER],
				[DepthStencilFunc[i++], gl.GEQUAL]
			);
		}
		{
			let i=ItrBegin;
			GLConst.StencilOpC = new Conv<StencilOp>(
				[StencilOp[i++], gl.KEEP],
				[StencilOp[i++], gl.ZERO],
				[StencilOp[i++], gl.REPLACE],
				[StencilOp[i++], gl.INCR],
				[StencilOp[i++], gl.DECR],
				[StencilOp[i++], gl.INVERT],
				[StencilOp[i++], gl.INCR_WRAP],
				[StencilOp[i++], gl.DECR_WRAP]
			);
		}
		{
			let i=ItrBegin;
			GLConst.FaceC = new Conv<Face>(
				[Face[i++], gl.FRONT],
				[Face[i++], gl.BACK],
				[Face[i++], gl.FRONT_AND_BACK]
			);
		}
		{
			let i=ItrBegin;
			GLConst.CWC = new Conv<CW>(
				[CW[i++], gl.CW],
				[CW[i++], gl.CCW]
			);
		}
		{
			let i=ItrBegin;
			GLConst.UVWrapC = new Conv<UVWrap>(
				[UVWrap[i++], gl.REPEAT],
				[UVWrap[i++], gl.MIRRORED_REPEAT],
				[UVWrap[i++], gl.CLAMP_TO_EDGE]
			);
		}
		{
			const t = GLConst.GLSLTypeInfo;
			t[gl.INT] = new GLSLTypeInfoItem(gl.INT, "Int", 1, gl.uniform1i, gl.uniform1iv);
			t[gl.INT_VEC2] = new GLSLTypeInfoItem(gl.INT_VEC2, "IntVec2", 2, gl.uniform2i, gl.uniform2iv);
			t[gl.INT_VEC3] = new GLSLTypeInfoItem(gl.INT_VEC3, "IntVec3", 3, gl.uniform3i, gl.uniform3iv);
			t[gl.INT_VEC4] = new GLSLTypeInfoItem(gl.INT_VEC4, "IntVec4", 4, gl.uniform4i, gl.uniform4iv);
			t[gl.FLOAT] = new GLSLTypeInfoItem(gl.FLOAT, "Float", 1, gl.uniform1f, gl.uniform1fv, gl.vertexAttrib1f);
			t[gl.FLOAT_VEC2] = new GLSLTypeInfoItem(gl.FLOAT_VEC2, "FloatVec2", 2, gl.uniform2f, gl.uniform2fv, gl.vertexAttrib2fv);
			t[gl.FLOAT_VEC3] = new GLSLTypeInfoItem(gl.FLOAT_VEC3, "FloatVec3", 3, gl.uniform3f, gl.uniform3fv, gl.vertexAttrib3fv);
			t[gl.FLOAT_VEC4] = new GLSLTypeInfoItem(gl.FLOAT_VEC4, "FloatVec4", 4, gl.uniform4f, gl.uniform4fv, gl.vertexAttrib4fv);
			t[gl.FLOAT_MAT2] = new GLSLTypeInfoItem(gl.FLOAT_MAT2, "FloatMat2", 2, undefined, gl.uniformMatrix2fv, undefined);
			t[gl.FLOAT_MAT3] = new GLSLTypeInfoItem(gl.FLOAT_MAT3, "FloatMat3", 3, undefined, gl.uniformMatrix3fv);
			t[gl.FLOAT_MAT4] = new GLSLTypeInfoItem(gl.FLOAT_MAT4, "FloatMat4", 4, undefined, gl.uniformMatrix4fv);
			t[gl.SAMPLER_2D] = new GLSLTypeInfoItem(gl.SAMPLER_2D, "Sampler2D", 1, gl.uniform1i, undefined);
		}
		{
			const t = GLConst.GLTypeInfo;
			t[gl.BYTE] = new GLTypeInfoItem(gl.BYTE, 1);
			t[gl.UNSIGNED_BYTE] = new GLTypeInfoItem(gl.UNSIGNED_BYTE, 1);
			t[gl.SHORT] = new GLTypeInfoItem(gl.SHORT, 2);
			t[gl.UNSIGNED_SHORT] = new GLTypeInfoItem(gl.UNSIGNED_SHORT, 2);
			t[gl.INT] = new GLTypeInfoItem(gl.INT, 4);
			t[gl.UNSIGNED_INT] = new GLTypeInfoItem(gl.UNSIGNED_INT, 4);
			t[gl.FLOAT] = new GLTypeInfoItem(gl.FLOAT, 4);
		}
		{
			const cnv = GLConst.DataFormatC;
			const s = GLConst.GLTypeInfo;
			const t = GLConst.Type2GLType;
			t.Int8Array = s[cnv.convert(DataFormat.Byte)];
			t.Uint8Array = s[cnv.convert(DataFormat.UByte)];
			t.Uint8ClampedArray = s[cnv.convert(DataFormat.UByte)];
			t.Int16Array = s[cnv.convert(DataFormat.Short)];
			t.Uint16Array = s[cnv.convert(DataFormat.UShort)];
			t.Int32Array = s[cnv.convert(DataFormat.Int)];
			t.Uint32Array = s[cnv.convert(DataFormat.UInt)];
			t.Float32Array = s[cnv.convert(DataFormat.Float)];
		}
		{
			const t = GLConst.ValueSetting;
			t.blendcolor = gl.blendColor;
			const bfc = GLConst.BlendFuncC;
			t.blendequation = function(mode0: string, mode1: string = mode0) {
				gl.blendEquationSeparate(
					bfc.fromStringToGL(mode0),
					bfc.fromStringToGL(mode1)
				);
			};
			t.blendfunc = function(sf0: string, df0: string, sf1: string=sf0, df1: string=df0) {
				gl.blendFuncSeparate(
					bfc.fromStringToGL(sf0),
					bfc.fromStringToGL(df0),
					bfc.fromStringToGL(sf1),
					bfc.fromStringToGL(df1)
				);
			};
			const dsfunc = GLConst.DepthStencilFuncC;
			t.depthfunc = function(func: string) {
				gl.depthFunc(dsfunc.fromStringToGL(func));
			};
			t.samplecoverage = gl.sampleCoverage;
			t._stencilfunc = function(dir: number, func: string, ref: number, mask: number) {
				gl.stencilFuncSeparate(
					dir,
					dsfunc.fromStringToGL(func),
					ref,
					mask
				);
			};
			t.stencilfuncfront = function(func: string, ref: number, mask: number) {
				t._stencilfunc(gl.FRONT, func, ref, mask);
			};
			t.stencilfuncback = function(func: string, ref: number, mask: number) {
				t._stencilfunc(gl.BACK, func, ref, mask);
			};
			t.stencilfunc = function(func: string, ref: number, mask: number) {
				t._stencilfunc(gl.FRONT_AND_BACK, func, ref, mask);
			};
			const sop = GLConst.StencilOpC;
			t._stencilop = function(dir: number, func: string, ref: number, mask: number) {
				gl.stencilOpSeparate(dir, sop.fromStringToGL(func), ref, mask);
			};
			t.stencilop = function(func: string, ref: number, mask: number) {
				t._stencilop(gl.FRONT_AND_BACK, func, ref, mask);
			};
			t.stencilopfront = function(func: string, ref: number, mask: number) {
				t._stencilop(gl.FRONT, func, ref, mask);
			};
			t.stencilopback = function(func: string, ref: number, mask: number) {
				t._stencilop(gl.BACK, func, ref, mask);
			};
			t.colormask = gl.colorMask;
			t.depthmask = gl.depthMask;
			t.stencilmask = gl.stencilMask;
			t.stencilmaskfront = function(mask: number) {
				gl.stencilMaskSeparate(gl.FRONT, mask);
			};
			t.stencilmaskback = function(mask: number) {
				gl.stencilMaskSeparate(gl.BACK, mask);
			};
			const facec = GLConst.FaceC;
			t.cullface = function(dir: string) {
				gl.cullFace(facec.fromStringToGL(dir));
			};
			const cwc = GLConst.CWC;
			t.frontface = function(cw: string) {
				gl.frontFace(cwc.fromStringToGL(cw));
			};
			t.linewidth = gl.lineWidth;
			t.polygonoffset = gl.polygonOffset;
		}
	}
}
