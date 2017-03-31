import Engine from "./engine";
import InputMgr from "./inputmgr";
import SceneMgr from "./scenemgr";
import ResStack from "./resstack";

export let gl: WebGLRenderingContext;
export function SetGL(g: any) { gl = g; }
export let engine: Engine;
export function SetEngine(e: Engine) { engine = e; }
export let resource: ResStack;
export function SetResource(r: ResStack) { resource = r; }
export let input: InputMgr;
export function SetInput(i: InputMgr) { input = i; }
export let scene: SceneMgr;
export function SetScene(s: SceneMgr) { scene = s; }
