import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";
import GLVShader from "../gl_vshader";
import GLFShader from "../gl_fshader";

ResourceExtToType.vsh = "VertexShader";
ResourceExtToType.fsh = "FragmentShader";
ResourceInfo.VertexShader = {
	makeLoader: function(url: string) {
		return new XHRLoader(url, "text");
	},
	makeResource: function(src: any) {
		return new GLVShader(src);
	}
};
ResourceInfo.FragmentShader = {
	makeLoader: function(url: string) {
		return new XHRLoader(url, "text");
	},
	makeResource: function(src: any) {
		return new GLFShader(src);
	}
};
