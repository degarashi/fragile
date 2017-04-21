import GLTexture2D from "./gl_texture2d";
import Rect from "./rect";
import Range from "./range";
import Size from "./size";

interface FontChar {
	chara: boolean;
	char: string;
	code: number;
	texture?: GLTexture2D;
	uvrect?: Rect;
	width?: number;
	height?: Range;
}
export default FontChar;
