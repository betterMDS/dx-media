#!/bin/sh

usage() {
cat <<-__EOF__;
NAME
     build.sh - build the app application with the Dojo Build System

SYNOPSIS
     path/to/app/build.sh [OPTION] [build system options]

DESCRIPTION
     build.sh is a shell script that deletes the current contents of the app-deploy tree and then
     invokes the Dojo Build System passing the app profile to effect a build of the app application.

     NOTE: you must provide a build option such as release (-r) or check (--check) in order
     for the Dojo build program to do anything

OPTIONS
     --help     print this help message
     --dbhelp   print the Dojo Build System help message
     -r         execute a release build witch optimizes and minifies resource
     -c         destroy the app-deploy tree and exit
     -d         execute a debug build which does not optimize and minify resources; with this
                option a Dojo Build Execute options (-r, --check, etc.) must be given explicitly

EXAMPLES
     path/to/app/build.sh -r

     Builds app, including optimization and minification:


     path/to/app/build.sh -r --optimize 0

     Builds app, including optimization and minification, execept don't optimize nonlayer Javascript resources


     path/to/app/build.sh -d

     Builds app, but skip the optimization/minification processes.


     path/to/app/build.sh -d --check

     Executes the build with the --check switch

__EOF__
}


name=$1
tempDir="../TEMP"
releaseDir="../deploy"
buildDir=$tempDir


copy() {
	#echo "Creating nano deployment"
	#./nano.sh "../"$tempDir "../"$releaseDir
	#node ../../node/nano.js "../dx-media/build/"$name"-nano.js" "../"$tempDir "../"$releaseDir
	node "./copy-examples.js" $name "../"$tempDir "../"$releaseDir
}
delete() {
	echo "Deleting old directory"
	rm -rf "./../"$buildDir
}

echo "\n\n\n\n\nBuilding $name"
cd `dirname $0`


echo $name" build to folder: $buildDir"
shift
../../util/buildscripts/build.sh -p $name".profile.js" -releaseDir $buildDir --layerOptimize 0 --optimize 0 --cssOptimize comments.keepLines -r $@
copy
#delete




# --check / no workee?
# Process all command line switches and dump the computed profile to the console.
#
# --check-args
# Process all command line switches and dump the raw profile resources to the console (the profile resources are not aggregated).
#
# --check-discovery / no workee?
# Echo all discovered resources and exit
