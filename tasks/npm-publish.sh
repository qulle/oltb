#!/bin/bash
echo -e "\n[0/3]. Publishing package to npmjs.org \n";

npm login
user=$(npm whoami)
echo -e "\n[1/2]. Session created for [$user]";

# npm push
echo -e "\n[2/3]. Pushed package";

npm logout
echo -e "\n[3/3]. Session terminated for [$user]";