import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import ImageLoader from "../image_loader";
import GLTexture2D from "../gl_texture2d";
import {InterFormat, TexDataFormat} from "../gl_const";

ResourceExtToType.png = "Image";
ResourceExtToType.jpg = "Image";
ResourceInfo.Image = {
	makeLoader: function(url: string) {
		return new ImageLoader(url);
	},
	makeResource: function(src: any) {
		const tex = new GLTexture2D();
		tex.setImage(0, InterFormat.RGBA, InterFormat.RGBA, TexDataFormat.UB, src);
		tex.genMipmap();
		return tex;
	}
};
