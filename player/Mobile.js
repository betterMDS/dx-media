define([
	"dojo/_base/declare",
	"../mobile/common",
	"dijit/_Container",
	"dx-alias/Widget",
	"dx-alias/has",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, mobile, _Container, Widget, has, dom, lang, logger, timer){
	//	summary:
	//		A top-level class that is a mobile-only player.
	//
	var log = logger('MOB', 1);
	var screensize;
	console.log('TEST MOBILE')
	var isMobile = has('mobile');

	return declare('dx-media.player.Mobile', [Widget, _Container], {

		templateString:'<div><div class="dxPlayerMobile" data-dojo-attach-point="containerNode"></div></div>',

		poster:'',
		controls:1,
		defaultView:'',

		constructor: function(){
			if(isMobile){
				this.on(mobile, 'updateOrient', this, 'onResize');
			}else{
				this.sub('/dojox/mobile/screenSize/tablet', this, 'onResize');
				this.on(window, 'resize', this, 'onResize');
			}
		},

		startup: function(){
			//log('  startup...', this);

			this.views = {};

			this.getChildren().forEach(function(w){
				w.name = lang.last(w.declaredClass.split('.'));

				switch(w.name){

					case 'Preview':
						this.preview = w;
						break;
					case 'Controlbar':

						this.controls = w;
						this.on(this.controls, 'onClick', this, 'onClick');
						break;

					case 'ScreenPlayButton':
						this.screenBtn = w;
						break;

					case 'Video':
						this.views['Video'] = this.video = w;
						this.on(this.video, {
							'onStop':'onStop',
							'onPlay':'onStop'
						}, this);
						this.setCurrent(w);
						break;

					case 'Vtour':
						this.views['Vtour'] = this.vtour = w;
						this.setCurrent(w);
						break;

					case 'Slideshow':
						this.views['Slideshow'] = this.slideshow = w;
						this.setCurrent(w);
						break;

				}

			}, this);


			if(this.preview && this.video){
				dom.style(this.video.domNode, "opacity", 0);
				if(this.preview.width){
					this.video.onPreview(this.preview.width, this.preview.height);
				}else{
					this.on(this.preview, 'onReady', this, function(){
						this.video.onPreview(this.preview.width, this.preview.height);
					});
				}
			}
			log('defaultView:', this.defaultView);
			if(this.defaultView){
				log('set defaultView', this.defaultView);
				this.setCurrent(this.defaultView);
			}
			this.onResize();
		},

		setCurrent: function(widget){
			// widget may be a button, with the same name as a view widget
			var name = typeof widget == 'string' ? widget : widget.name;
			if((this.current && name == this.current.name )|| !this.views[name]) return;
			log('setCurrent', name);
			//log('has preview', !!this.preview, !!this.screenBtn)

			this.preview && this.preview.hide();
			this.screenBtn && dom.hide(this.screenBtn.domNode);

			this.current && this.current.hide();
			this.current = this.views[name];
			this.current.show();

			if(name == 'Video'){
				this.preview && this.preview.show();
				this.screenBtn && dom.show(this.screenBtn.domNode);
			}

			//topic.pub('/dx/button/on/select', widget);
		},

		onClick: function(w){
			//log('onClick:', w.name);
			this.setCurrent(w);
		},

		onStop: function(){
			this.preview && this.preview.destroy();
			this.screenBtn && this.screenBtn.destroy();
			dom.style(this.video.domNode, "opacity", 1);
			this.preview = this.screenBtn = null;
		},

		onResize: function(){
			mobile.hideAddressBar();

			// seems to work, but after a few ms:
			//log('RESIZE', dom.box(this.domNode))

			this.onSize(dom.box(this.domNode));
		},


		onSize: function(sz){
			this.getChildren().forEach(function(w){
				w.onSize && w.onSize(sz);
			});
		},

		onOrient: function(){
			log('orient');
			this.onResize();
		}
	});

});
