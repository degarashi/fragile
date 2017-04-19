cd `dirname $0`

npm run makealias
if [ $? -gt 1 ]; then
	echo "makealias.js ERROR"
	exit 1
fi
npm run tsc
if [ $? -gt 1 ]; then
	echo "typescript ERROR"
	exit 1
fi
npm run rollup
if [ $? -gt 1 ]; then
	echo "rollup.js ERROR"
	exit 1
fi

rsync -auv --delete ./resource/ ../dist/resource/
npm run glslify
if [ $? -gt 1 ]; then
	echo "glslify ERROR"
	exit 1
fi
cp ./*.html ../dist
cp ./*.css ../dist
rsync -auv --delete ../dist/ pi@raspi:/var/www/gl/
