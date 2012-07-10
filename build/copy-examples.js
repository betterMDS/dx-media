// run this file with Node.js
// This copys built files into the examples folder
// (it is not examples of how to copy)

var fs = require("../../node/lib/fs").fs;
var log = require("../../node/lib/log").log('CPY', 1);

var
	name, srcDir, dstDir, src, dst;

var args = process.argv;
for(var i=0; i<args.length; i++){
	var a = args[i];
	switch(i){
		case 0:
			// always "node"
			break;
		case 1:
			// always this file (copy-examples.js)
			break;
		case 2:
			log('arg 2, profile name:', a);
			name = a;
			break;
		case 3:
			log('arg 3, src dir:', a);
			srcDir = a;
			break;
		case 4:
			log('arg 4, dst dir:', a);
			dstDir = a;
			break;
	}
}

switch(name){
	case 'mobile':
		src = srcDir + '/dx-media/layer.js';
		dst = dstDir + '/mobile.js';
		fs.copy(src, dst);
		break;
	case 'dojo':
		src = srcDir + '/dojo/dojo.js';
		dst = dstDir + '/dojo/dojo.js';
		fs.copy(src, dst);
		break;
}

/*
if(args[2]){
	var file = args[2];
	if(!/\//.test(file)) file = './' + file;
	struct = require(file).struct;
	if(!struct){
		console.log("ERROR: Can't find structure. Did you provide a full path?");
		process.exit(1);
	}
}else{
	console.log('ERROR: First argument, structure, is required.');
	process.exit(1);
}
if(!!args[3]){
	if(typeof args[3] == 'boolean'){
		log('version it!', args[3]);
		incrementVersion = true;
	}else if(typeof args[3] == 'string'){
		log('root path provided: ', args[3]);
		struct.root = args[3];
		if(typeof args[4] == 'string'){
			log('dest path provided: ', args[4]);
			struct.dest = args[4];
		}
	}
}
*/
