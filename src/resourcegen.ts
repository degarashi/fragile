import {resource} from "./global";
import ResourceParam from "./resourcegen/param";

export let ResourceGenSrc:{[key:string]: (rp: ResourceParam)=>any;} = {};
const ResourceGen = (function(){
	return {
		get: function(rp: ResourceParam) {
			const key = rp.key;
			const ret = resource.getResource(key);
			if(ret)
				return ret;
			const buff = ResourceGenSrc[rp.name](rp);
			resource.addResource(key, buff);
			return buff;
		}
	};
})();
export default ResourceGen;
