interface GLContext {
	onContextLost(): void;
	onContextRestored(): void;
	contextLost(): boolean;
}
export default GLContext;
