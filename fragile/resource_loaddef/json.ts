import {ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";
import Resource from "../resource";
import ResourceLoader from "../resource_loader";
import ResourceWrap from "../resource_wrap";

ResourceExtToType.def = "JSON";
ResourceInfo.JSON = {
	makeLoader: function(url: string): ResourceLoader {
		return new XHRLoader(url, "json");
	},
	makeResource: function(src: any): Resource {
		return new ResourceWrap<Object>(src);
	}
};
