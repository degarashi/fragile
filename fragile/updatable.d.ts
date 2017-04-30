import Discardable from "./discardable";

interface Updatable extends Discardable {
	onUpdate(dt: number): boolean;
}
export default Updatable;
