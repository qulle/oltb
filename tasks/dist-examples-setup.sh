#!/bin/bash
echo -e "\n[0/3]. Examples setup \n";

npm link
echo -e "\n[1/3]. Created global symlink";

cd ./examples/npm
npm link oltb
echo -e "\n[2/3]. Linked oltb to examples";

cp ./dist/dist/* ./examples/cdn/
echo -e "\n[3/3]. Copied CDN lib to examples";