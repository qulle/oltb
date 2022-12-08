#!/bin/bash
echo -e "\n[0/3]. Starting new demo-build \n";

rm -rf ./demo 
rm -rf .parcel-cache/
echo -e "[1/3]. Old demo removed \n";

mkdir ./demo
echo -e "[2/3]. New demo directory created";

npm run build:demo
echo -e "\n[3/3]. Parcel created demo";
