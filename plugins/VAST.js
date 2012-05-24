define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dojo/io/script",
	"../html5/Image",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, _Container, io, DImage, dom, on, logger, timer){

	var log = logger('VST', 1);

	return declare('dx-media.plugins.VAST', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div class="dxPluginsVAST"><div class="dxVastContainer" data-dojo-attach-point="containerNode"></div></div>',

		media:'',

		postMixInProperties: function(){
			log('JSON:', this.media);
			window.bvVastCallback = this.onData.bind(this);
			io.get({url:this.media, callbackParamName:'bvVastCallback', handleAs: "json"});
		},

		onData: function(data){
			log('data', data);
			this.ads = data.ads;
			this.index = -1;
			timer(this, function(){
				this.next();
			}, 1500);
		},

		postCreate: function(){
			log('postCreate');
		},

		next: function(){
			this.index++;
			if(this.index >= this.ads.length) return;
			var ad = this.ads[this.index].src;
			this.current && this.current.hide();
			this.current = new DImage({
				src:ad
			});
			this.addChild(this.current);
			timer(this, function(){
				this.display(true);
			}, 500);
			timer(this, function(){
				this.display(false);
			}, 2500);
			timer(this, function(){
				this.next();
			}, 3600);
		},

		display: function(show){

			// FOR BROWSER TESTING
			//dom.css.replace(document.documentElement, 'dj_portrait','dj_landscape');
			//log('class:', document.documentElement.className)

			dom.css(this.domNode, 'showing', show);
		},

		onClick: function(){
			log('CLICK')
			// stub
		}
	});

});
