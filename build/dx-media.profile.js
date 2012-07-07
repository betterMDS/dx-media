

var profile = (function(){

	// the tag tests...
	var test = function(filename, mid){
			return /tests\//.test(mid);
		},

		copyOnly = function(filename, mid){
			var list = {
				"dx-media/dx-media.profile":1,
				"dx-media/package.json":1
			};
			return (mid in list) || /resources\/[^.]+\.(?!css)/.test(mid);
		},

		ignore = function(filename, mid){
			return /dx-dojo/.test(mid) || /deploy/.test(mid);
		},

		amd = function(filename, mid){
			var isAMD = !copyOnly(filename, mid) && !ignore(filename, mid) && /\.js$/.test(filename);
			//console.log(isAMD ? 'is AMD' :  'not AMD:', mid)
			return isAMD;
		};

	return {
		staticHasFeatures: {
			selectorEngine:"lite"
		},

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

		// relative to this file
		basePath:".",

		// relative to basePath
		//releaseDir:"./media-deploy",

		packages:[
			{
				name:"dojo",
				location:"../dojo"
			},{
				name:"dijit",
				location:"../dijit"
			},{
				name:"dx-media",
				location:"."
			},{
				name:"dx-alias",
				location:"../dx-alias"
			},{
				name:"dx-timer",
				location:"../dx-timer"
			}
		],

		layers:{
			"dojo/dojo":{
				include:[
					"dojo/Deferred",
					"dojo/Evented",
					"dojo/NodeList-dom",
					"dojo/Stateful",
					"dojo/_base/Color",
					"dojo/_base/Deferred",
					"dojo/_base/NodeList",
					"dojo/_base/array",
					"dojo/_base/browser",
					"dojo/_base/config",
					"dojo/_base/connect",
					"dojo/_base/declare",
					"dojo/_base/event",
					"dojo/_base/fx",
					"dojo/_base/html",
					"dojo/_base/json",
					"dojo/_base/kernel",
					"dojo/_base/lang",
					"dojo/_base/loader",
					"dojo/_base/sniff",
					"dojo/_base/unload",
					"dojo/_base/url",
					"dojo/_base/window",
					"dojo/_base/xhr",
					"dojo/aspect",
					"dojo/cache",
					"dojo/date/stamp",
					"dojo/dom",
					"dojo/dom-attr",
					"dojo/dom-class",
					"dojo/dom-construct",
					"dojo/dom-form",
					"dojo/dom-geometry",
					"dojo/dom-prop",
					"dojo/dom-style",
					"dojo/domReady",
					"dojo/domReady!",
					"dojo/errors/CancelError",
					"dojo/errors/RequestError",
					"dojo/errors/RequestTimeoutError",
					"dojo/errors/create",
					"dojo/fx/easing",
					"dojo/has",
					"dojo/has!0",
					"dojo/has!dojo/_base/browser",
					"dojo/has!dojo/_base/loader",
					"dojo/has!dojo/_base/window",
					"dojo/has!dojo/_base/xhr",
					"dojo/has!dojo/domReady",
					"dojo/has!dojo/promise/instrumenting",
					"dojo/io-query",
					"dojo/io/script",
					"dojo/json",
					"dojo/keys",
					"dojo/main",
					"dojo/mouse",
					"dojo/on",
					"dojo/parser",
					"dojo/promise/Promise",
					"dojo/promise/instrumenting",
					"dojo/query",
					"dojo/ready",
					"dojo/request/handlers",
					"dojo/request/script",
					"dojo/request/util",
					"dojo/request/watch",
					"dojo/request/xhr",
					"dojo/selector/_loader",
					"dojo/selector/_loader!default",
					"dojo/selector/acme",
					"dojo/sniff",
					"dojo/string",
					"dojo/text",
					"dojo/text",
					"dojo/topic",
					"dojo/touch",
					"dojo/uacss",
					"dojo/when",

					"dijit/Destroyable",
					"dijit/_Container",
					"dijit/_TemplatedMixin",
					"dijit/_WidgetBase",
					"dijit/main",
					"dijit/registry"
				]
			}

			,"dx-media/layer":{
				include:[
					"dx-media/controls/Controlbar",
					"dx-media/controls/elements/Embed",
					"dx-media/controls/elements/Facebook",
					"dx-media/controls/elements/ScreenPlayButton",
					"dx-media/controls/elements/Slideshow",
					"dx-media/controls/elements/Twitter",
					"dx-media/controls/elements/Video",
					"dx-media/controls/elements/Vtour",
					"dx-media/controls/elements/_Base",
					"dx-media/controls/elements/_Button",

					"dx-media/html5/Image",
					"dx-media/html5/Photo",
					"dx-media/html5/Preview",
					"dx-media/html5/Slideshow",
					"dx-media/html5/Vtour",
					"dx-media/html5/VtourCanvas",

					"dx-media/mobile/Video",
					"dx-media/mobile/common",
					"dx-media/mobile/sniff",
					"dx-media/mobile/uacss",

					"dx-media/player/Mobile",

					"dx-media/plugins/VAST"
				]
			}
			,"dx-alias/layer":{
				include:[
					"dx-alias/Widget",
					"dx-alias/dom",
					"dx-alias/groups",
					"dx-alias/has",
					"dx-alias/lang",
					"dx-alias/log",
					"dx-alias/mouse",
					"dx-alias/on",
					"dx-alias/shim",
					"dx-alias/string",
					"dx-alias/topic",

					"dx-timer/timer"
				]
			}
		}
	};

})();
