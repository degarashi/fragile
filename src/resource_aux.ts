import {Assert, ExtractExtension} from "./utilfuncs";
import ResourceLoader from "./resource_loader";
import Resource from "./resource";

export const ResourceExtToType:{[key: string]: string;} = {};
export interface ResourceLoadDef {
	makeLoader(url: string): ResourceLoader;
	makeResource(src: any): Resource;
}
export const ResourceInfo:{[key: string]: ResourceLoadDef;} = {};

export function GetResourceInfo(fpath: string): ResourceLoadDef {
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
	depend: string[];
	constructor(...arg: string[]) {
		this.depend = arg;
	}
}
export function ASyncGet(loaders:ResourceLoader[], maxConnection:number, cbComplete:()=>void, cbError:()=>void): void {
	let lastCur:number = 0;
	let nComp:number = 0;
	const task:(number|null)[] = [];
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
