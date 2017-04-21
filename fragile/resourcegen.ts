import {resource} from "./global";
import ResourceParam from "./resourcegen/param";
import {NoSuchResource} from "./resstack";
import Resource from "./resource";

export let ResourceGenSrc:{[key:string]: (rp: ResourceParam)=>Resource;} = {};
const ResourceGen = (function(){
	return {
		get: function(rp: ResourceParam): Resource {
			const key = rp.key;
			try {
				return resource.getResource(key);
			} catch(e) {
				if(!(e instanceof NoSuchResource))
					throw e;
			}
			const buff = ResourceGenSrc[rp.name](rp);
			resource.addResource(key, buff);
			return buff;
		}
	};
})();
export default ResourceGen;
