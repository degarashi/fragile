import {Assert, ExtractExtension} from "./utilfuncs";

export const ResourceExtToType:{[key: string]: string;} = {};
interface ResourceLoadDef {
	makeLoader(url: string): any;
	makeResource(src: any): any;
}
export const ResourceInfo:{[key: string]: ResourceLoadDef;} = {};

export function GetResourceInfo(fpath: string) {
	// 拡張子でリソースタイプを判断
	const ext = ExtractExtension(fpath);
	if(!ext)
		throw new Error("no extension found");
	const rtype = ResourceExtToType[ext];
	if(typeof rtype === "undefined")
		throw new Error("unknown extension");
	const info = ResourceInfo[rtype];
	if(!info)
		throw new Error("loader not found");
	return info;
}
export class MoreResource {
	array: string[];
	constructor(...arg: string[]) {
		this.array = arg;
	}
}
export function ASyncGet(loaders:any[], maxConnection:number, cbComplete:()=>void, cbError:()=>void) {
	let lastCur = 0;
	let nComp = 0;
	let task:any = [];
	function Request(taskIndex: number): void {
		const cur = lastCur++;
		Assert(cur < loaders.length);
		Assert(task[taskIndex] === null);
		task[taskIndex] = cur;
		loaders[cur].begin(
			function(){
				OnComplete(taskIndex);
			},
			function(){
				OnError(taskIndex);
			}
		);
	}
	function OnError(taskIndex: number): void {
		// 他のタスクを全て中断
		for(let i=0 ; i<task.length ; i++) {
			const li = task[i];
			if(li !== null && li !== taskIndex) {
				loaders[li].abort();
			}
		}
		cbError();
	}
	function OnComplete(taskIndex: number): void {
		Assert(typeof task[taskIndex] === "number");
		task[taskIndex] = null;
		++nComp;
		if(lastCur < loaders.length) {
			// 残りのタスクを開始
			Request(taskIndex);
		} else {
			if(nComp === loaders.length)
				cbComplete();
		}
	}
	for(let i=0 ; i<Math.min(loaders.length, maxConnection) ; i++) {
		task[i] = null;
		Request(i);
	}
}
