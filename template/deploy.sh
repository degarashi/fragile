#!/bin/bash

# 1=SRC, 2=DST, 3=extension
function CopySingle() {
	local readonly SRC=$1
	local readonly DST=$2
	local readonly EXT=$3
	cp $SRC/*.$EXT $DST 2>/dev/null || :
}
# 1=SRC, 2=DST, 3...=extension
function Copy() {
	local readonly SRC=$1
	local readonly DST=$2
	shift 2
	mkdir -p ${DST}
	for x in "$@"
	do
		CopySingle $SRC $DST $x
	done
}

SRC="./src"
DST="./dist"
INTER="./inter"
cp ${INTER}/fragile/arrayfunc.js ${DST}
cp ${SRC}/*.html ${DST}
cp ${SRC}/*.css ${DST}

Copy "${SRC}/resource" "${DST}/resource" png jpg def prog
Copy "${SRC}/fragile/resource" "${DST}/fragile/resource" png jpg def prog

rsync -rlOtcv --delete ${DST}/ /var/www/html
