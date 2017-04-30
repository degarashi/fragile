import Discardable from "./discardable";

interface Drawable extends Discardable {
	onDraw(): void;
}
export default Drawable;
