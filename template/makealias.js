"use strict";

const fs = require("fs");
module.exports = function(readPath, base, writePath){
	fs.readdir(readPath, function(err, files){
		if(err) {
			throw err;
		}
		const ret = {};
		files.forEach(function(file){
			if(fs.statSync(`${readPath}/${file}`)) {
				const r = /([^.]+)\..+$/.exec(file);
				if(r) {
					const path = r[0];
					const alias = r[1];
					if(ret[alias] !== undefined) {
						process.stderr.write(`Duplicate file alias (${base}/${path}, already have ${ret[alias]})`);
						process.exit(1);
					}
					ret[alias] = `${base}/${path}`;
				}
			}
		});
		const fd = fs.openSync(writePath, "w");
		fs.writeSync(fd, "const Alias = ", "utf8");
		fs.writeSync(fd, JSON.stringify(ret), "utf8");
		fs.writeSync(fd, ";\nexport default Alias;", "utf8");
		fs.closeSync(fd);
	});
};
