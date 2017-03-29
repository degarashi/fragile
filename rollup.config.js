// import buble from "rollup-plugin-buble";
// import uglify from "rollup-plugin-uglify";
// import babel from "rollup-plugin-babel";

export default {
	entry: "dist/main.js",
	dest: "dist/bundle.js",
	plugins: [
		// buble(
			// {
				// chrome: 42,
				// node: 4,
				// firefox: 45,
				// safari: 9,
				// edge: 12,
				// ie: 11
			// }
		// ),
		// uglify(),
		// babel()
	],
	format: 'iife'
}
