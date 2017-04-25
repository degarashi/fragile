import ResourceLoader from "./resource_loader";
import RLoaderCB from "./rloader_cb";

export default class XHRLoader implements ResourceLoader {
	private _xhr: XMLHttpRequest;
	private _status: string;
	private _errormsg: string;
	private _cb: RLoaderCB;
	private _loaded: number;
	private _total: number;

	constructor(url: string, type: string) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = type;
		xhr.onprogress = (e: ProgressEvent)=> {
			if(e.lengthComputable) {
				this._cb.progress(e.loaded, e.total);
				this._loaded = e.loaded;
				this._total = e.total;
			}
		};
		xhr.onload = ()=> {
			let xhr = this._xhr;
			if(xhr.readyState === 4) {
				if(xhr.status === 200) {
					this._status = "complete";
					this._cb.progress((this._loaded >= 0) ? this._total : 0, this._total);
					this._cb.completed();
				} else {
					this._status = "error";
					this._errormsg = xhr.statusText;
					this._cb.error();
				}
			}
		};
		xhr.ontimeout = (e: ProgressEvent)=> {
			this._errormsg = "timeout";
			this._cb.error();
		};
		xhr.onerror = ()=> {
			this._errormsg = "unknown error";
			this._cb.error();
		};
		this._status = "idle";
		this._xhr = xhr;
	}
	begin(callback: RLoaderCB, timeout: number): void {
		this._cb = callback;
		this._status = "loading";
		this._xhr.timeout = timeout;
		this._loaded = 0;
		this._total = 0;
		callback.progress(this._loaded, this._total);
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
