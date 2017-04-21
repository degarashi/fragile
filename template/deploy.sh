SRC="./src"
DST="./dist"
cp ./inter/fragile/arrayfunc.js ${DST}
cp ${SRC}/*.html ${DST}
cp ${SRC}/*.css ${DST}

RES_SRC="${SRC}/resource"
RES_DST="${DST}/resource"
cp ${RES_SRC}/*.png ${RES_DST} \
	${RES_SRC}/*.jpg ${RES_DST} \
	${RES_SRC}/*.def ${RES_DST} \
	${RES_SRC}/*.prog ${RES_DST} 2>/dev/null || :

RES_SRC="${SRC}/fragile/resource"
RES_DST="${DST}/fragile/resource"
cp ${RES_SRC}/*.png ${RES_DST} \
	${RES_SRC}/*.jpg ${RES_DST} \
	${RES_SRC}/*.def ${RES_DST} \
	${RES_SRC}/*.prog ${RES_DST} 2>/dev/null || :

rsync -rlOtcv --delete ${DST}/ pi@raspi:/var/www/gl/
