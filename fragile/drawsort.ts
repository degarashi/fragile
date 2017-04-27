import DrawTag from "./drawtag";
export type SortAlg = (t0: DrawTag, t1: DrawTag)=> number;
export namespace DrawSort {
	export const Priority = (t0: DrawTag, t1: DrawTag): number => {
		if(t0.priority < t1.priority)
			return -1;
		if(t0.priority > t1.priority)
			return 1;
		return 0;
	};
}
