#!/bin/bash
echo -e "\n[0/2]. Examples setup \n";

npm link
echo -e "\n[1/2]. Created global symlink";

cd ./examples/npm
npm link oltb
echo -e "\n[2/2]. Linked oltb to examples;
