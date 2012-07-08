

var profile = (function(){

	// the tag tests...
	var test = function(filename, mid){
			return /tests\//.test(mid);
		},

		copyOnly = function(filename, mid){
			var list = {
				"dx-media/package.json":1
			};
			return (mid in list) || /resources\/[^.]+\.(?!css)/.test(mid);
		},

		ignore = function(filename, mid){
			var list = {
				"dx-media/build/dx-media-nano":1,
				"dx-media/package.json":1,
				"dx-media/build/package.json":1,
				"dx-media/build/dx-media.profile":1,
				"dx-media/README.md":1
			};
			//console.log('ignore:', mid, (mid in list) || /deploy/.test(mid))
			return (mid in list) || /dx-dojo/.test(mid) || /deploy/.test(mid);
		},

		amd = function(filename, mid){
			var isAMD = !copyOnly(filename, mid) && !ignore(filename, mid) && /\.js$/.test(filename);
			//console.log(isAMD ? 'is AMD' :  'not AMD:', mid)
			return isAMD;
		};

	return {

		selectorEngine:"lite",

		newlineFilter: function(s){
		   // convert all DOS-style newlines to Unix-style newlines
		   return s.replace(/\r\n/g, "\n").replace(/\n\r/g, "\n");
		},

		resourceTags:{
			ignore:ignore,
			test:test,
			copyOnly:copyOnly,
			amd:amd
		},

		// these are all the has feature that affect the loader and/or the bootstrap
		// the settings below are optimized for the smallest AMD loader that is configurable
		// and include dom-ready support
		staticHasFeatures:{
			// dojo/dojo
			'config-dojo-loader-catches':0,

			// dojo/dojo
			'config-tlmSiblingOfDojo':0,

			// dojo/dojo
			'dojo-amd-factory-scan':0,

			// dojo/dojo
			'dojo-combo-api':0,

			// dojo/_base/config, dojo/dojo
			'dojo-config-api':1,

			// dojo/main
			'dojo-config-require':0,

			// dojo/_base/kernel
			'dojo-debug-messages':0,

			// dojo/dojo
			'dojo-dom-ready-api':1,

			// dojo/main
			'dojo-firebug':0,

			// dojo/_base/kernel
			'dojo-guarantee-console':1,

			// dojo/has
			'dojo-has-api':1,

			// dojo/dojo
			'dojo-inject-api':1,

			// dojo/_base/config, dojo/_base/kernel, dojo/_base/loader, dojo/ready
			'dojo-loader':1,

			// dojo/dojo
			'dojo-log-api':0,

			// dojo/_base/kernel
			'dojo-modulePaths':0,

			// dojo/_base/kernel
			'dojo-moduleUrl':0,

			// dojo/dojo
			'dojo-publish-privates':0,

			// dojo/dojo
			'dojo-requirejs-api':0,

			// dojo/dojo
			'dojo-sniff':0,

			// dojo/dojo, dojo/i18n, dojo/ready
			'dojo-sync-loader':0,

			// dojo/dojo
			'dojo-test-sniff':0,

			// dojo/dojo
			'dojo-timeout-api':0,

			// dojo/dojo
			'dojo-trace-api':0,

			// dojo/dojo
			'dojo-undef-api':0,

			// dojo/i18n
			'dojo-v1x-i18n-Api':0,

			// dojo/_base/xhr
			'dojo-xhr-factory':0,

			// dojo/_base/loader, dojo/dojo, dojo/on
			'dom':1,

			// dojo/dojo
			'host-browser':1,

			// dojo/_base/array, dojo/_base/connect, dojo/_base/kernel, dojo/_base/lang
			'extend-dojo':1,

			selectorEngine:"lite"
		}
	};

})();
