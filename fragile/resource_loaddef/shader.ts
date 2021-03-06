import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";
import GLVShader from "../gl_vshader";
import GLFShader from "../gl_fshader";
import Resource from "../resource";
import ResourceLoader from "../resource_loader";

ResourceExtToType.vsh = "VertexShader";
ResourceExtToType.fsh = "FragmentShader";
ResourceInfo.VertexShader = {
	makeLoader: function(url: string): ResourceLoader {
		return new XHRLoader(url, "text");
	},
	makeResource: function(src: any): Resource {
		return new GLVShader(src);
	}
};
ResourceInfo.FragmentShader = {
	makeLoader: function(url: string): ResourceLoader {
		return new XHRLoader(url, "text");
	},
	makeResource: function(src: any): Resource {
		return new GLFShader(src);
	}
};
