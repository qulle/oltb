#!/bin/bash
TReset='\033[0m';
TCyan='\033[0;36m';

echo -e "\n$TCyan[0/4]$TReset. Starting new demo-build";

rm -rf ./demo
rm -rf .parcel-cache/
echo -e "\n$TCyan[1/4]$TReset. Old demo removed";

mkdir ./demo
echo -e "\n$TCyan[2/4]$TReset. New demo directory created";

npm run build:demo
echo -e "\n$TCyan[3/4]$TReset. Parcel created demo";

cp -r ./assets ./demo 
echo -e "\n$TCyan[3/4]$TReset. Assets directory copied to demo";