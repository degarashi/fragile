import ResourceLoader from "./resource_loader";
import RLoaderCB from "./rloader_cb";

export default class ImageLoader implements ResourceLoader {
	private _url: string;
	private _timerId: number|null;
	private _status: string;
	private _cb: RLoaderCB;
	private _img: HTMLImageElement;
	private _errormsg: string;

	constructor(url: string) {
		const img = new Image();
		img.onload = ()=> {
			if(this._timerId) {
				this._timerId = null;
				this._status = "complete";
				this._cb.progress(1, 1);
				this._cb.completed();
			}
		};
		this._url = url;
		this._img = img;
		this._status = "idle";
	}
	begin(callback: RLoaderCB, timeout: number) {
		if(timeout < 0)
			timeout = 60000;
		this._timerId = setTimeout(()=> {
			if(this._timerId) {
				// timeout
				this._status = "error";
				this._errormsg = "connection timedout";
				this._cb.error();
			}
		}, timeout);
		this._cb = callback;
		this._img.src = this._url;
		this._status = "loading";
		callback.progress(0, 1);
	}
	abort() {
		this._timerId = null;
		this._status = "abort";
	}
	errormsg(): string {
		return this._errormsg;
	}
	status(): string {
		return this._status;
	}
	result(): any {
		return this._img;
	}
}
