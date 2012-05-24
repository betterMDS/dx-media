

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
					"dojo/Evented",
					"dojo/NodeList-dom",
					"dojo/Stateful",
					"dojo/_base/Color",
					"dojo/_base/Deferred",
					"dojo/_base/NodeList",
					"dojo/_base/array",
					"dojo/_base/browser",
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
					"dojo/_base/loader",
					"dojo/_base/sniff",
					"dojo/_base/unload",
					"dojo/_base/url",
					"dojo/_base/window",
					"dojo/_base/xhr",
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
					"dojo/domReady",
					"dojo/fx/easing",
					"dojo/has",
					"dojo/io-query",
					"dojo/io/script",
					"dojo/json",
					"dojo/keys",
					"dojo/main",
					"dojo/mouse",
					"dojo/on",
					"dojo/parser",
					"dojo/query",
					"dojo/ready",
					"dojo/selector/_loader",
					"dojo/selector/lite",
					"dojo/sniff",
					"dojo/string",
					"dojo/text",
					"dojo/text",
					"dojo/topic",
					"dojo/touch",
					"dojo/i18n",

					"dijit/_Container",
					"dijit/_TemplatedMixin",
					"dijit/_WidgetBase",
					"dijit/main",
					"dijit/registry"
				]
			}

			,"dx-media/layer":{
				include:[
					"dx-media/image/Image",
					"dx-media/image/Preview",
					"dx-media/player/Mobile",
					"dx-media/player/ScreenPlayButton",
					"dx-media/player/controls/Controls",
					"dx-media/player/controls/Embed",
					"dx-media/player/controls/Facebook",
					"dx-media/player/controls/Slideshow",
					"dx-media/player/controls/Twitter",
					"dx-media/player/controls/Video",
					"dx-media/player/controls/Vtour",
					"dx-media/player/controls/_Button",
					"dx-media/plugins/VAST",
					"dx-media/slideshow/Photo",
					"dx-media/slideshow/Slideshow",
					"dx-media/video/Mobile",
					"dx-media/vtour/Vtour",
					"dx-media/vtour/VtourCanvas",

					"dx-media/mobile/common",
					"dx-media/mobile/sniff",
					"dx-media/mobile/uacss"
				]
			}
			,"dx-alias/layer":{
				include:[
					"dx-alias/dom",
					"dx-alias/lang",
					"dx-alias/log",
					"dx-alias/mouse",
					"dx-alias/on",
					"dx-alias/shim",
					"dx-alias/string"
				]
			}
			,"dx-timer/layer":{
				include:[
					"dx-timer/timer"
				]
			}
		}
	};

})();
