define([
	'dojo/sniff',
	'./version',
	'dojo/_base/declare',
	'dojo/io-query',
	'dx-alias/Widget',
	'dx-alias/lang',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-timer/timer',
	'dx-alias/log'
], function(has, version, declare, query, Widget, lang, dom, on, timer, logger){

	var
		log = logger('SWF', 0),

		isIE = has('ie'),
		swfs = {},
		flashArgs = {
			// flashArgs:
			// 		The properties of the embed object
			// 		NOT the Swf. Your Swf properties are *flashVars*.
			//
			allowFullScreen: true,			// without this, no fullscreen ability. natch.
			allowNetworking: "all",			// Needs to be all, and needs a crossdomain.xml
			allowScriptAccess: "always", 	// Needed for ExternalInterface
			wmode:"opaque",
			pluginspage:"http://www.macromedia.com/go/getflashplayer",
			type:"application/x-shockwave-flash",
			quality:"high"
		},

		minVersion = function(value, node){
			// checks that installed plugin is of minimum version
			// if node is passed and it is not minimum, it is populated with
			// a Get Flash message
			// not checking IE, that happens in the embed
			if(isIE) return true;
			value = value || 8;
			if(version.major > value) return true; // Player will catch 9
			if(node) node.innerHTML = "To play this video you need the latest version of the Adobe Flash Player.<br/><a href='http://www.adobe.com/products/flashplayer/' style='font-weight:bold;'>Get Adobe Flash Player</a>";
			return false;
		}

	return declare('dx-media.flash.Swf', [Widget], {

		templateString:'<div class="${baseClass}">',
		baseClass:'dxFlashVideo',

		src:'',
		width:220,
		height:180,
		flashArgs:null,
		flashVars:null,
		lazy:false,
		loader:false,

		constructor: function(options){
			this.init(options);
		},

		init: function(options){
			options = options || {};

			options.isDebug = false;

			if(options.loader){
				this.movie = dojo.moduleUrl('dx-media', 'resources/loader.swf');
				options.loadUrl = options.loadUrl;
				options.debugPrefix = options.debugPrefix || 'VID';
			}else{
				this.movie = options.src;
			}
			delete options.src;

			this.flashArgs = lang.mix(flashArgs, options.flashArgs || {});
			delete options.flashArgs;

			this.swfId = lang.uid(options.swfId || "SWF");
			delete options.swfId;

			this.lazy = this.lazy || options.lazy;
			delete options.lazy;

			this.flashVars = options;
			delete this.flashVars.lang;

			if(this.flashVars.width){
				this.width = this.flashVars.width;
			}else{
				this.flashVars.width = this.width;
			}
			if(this.flashVars.height){
				this.height = this.flashVars.height;
			}else{
				this.flashVars.height = this.height;
			}

			this.embedStr = this.getEmbed(this.swfId);
		},


		postCreate: function(){
			//this.domNode.innerHTML = 'SWF HERE';
			//log(this.embedStr);
			!this.lazy && this.embed();
		},

		embed: function(){
			timer(this, function(){
				this.domNode.innerHTML = this.embedStr;
			}, 1);
		},

		destroy: function(){
			if(this.currentLoadEvent) window[this.currentLoadEvent] = function(){};
			this.swf() && dom.destroy(this.swf());
			delete swfs[this.swfId];
		},

		getEmbed: function(id){


			var br = "";//"\n";
			var tb = "";//"\t";
			var o = this.flashVars;
			log('vars:', o);
			this.currentLoadEvent = o.loadEvent = lang.uid("SwfLoad");
			window[o.loadEvent] = function(){
				console.info('LOAD EVENT');
				this._onSwfEmbeded();
			}.bind(this);
			var p = this.flashArgs;

			o.width = o.height = '100%'

			var str;

			if(isIE){
				var str = 	'<object id="'+id+'" ' + br + tb
				+ 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' + br + tb
				+ 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" ' + br + tb
				+ 'width="'+o.width+'" height="'+o.height+'" align="middle">' + br + tb + tb;

				// add object param nodes
				for(nm in p) str += '<param name="'+nm+'" value="'+p[nm]+'" />' + br + tb + tb;

				// add object FlashVars param
				str += '<param name="FlashVars" value="'+query.objectToQuery(o)+'" />' + br + tb + tb;
				str += '<param name="movie" value="'+this.movie+'" />' + br + tb + tb;

				str += '</object>';
			}else{
				str = '<embed quality="high" type="application/x-shockwave-flash" ' + br + tb + 'pluginspage="http://www.macromedia.com/go/getflashplayer" ' + br + tb
				str += 'src=' + this.movie + " id=" +id +" " + br + tb;

				// add embed FlashVars
				str += 'flashVars=' + query.objectToQuery(o) + " " + br + tb;
				str += 'width='+o.width+ " " + br + tb;
				str += 'height='+o.height+ " " + br + tb;
				// add remaining embed attributes
				for(nm in p) str += nm+"="+p[nm] + " " + br + tb + tb;
				// close embed, and then close object
				str += '/>';
			}

			return str;
		},

		_onSwfEmbeded: function(){
			// stub
		},

		swf: function (){
			var name = this.swfId;
			var doc = document;
			if(swfs[name]) return swfs[name]; // this breaks if the SWF gets relaoded thru ReCSS

			if(!isIE && doc.embeds[name]){ // IE9 throws a false positive here
				//console.log("get swf standards style");
				swfs[name] = doc.embeds[name]; // FF, Saf

			}else if(doc[name]){
				swfs[name] = doc[name]; // IE 6, 7, 8, and 9 (this check must be first)

			}else if(window[name]){
				swfs[name] = window[name];
			}else if(document[name]){
				swfs[name] = document[name];
			}
			//console.log("cur id:", name)
			return swfs[name];
		}
	});
});
