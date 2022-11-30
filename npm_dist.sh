#!/bin/bash
rm -rf ./dist
echo "(1). Old dist removed"

mkdir ./dist ./dist/dist ./dist/src ./dist/src/oltb
echo "(2). New dist created"

cp -r ./src/oltb/js ./dist/src/oltb
cp -r ./src/oltb/scss ./dist/src/oltb
echo "(3). Copied src files"

cp ./package.json ./dist/package.json
cp ./README.md ./dist/README.md
cp ./README_INTERNAL.md ./dist/README_INTERNAL.md
echo "(4). Copied documentation files"

echo "----------------------------------------------------------------"
echo "(5). Make sure:"
echo "     - Version is bumbed in package.json"
echo "     - Version is bumbed in rollup.cssbanner.mjs"
echo "     - Version is bumbed in rollup.jsbanner.mjs"
echo "----------------------------------------------------------------"
echo "(6). Next step:"
echo "     - Create portable build '$ npm run build:lib'"
echo "     - Publish new version to npmjs '$ bash npm_publish.sh'"