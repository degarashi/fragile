import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import ImageLoader from "../image_loader";
import GLTexture2D from "../gl_texture2d";
import {InterFormat, TexDataFormat} from "../gl_const";
import Resource from "../resource";
import ResourceLoader from "../resource_loader";

ResourceExtToType.png = "Image";
ResourceExtToType.jpg = "Image";
ResourceInfo.Image = {
	makeLoader: function(url: string): ResourceLoader {
		return new ImageLoader(url);
	},
	makeResource: function(src: any): Resource {
		const tex = new GLTexture2D();
		tex.setImage(InterFormat.RGBA, InterFormat.RGBA, TexDataFormat.UB, src);
		tex.genMipmap();
		return tex;
	}
};
