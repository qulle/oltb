#!/bin/bash
echo -e "[0/6]. Starting new lib-build..."
echo -e "       Make sure:"
echo -e "       - Version is bumped in package.json"
echo -e "       - JS-banner is updated rollup.jsbanner.mjs"
echo -e "       - CSS-banner is updated rollup.cssbanner.mjs \n"

rm -rf ./dist
echo -e "[1/6]. Old dist removed \n"

mkdir ./dist ./dist/dist ./dist/src ./dist/src/oltb
echo -e "[2/6]. New dist created \n"

cp -r ./src/oltb/js ./dist/src/oltb
cp -r ./src/oltb/scss ./dist/src/oltb
echo -e "[3/6]. Copied src files \n"

cp ./package.json ./dist/package.json
cp ./LICENSE ./dist/LICENSE
cp ./README.md ./dist/README.md
cp ./README_INTERNAL.md ./dist/README_INTERNAL.md
echo -e "[4/6]. Copied documentation files \n"

npm run build:lib
echo -e "[5/6]. Rollup created IIFE lib \n"

echo -e "[6/6]. Next steps:"
echo -e "     - Create and verify new example '$ npm link'"
echo -e "     - Publish new version to npmjs '$ bash npm_publish.sh' \n"