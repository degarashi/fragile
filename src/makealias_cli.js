"use strict";

if(process.argv.length !== 5)
	process.exit(1);
const readPath = process.argv[2];
const base = process.argv[3];
const writePath = process.argv[4];

const makealias = require("./makealias");
makealias(readPath, base, writePath);
