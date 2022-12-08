#!/bin/bash
while getopts v: flag
do
    case "${flag}" in
        v) version=${OPTARG};;
    esac
done

if [ -z "$version" ] 
    then
        echo -e "\n[Error]. Missing -v flag";
        exit;
fi

if [ -d "./examples/v$version" ] 
    then
        echo -e "\n[Error]. This example allready exist";
        exit;
fi

echo -e "\n[0/5]. Creating examples for version [v$version] \n";

mkdir ./examples/v$version 
mkdir ./examples/v$version/cdn 
mkdir ./examples/v$version/npm
mkdir ./examples/v$version/npm/example-one
mkdir ./examples/v$version/npm/example-two
echo -e "[1/5]. New examples directory structure created \n";

cp -r ./dist/dist/. ./examples/v$version/cdn
cp ./images/oltb-icon.svg ./examples/v$version/cdn
touch ./examples/v$version/cdn/index.html
touch ./examples/v$version/cdn/map.js
echo -e "[2/5]. Created CDN example files \n";

touch ./examples/v$version/npm/example-one/index.html
touch ./examples/v$version/npm/example-one/map.js
cp ./images/oltb-icon.svg ./examples/v$version/npm/example-one

touch ./examples/v$version/npm/example-two/index.html
touch ./examples/v$version/npm/example-two/map.js
cp ./images/oltb-icon.svg ./examples/v$version/npm/example-two
echo -e "[3/5]. Created NPM example files";

npm link
echo -e "\n[4/5]. Created global symlink";

cd ./examples/v$version/npm
npm link oltb
echo -e "\n[5/5]. Linked oltb to example [v$version]";
