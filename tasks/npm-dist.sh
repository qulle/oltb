#!/bin/bash
echo -e "\n[0/5]. Starting new lib-build \n";

rm -rf ./dist
echo -e "[1/5]. Old dist removed \n";

mkdir ./dist 
mkdir ./dist/dist 
mkdir ./dist/src 
mkdir ./dist/src/oltb
echo -e "[2/5]. New dist directory created \n";

cp -r ./src/oltb/js ./dist/src/oltb
cp -r ./src/oltb/scss ./dist/src/oltb
echo -e "[3/5]. Copied src files \n";

cp ./package.json ./dist/package.json
cp ./LICENSE ./dist/LICENSE
cp ./README.md ./dist/README.md
cp ./README_INTERNAL.md ./dist/README_INTERNAL.md
echo -e "[4/5]. Copied documentation files";

npm run build:lib
echo -e "\n[5/5]. Rollup created IIFE lib \n";
