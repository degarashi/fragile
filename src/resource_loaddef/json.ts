import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";

ResourceExtToType.def = "JSON";
ResourceInfo.JSON = {
	makeLoader: function(url: string) {
		return new XHRLoader(url, "json");
	},
	makeResource: function(src: any) {
		return src;
	}
};
