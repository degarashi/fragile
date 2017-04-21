import Discardable from "./discardable";
import GLContext from "./gl_context";
interface GLResource extends Discardable, GLContext {}
export default GLResource;
