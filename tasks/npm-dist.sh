#!/bin/bash
TReset='\033[0m';
TCyan='\033[0;36m';

echo -e "\n$TCyan[0/5]$TReset. Starting new dist-build";

rm -rf ./dist
echo -e "\n$TCyan[1/5]$TReset. Old dist removed";

mkdir ./dist 
mkdir ./dist/dist 
mkdir ./dist/src 
mkdir ./dist/src/oltb
echo -e "\n$TCyan[2/5]$TReset. New dist directory created";

cp -r ./src/oltb/js ./dist/src/oltb
cp -r ./src/oltb/scss ./dist/src/oltb
echo -e "\n$TCyan[3/5]$TReset. Copied src files";

cp ./package.json ./dist/package.json
cp ./LICENSE ./dist/LICENSE
cp ./README.md ./dist/README.md
cp ./README_INTERNAL.md ./dist/README_INTERNAL.md
echo -e "\n$TCyan[4/5]$TReset. Copied documentation files";

npm run build:lib
echo -e "\n$TCyan[5/5]$TReset. Rollup created IIFE lib";
