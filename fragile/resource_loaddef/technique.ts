import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";
import {resource} from "../global";
import Technique from "../technique";
import Resource from "../resource";
import ResourceLoader from "../resource_loader";

ResourceExtToType.prog = "Technique";
ResourceInfo.Technique = {
	makeLoader: function(url: string): ResourceLoader {
		return new XHRLoader(url, "json");
	},
	makeResource: function(src: any): Resource {
		return new Technique(src);
	}
};
