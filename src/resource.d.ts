import GLContext from "./gl_context";
import Discardable from "./discardable";
interface Resource extends GLContext, Discardable {}
export default Resource;
