cd `dirname $0`

npm run makealias
if [ $? -gt 1 ]; then
	echo "makealias.js ERROR"
	exit 1
fi
tsc
if [ $? -gt 1 ]; then
	echo "typescript ERROR"
	exit 1
fi
npm run build
if [ $? -gt 1 ]; then
	echo "rollup.js ERROR"
	exit 1
fi

cd resource
for file in `\find .  -maxdepth 1 -name "*.?sh" -type f -printf "%P "`; do
	glslify $file -t glslify-import -o ../../dist/resource/$file
	if [ $? -gt 0 ]; then
		echo "glslify ERROR in ${file}"
		exit 1
	fi
done
cd ..

rsync -auv --delete ./resource/ ../dist/resource/
cp ./*.html ../dist
cp ./*.css ../dist
rsync -auv --delete ../dist/ pi@raspi:/var/www/gl/
