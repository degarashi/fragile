const gulp = require("gulp");
const srcDir = "./src";
const interDir = "./inter";
const distDir = "./dist";

// ------------ makealias ------------
const makealias = require("./makealias");
gulp.task("makealias", function(){
	return makealias(srcDir+"/resource", "resource", srcDir+"/_alias.ts");
});
gulp.task("makealias-f", function(){
	return makealias(srcDir+"/fragile/resource", "fragile/resource", srcDir+"/fragile/_alias.ts");
});
gulp.task("makealiases", ["makealias", "makealias-f"], function(){});

// ----------------- typescript -----------------
const ts = require("gulp-typescript");
const tsConfig = require("./tsconfig.json");
const tsProj = ts.createProject(tsConfig.compilerOptions);

const tssrc = [srcDir+"/**/*.ts", srcDir+"/**/*/*.ts"];
gulp.task("ts", ["makealiases"], function(){
	return gulp.src(tssrc)
		.pipe(tsProj())
		.pipe(gulp.dest(interDir));
});
// ----------------- typescript-watch -----------------
gulp.task("watch", function(){
	gulp.watch(tssrc, ["ts"]);
});

// ----------------- rollup -----------------
const rollup = require("gulp-rollup");
const buble = require("rollup-plugin-buble");
const uglify = require("rollup-plugin-uglify");
const babel = require("rollup-plugin-babel");
const incpath = require("rollup-plugin-includepaths");
const rollup_plugins_incpath =
	incpath(
		{
			paths: [interDir + "/fragile"]
		}
	);

const jssrc = interDir + "/**/*.js";
const jssrc_main = interDir + "/main.js";
const rollup_plugins_buble =
	buble(
		{
			chrome: 42,
			node: 4,
			firefox: 45,
			safari: 9,
			edge: 12,
			ie: 11
		}
	);
const rollup_plugins_uglify = uglify();
const rollup_plugins_babel = babel({
	presets: ["es2015-rollup"]
});
const rollup_pipe = function(plugins) {
	return rollup({
		entry: jssrc_main,
		format: "iife",
		plugins: plugins.concat([rollup_plugins_incpath]),
		allowRealFiles: true
	});
};
gulp.task("rollup", ["ts"], function(){
	gulp.src(jssrc_main)
		.pipe(rollup_pipe([]))
		.pipe(gulp.dest(distDir));
});
gulp.task("rollup-b", ["ts"], function(){
	gulp.src(jssrc)
		.pipe(rollup_pipe([rollup_plugins_buble]))
		.pipe(gulp.dest(distDir));
});
gulp.task("rollup-bu", ["ts"], function(){
	gulp.src(jssrc)
		.pipe(rollup_pipe([
			rollup_plugins_buble,
			rollup_plugins_uglify
		]))
		.pipe(gulp.dest(distDir));
});
gulp.task("rollup-a", ["ts"], function(){
	gulp.src(jssrc)
		.pipe(rollup_pipe([
			rollup_plugins_babel
		]))
		.pipe(gulp.dest(distDir));
});

// ------------ glslify ------------
const glslsrc = [srcDir+"/**/resource/*.{vsh,fsh}", srcDir+"/**/fragile/resource/*.{vsh,fsh}"];
const glslify = require("gulp-glslify");
gulp.task("glslify", function(){
	gulp.src(glslsrc)
		.pipe(glslify())
		.pipe(gulp.dest(distDir));
});

gulp.task("package", ["rollup", "glslify"]);

// ------------ deployスクリプトの実行 ------------
const shell = require("gulp-shell");
gulp.task("deploy", ["package"], function(){
	return gulp.src("./deploy.sh")
		.pipe(shell([
			"<%= file.path %>"
		]));
});

gulp.task("default", ["package"]);
