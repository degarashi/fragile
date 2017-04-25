interface RLoaderCB {
	completed: ()=>void;
	progress: (loaded:number, total:number)=>void;
	error: ()=>void;
}
export default RLoaderCB;
