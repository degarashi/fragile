import GLTexture from "./gl_texture";
import {TextureType, TextureQuery} from "./gl_const";

export default class GLTexture2D extends GLTexture {
	typeId(): TextureType {
		return TextureType.Texture2D;
	}
	typeQueryId(): TextureQuery {
		return TextureQuery.Texture2D;
	}
}
