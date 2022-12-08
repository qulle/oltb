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

if [ ! -d "./examples/v$version" ] 
    then
        echo -e "\n[Error]. This example does not exist";
        exit;
fi

echo -e "\n[0/2]. Cleaning examples for version [v$version]";

npm unlink -g
echo -e "\n[1/2]. Removed global symlink";

cd ./examples/v$version/npm
npm unlink oltb
echo -e "\n[2/2]. Unlinked oltb from example [v$version]";
