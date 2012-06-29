define([
	'dojo/_base/declare',
	'dx-alias/Widget',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/lang',
	'dx-alias/log'
],function(declare, Widget, dom, on, lang, logger){
	//	summary:
	//		The controller that wires a set of controls (controls/Controlbar)
	//		to a video renderer.
	//	TODO:
	//		Handle multiple video renderers (playlist).
	//		Handle Slideshow and Vtour
	//
	//
	var log = logger('VC', 0);

	return declare('dx-media.controls.Controller', [Widget], {

		controls:null,
		video:null,
		preview:null,
		screenButton:null,

		isFullscreen:false,

		postCreate: function(){

			this.displayElements = [];

			['controls', 'video', 'preview', 'screenButton'].forEach(function(str){
				this[str] = this.getObject(str);
				this.displayElements.push(this[str]);
			}, this);

			this.id = lang.uid('VideoControl');

			this._connections = [];

			log(this.controls);
			log(this);

			this.buttons = this.controls.getElements();
			this.map = {};
			this.buttons.forEach(function(w){ this.map[w.name] = w}, this);
			this.init();
		},

		init: function(){

			if(!this.video || !this.controls){
				console.error('Controller must be associated with a Video and a Controlbar.');
				return;
			}
			if(this.inited) return;
			this.inited = 1;

			this.parentNode = this.controls.domNode.parentNode;

			//log('map', this.map);

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

			log('mapped');
		},

		onFullscreen: function(evt){
			// http://hacks.mozilla.org/2012/01/using-the-fullscreen-api-in-web-browsers/

			this.isFullscreen = !this.isFullscreen;
			log('onFullscreen', evt);
			var box = dom.box(this.parentNode);
			box.isFullscreen = this.isFullscreen;

			this.displayElements.forEach(function(el){
				el.resize && el.resize(box);
			}, this);
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
