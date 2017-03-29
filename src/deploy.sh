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

for file in `\find . -maxdepth 1 -name "*.?sh" -type f`; do
	glslify $file -t glslify-import -o ../dist/$file
	if [ $? -gt 0 ]; then
		echo "glslify ERROR in ${file}"
		exit 1
	fi
done
rsync -auv --delete ./ pi@raspi:/var/www/gl
scp ../dist/* pi@raspi:/var/www/gl
