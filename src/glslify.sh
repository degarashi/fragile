cd `dirname $0`

cd resource
for file in `\find .  -maxdepth 1 -name "*.?sh" -type f -printf "%P "`; do
	glslify $file -t glslify-import -o ../../dist/resource/$file
	if [ $? -gt 0 ]; then
		echo "glslify ERROR in ${file}"
		exit 1
	fi
done
cd ..
