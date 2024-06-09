#!/bin/bash
TReset='\033[0m';
TCyan='\033[0;36m';

# 0
echo -e "\n$TCyan[0/2]$TReset. Examples cleanup";

# 1
npm unlink -g
echo -e "\n$TCyan[1/2]$TReset. Removed global symlink";

# 2
cd ./examples/npm
npm unlink oltb
echo -e "\n$TCyan[2/2]$TReset. Unlinked oltb from examples";