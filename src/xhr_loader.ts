import ResourceLoader from "./resource_loader";

export default class XHRLoader {
	private _xhr: XMLHttpRequest;
	private _status: string;
	private _errormsg: string;
	private _cbCompleted: ()=>void;
	private _cbError: ()=>void;

	constructor(url: string, type: string) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = type;
		xhr.onload = ()=> {
			let xhr = this._xhr;
			if(xhr.readyState === 4) {
				if(xhr.status === 200) {
					this._status = "complete";
					this._cbCompleted();
				} else {
					this._status = "error";
					this._errormsg = xhr.statusText;
					this._cbError();
				}
			}
		};
		xhr.onerror = ()=> {
			this._errormsg = "unknown error";
			this._cbError();
		};
		this._status = "idle";
		this._xhr = xhr;
	}
	begin(cbCompleted: ()=>void, cbError: ()=>void): void {
		this._cbCompleted = cbCompleted;
		this._cbError = cbError;
		this._status = "loading";
		this._xhr.send(null);
	}
	abort(): void {
		this._status = "abort";
		this._xhr.abort();
	}
	errormsg(): string {
		return this._errormsg;
	}
	status(): string {
		return this._status;
	}
	result(): any {
		return this._xhr.response;
	}
}
