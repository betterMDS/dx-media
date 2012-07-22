define([
	'dojo/_base/declare',
	'../mobile/common',
	'dx-alias/has',
	'dx-alias/Widget',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/lang',
	'dx-alias/log',
	'dx-timer/timer'
],function(declare, mobile, has, Widget, dom, on, lang, logger, timer){
	//	summary:
	//		The controller that wires a set of controls (controls/Controlbar)
	//		to a video renderer.
	//	TODO:
	//		Handle multiple video renderers (playlist).
	//		Handle Slideshow and Vtour
	//
	//
	var log = logger('VC', 1);

	var isMobile = has('mobile');

	return declare('dx-media.controls.Controller', [Widget], {

		controls:null,
		video:null,
		preview:null,
		screenButton:null,

		slideshow:null,
		vtour:null,

		isFullscreen:false,

		postCreate: function(){

			this.displayElements = [];

			['controls', 'video', 'preview', 'screenButton', 'slideshow', 'vtour'].forEach(function(str){
				this[str] = this.getObject(str);
				//log('   get', str, 'got', this[str])
				if(this[str]) this.displayElements.push(this[str]);
			}, this);

			this.id = lang.uid('VideoControl');
			timer(this, 'startup', 30);
		},

		startup: function(){
			if(this._started) return; this._started = 1;
			this._connections = [];

			log('controls:', this.controls);
			log('controller', this);

			this.map = {};
			this.buttons = [];
			if(this.controls){
				this.buttons = this.controls.getElements();
				this.buttons.forEach(function(w){ this.map[w.name] = w}, this);
			}

			this.init();

			if(isMobile){
				this.on(mobile, 'updateOrient', this, 'resize');
			}else{
				this.sub('/dojox/mobile/screenSize/tablet', this, 'resize');
				this.on(window, 'resize', this, 'resize');
			}

			this.showVideo();

			this.resize();
		},



		init: function(){

			if(!this.video || !this.controls){
				console.error('Controller must be associated with a Video and a Controlbar.');
				return;
			}
			if(this.inited) return;
			this.inited = 1;

			this.parentNode = /*isMobile ? window : */this.controls.domNode.parentNode;

			console.log('map', this.map);

			if(this.map.Play){
				this.on(this.map.Play, 'onPlay', this.video, 'play');
				this.on(this.map.Play, 'onPause', this.video, 'pause');
				this.on(this.video, 'onPlay', this.map.Play, 'showPause');
				this.on(this.video, 'onPause', this.map.Play, 'showPlay');
			}

			if(this.map.Volume){
				this.on(this.map.Volume, 'onUpdate', this.video, 'volume');
			}

			if(this.map.Progress){
				this.on(this.map.Progress, 'onUpdate', this.video, 'seek');
				this.on(this.video, 'onProgress', this.map.Progress, 'update');
			}

			if(this.map.Duration){
				this.on(this.video, 'onMeta', this.map.Duration, 'update');
				this.on(this.video, 'onProgress', this.map.Duration, 'update');
			}

			if(this.map.Time){
				this.on(this.video, 'onProgress', this.map.Time, 'update');
			}

			if(this.map.Fullscreen){
				// http://hacks.mozilla.org/2012/01/using-the-fullscreen-api-in-web-browsers/
				var node = this.parentNode;

				if(node.requestFullScreen){
					on(document, 'fullscreenchange', this, 'onFullscreen');
					this.fullscreen = function(){
						if(this.isFullscreen){
							document.exitFullscreen();
						}else{
							node.requestFullscreen();
						}

					}
				}else if(node.mozRequestFullScreen) {
					on(document, 'mozfullscreenchange', this, 'onFullscreen');
					this.fullscreen = function(){
						if(this.isFullscreen){
							document.mozCancelFullScreen();
						}else{
							node.mozRequestFullScreen();
						}
					}
				}else if(node.webkitRequestFullScreen){
					on(document, 'webkitfullscreenchange', this, 'onFullscreen');
					this.fullscreen = function(){
						if(this.isFullscreen){
							document.webkitCancelFullScreen();
						}else{
							node.webkitRequestFullScreen();
						}
					}
				}

				if(!!this.fullscreen){
					this.video.removeFullscreen();
					this.on(this.map.Fullscreen, 'onClick', this, function(){
						log('------------------------------- Fullscreen', this.video.renderer);
						this.fullscreen();

					});
				}else{
					this.map.Fullscreen.destroy();
				}
			}

			if(this.screenButton){
				this.on(this.screenButton, 'onClick', this.video, 'play');
				this.on(this.video, 'onPlay', this.screenButton, 'hide');
			}

			if(this.preview){
				this.on(this.video, 'onPlay', this.preview, 'hide');
			}


			// These are buttons, not components
			if(this.map.Video){
				this.on(this.map.Video, 'onClick', this, 'showVideo');
			}
			if(this.map.Slideshow){

				this.on(this.map.Slideshow, 'onClick', this, 'showSlideshow');
			}
			if(this.map.Vtour){
				this.on(this.map.Vtour, 'onClick', this, 'showVtour');
			}

			log('mapped');
		},

		hideComponents: function(){
			if(this.video) this.video.hide();
			if(this.slideshow) this.slideshow.hide();
			if(this.vtour) this.vtour.hide();
			if(this.preview) this.preview.hide();
			if(this.screenButton) this.screenButton.hide();
		},

		showVideo: function(){
			this.hideComponents();
			this.video.show();
			if(this.preview) this.preview.show();
			if(this.screenButton) this.screenButton.show();
		},
		showVtour: function(){
			log('Vtour click');
			this.hideComponents();
			this.vtour.show();
		},
		showSlideshow: function(){
			log('Slideshow click');
			this.hideComponents();
			this.slideshow.show();
		},

		onFullscreen: function(evt){
			// http://hacks.mozilla.org/2012/01/using-the-fullscreen-api-in-web-browsers/

			this.isFullscreen = !this.isFullscreen;
			log('onFullscreen', evt);
			this.resize();
		},

		resize: function(){

			var box = dom.box(this.parentNode);
			log('resize:', box.w, box.h);
			box.isFullscreen = this.isFullscreen;
			this.displayElements.forEach(function(el){
				el.resize && el.resize(box);
			}, this);
			mobile.hideAddressBar();
		},

		getScreenSize: function(){
			// summary:
			//		Returns the dimensions of the browser window.
			return {
				h: window.innerHeight || document.documentElement.clientHeight,
				w: window.innerWidth || document.documentElement.clientWidth
			};
		}


	});
});
