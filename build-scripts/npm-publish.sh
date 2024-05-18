#!/bin/bash
TReset='\033[0m';
TCyan='\033[0;36m';

echo -e "\n$TCyan[0/3]$TReset. Publishing package to npmjs.org";

npm login
user=$(npm whoami)
echo -e "\n$TCyan[1/2]$TReset. Session created for [$user]";

npm publish ./dist --access public
echo -e "\n$TCyan[2/3]$TReset. Published package";

npm logout
echo -e "\n$TCyan[3/3]$TReset. Session terminated for [$user]";