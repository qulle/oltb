#!/bin/bash
echo -e "[0/3]. Starting new demo-build..."
echo -e "       Make sure:"
echo -e "       - Version is bumped in package.json \n"

rm -rf ./demo .parcel-cache/
echo -e "[1/3]. Old demo removed \n"

mkdir ./demo
echo -e "[2/3]. New demo created \n"

npm run build:demo
echo -e "[3/3]. Parcel created demo \n"