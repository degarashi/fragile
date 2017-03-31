import GLTexture from "./gl_texture";
import {TextureType} from "./gl_const";

export default class GLTexture2D extends GLTexture {
	typeId(): TextureType {
		return TextureType.Texture2D;
	}
}
