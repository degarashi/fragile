import ResourceLoader from "./resource_loader";

export default class ImageLoader implements ResourceLoader {
	private _url: string;
	private _timerId: number|null;
	private _status: string;
	private _cbCompleted: ()=>void;
	private _cbError: ()=>void;
	private _img: HTMLImageElement;
	private _errormsg: string;

	constructor(url: string) {
		const img = new Image();
		img.onload = ()=> {
			this._timerId = null;
			this._status = "complete";
			this._cbCompleted();
		};
		this._url = url;
		this._img = img;
		this._status = "idle";
	}
	begin(cbCompleted: ()=>void, cbError: ()=>void) {
		this._timerId = setTimeout(()=> {
			if(this._timerId) {
				// timeout
				this._status = "error";
				this._errormsg = "connection timedout";
				this._cbError();
			}
		}, 5000);
		this._cbCompleted = cbCompleted;
		this._cbError = cbError;
		this._img.src = this._url;
		this._status = "loading";
	}
	abort() {
		// 非対応
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
