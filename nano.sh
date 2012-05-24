#!/bin/sh
echo "nano me. $1 $2"
pwd

temp=$1
dest=$2
#rm -rf $dest
#mkdir $dest
#
#mkdir "$dest/dojo"
#mkdir "$dest/dx-media"
#
cp "$temp/dojo/dojo.js" "$dest/dojo/dojo.js"
#cp "$temp/dojo/i18n.js" "$dest/dojo/i18n.js"
#
cp -R "./resources" "$dest/dx-media/resources"
#
cp "$temp/dx-media/layer.js" "$dest/dx-media/layer.js"
#
#cp "./tests/built_PlayerMobile.html" "$dest/index.html"
