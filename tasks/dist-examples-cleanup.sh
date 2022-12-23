#!/bin/bash
echo -e "\n[0/2]. Examples cleanup \n";

npm unlink -g
echo -e "\n[1/2]. Removed global symlink";

cd ./examples/npm
npm unlink oltb
echo -e "\n[2/2]. Unlinked oltb from examples";
