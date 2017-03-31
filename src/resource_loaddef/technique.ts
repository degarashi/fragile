import {MoreResource, ResourceExtToType, ResourceInfo} from "../resource_aux";
import XHRLoader from "../xhr_loader";
import {resource} from "../global";
import Technique from "../technique";

ResourceExtToType.prog = "Technique";
ResourceInfo.Technique = {
	makeLoader: function(url: string) {
		return new XHRLoader(url, "json");
	},
	makeResource: function(src: any) {
		// 必要なリソースがまだ足りてなければ関数を引数にしてコール
		if(!resource.checkResource(src.dependancy)) {
			return new MoreResource(src.dependancy);
		} else
			return new Technique(src);
	}
};
