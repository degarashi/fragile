import Discardable from "./discardable";

interface Drawable extends Discardable {
	onDraw(): boolean;
}
export default Drawable;
