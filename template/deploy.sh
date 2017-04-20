cp ./inter/fragile/arrayfunc.js ./dist
cp ./src/*.html ./dist
cp ./src/*.css ./dist
cp ./src/resource/*.png ./dist/resource
cp ./src/resource/*.jpg ./dist/resource
cp ./src/resource/*.def ./dist/resource
cp ./src/resource/*.prog ./dist/resource
cp ./src/fragile/resource/*.png ./dist/fragile/resource
cp ./src/fragile/resource/*.jpg ./dist/fragile/resource
cp ./src/fragile/resource/*.def ./dist/fragile/resource
cp ./src/fragile/resource/*.prog ./dist/fragile/resource

rsync -auv --delete ./dist/ pi@raspi:/var/www/gl/
