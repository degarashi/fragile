import RLoaderCB from "./rloader_cb";
import XHRLoader from "./xhr_loader";

export default class ImageLoader extends XHRLoader {
	private _img: HTMLImageElement;

	constructor(url: string) {
		super(url, "blob");
	}
	begin(callback: RLoaderCB, timeout: number) {
		super.begin(
			{
				completed: ()=> {
					const img = new Image();
					this._img = img;
					img.src = window.URL.createObjectURL(super.result());
					img.onload = ()=> {
						callback.completed();
					};
				},
				error: callback.error,
				progress: callback.progress
			},
			timeout
		);
	}
	result(): any {
		return this._img;
	}
}
