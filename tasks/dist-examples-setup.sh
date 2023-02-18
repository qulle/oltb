#!/bin/bash
TReset='\033[0m';
TCyan='\033[0;36m';

echo -e "\n$TCyan[0/3]$TReset. Examples setup";

cp ./dist/dist/* ./examples/cdn/
echo -e "\n$TCyan[1/3]$TReset. Copied CDN lib to examples";

npm link
echo -e "\n$TCyan[2/3]$TReset. Created global symlink";

cd ./examples/npm
npm link oltb
ls -al $(npm root -g) | grep "\->"
echo -e "\n$TCyan[3/3]$TReset. Linked oltb to examples";
