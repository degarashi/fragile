const gulp = require("gulp");
const cache = require("gulp-cached");
const plumber = require("gulp-plumber");

const srcDir = "./src";
const interDir = "./inter";
const distDir = "./dist";
const docDir = "./doc";

// ------------- document -------------
const typedoc = require("gulp-typedoc");
// typedocに入力するファイル
const docSrc = [srcDir + "/fragile/**/!(_)*.ts"];
const projectName = "Fragile";
gulp.task("doc", function(){
	const td = typedoc({
		module: "es6",
		target: "es6",

		out: docDir,
		name: projectName,
		ignoreCompileErrors: false,
		version: true
	});
	return gulp.src(docSrc)
		.pipe(plumber())
		.pipe(td);
});

// ------------ makealias ------------
const makealias = require("./makealias");
gulp.task("makealias", function(){
	return makealias(srcDir+"/resource", "resource", srcDir+"/_alias.ts");
});
gulp.task("makealias-f", function(){
	return makealias(srcDir+"/fragile/resource", "fragile/resource", srcDir+"/fragile/_alias.ts");
});
gulp.task("makealiases", ["makealias", "makealias-f"]);

// ----------------- typescript -----------------
const ts = require("gulp-typescript");
const tsConfig = require("./tsconfig.json");
const tsProj = ts.createProject(tsConfig.compilerOptions);

const tsSrc = [srcDir+"/**/*.ts", srcDir+"/**/*/*.ts"];
const tsSrc_na = [srcDir+"/**/!(_)*.ts"];
gulp.task("ts", ["makealiases"], function(){
	return gulp.src(tsSrc)
		.pipe(cache("ts"))
		.pipe(plumber())
		.pipe(tsProj())
		.pipe(gulp.dest(interDir));
});

// ----------------- watch -----------------
// ソールファイル編集を検知してコンパイル実行
const glslExt = ["vsh", "glsl", "fsh"];
const glslExtStr = `{${glslExt.join(",")}}`;
const glslSrc = [
	srcDir+"/**/resource/*." + glslExtStr,
	srcDir+"/**/fragile/resource/*." + glslExtStr
];
gulp.task("watch", ["package", "doc"], function(){
	gulp.watch(tsSrc_na, ["rollup"]);
	gulp.watch(glslSrc, ["glslify"]);
	gulp.watch(docSrc, ["doc"]);
});
gulp.task("default", ["watch"]);

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

const variant = ["", "-b", "-bu", "-a"];
// モジュール統合のみ
gulp.task("rollup" + variant[0], ["ts"], function(){
	return gulp.src(jssrc)
		.pipe(plumber())
		.pipe(rollup_pipe([]))
		.pipe(gulp.dest(distDir));
});
// bubleによるトランスパイル
gulp.task("rollup" + variant[1], ["ts"], function(){
	return gulp.src(jssrc)
		.pipe(plumber())
		.pipe(rollup_pipe([rollup_plugins_buble]))
		.pipe(gulp.dest(distDir));
});
// buble + uglify
gulp.task("rollup" + variant[2], ["ts"], function(){
	return gulp.src(jssrc)
		.pipe(plumber())
		.pipe(rollup_pipe([
			rollup_plugins_buble,
			rollup_plugins_uglify
		]))
		.pipe(gulp.dest(distDir));
});
// babelによるトランスパイル
gulp.task("rollup" + variant[3], ["ts"], function(){
	return gulp.src(jssrc)
		.pipe(plumber())
		.pipe(rollup_pipe([
			rollup_plugins_babel
		]))
		.pipe(gulp.dest(distDir));
});

// ------------ glslify ------------
const glslify = require("gulp-glslify");
gulp.task("glslify", function(){
	return gulp.src(glslSrc)
		.pipe(cache("glslify"))
		.pipe(plumber())
		.pipe(glslify())
		.pipe(gulp.dest(distDir));
});

const defPkg = (aux="")=> {
	gulp.task("package" + aux, ["rollup" + aux, "glslify"],
		function(cb){ cb(); });
};
variant.forEach(function(elem){
	defPkg(elem);
});

// ------------ deployスクリプトの実行 ------------
const shell = require("gulp-shell");
function Deploy() {
	gulp.src("./deploy.sh")
		.pipe(shell([
			"<%= file.path %>"
		]));
}
gulp.task("deploy", Deploy);

const defAll = (aux="")=> {
	gulp.task("all" + aux, ["package" + aux], Deploy);
};
variant.forEach(function(elem){
	defAll(elem);
});
