define([
	'dojo/_base/declare',
	'dx-alias/Widget',
	'dx-alias/on',
	'dx-alias/lang',
	'dx-alias/log'
],function(declare, Widget, on, lang, logger){

	var log = logger('VC', 1);

	return declare('dx-media.controls.VideoControl', [Widget], {

		controls:null,
		video:null,
		preview:null,
		screenButton:null,
		isFullscreen:false,

		postCreate: function(){

			['controls', 'video', 'preview', 'screenButton'].forEach(function(str){
				this[str] = this.getObject(str);
			}, this);

			this.id = lang.uid('VideoControl');

			this._connections = [];

			log(this);

			this.buttons = this.controls.getElements();
			this.map = {};
			this.buttons.forEach(function(w){ this.map[w.name] = w}, this);
			this.init();
		},

		init: function(){
			if(this.inited) return;
			this.inited = 1;

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

				var node = this.controls.domNode.parentNode;
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
					this.on(this.map.Fullscreen, 'onClick', this, function(){
						log('------------------------------- Fullscreen', this.video.renderer);
						this.fullscreen();
						this.isFullscreen = !this.isFullscreen;
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
			log('onFullscreen', evt);
			this.video.goFullscreen(this.isFullscreen);
		}
		// http://hacks.mozilla.org/2012/01/using-the-fullscreen-api-in-web-browsers/

	});
});
