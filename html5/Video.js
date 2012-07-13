define([
	'dojo/_base/declare',
	'../mobile/Video',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/lang',
	'dx-alias/has',
	'dx-alias/topic',
	'dx-alias/log',
	'dx-timer/timer'

], function(declare, Mobile, dom, on, lang, has, topic, logger, timer){
	//
	//	summary:
	//		An HTML5 Video player for use in browsers on desktops. Inherits
	//		methods and events from mobile/Video. See that Class for API
	//		summaries.
	//
	var log = logger('H5V', 1);


	return declare('dx-media.html5.Video', [Mobile], {
		baseClass:'dxHtml5Video',


		autobuffer:true,
		buffer:true,
		preload:"auto",
		autoplay:false,

		initialVolume:.7,

		renderer:'html5',

		postMixInProperties: function(){

			if(typeof this.attributes == 'string') this.attributes = [];
			var options = {
				width:this.width,
				height:this.height,
				autobuffer:this.autobuffer,
				buffer:this.buffer,
				preload:this.preload
			};
			if(this.src) options.src = this.src;
			if(this.autoplay) options.autoplay = true;

			for(var nm in options){
				this.attributes.push(nm+'="'+options[nm]+'"');
			}
			this.inherited(arguments);
		},

		postCreate: function(){
			// FIXES IPAD BUG
			// iPad has trouble determining which source to play
			// so we just specifically load it
			if(has('ipad')) this._setVideo(p);

			this.volume(this.initialVolume);
			this.setupEvents();
			//timer(this, 'connectEvents', 1)
			log('video ready.')
		},



		setupEvents: function(){
			if(has('iphone')) return;

			var meta, ready;

			this.connection = on.multi(this.domNode, {
				"play": "onPlay",
				"pause": "onPause",
				"progress": "_onDownload",
				"error": "onError",
				"timeupdate": "_onProgress",
				"ended": function(){
					this.complete = true;
					this.onPause();
					this.hasPlayed = false;
					this.onComplete(this.getMeta())
				},
				"seeked":"onSeeked",
				 "loadedmetadata": function(evt){
					log("   ---------- > meta pre event:", evt)
					meta = evt.target;
					meta.isAd = this.isAd;
					if(ready) this._onmeta(meta);
				}
			}, this);

			on(this.domNode, 'click', this, 'onClick');

			// WebKit "feature" http://code.google.com/p/chromium/issues/detail?id=39419
			// does not pick up SRC error in video tag, it does in child nodes
			if(this.sources){
				this.sources.forEach(function(s){
					// not disconnectable. May throw multiple errors.
					on(s.node, "error", this, "onError");
				}, this);
			}

			tmr = timer(this, function(){
				if (this.domNode.readyState > 0) {
					ready = true;
					tmr.remove();
					if(meta) this._onmeta(meta);
				}
			},10000, 200);
		},

		onSeeked: function(){
			// when does this actually fire?
			log(' --------------------- onSeeked')
			if(this.complete && !this.domNode.paused){
				this.onRestart();
			}
		},

		_onmeta: function(m){
			// *** on iPad won't fire until PLAY **************************
			this._metaHandle && this._metaHandle.remove();
			this.meta = lang.mix(this.meta || {}, m);
			this.duration = m.duration;
			if(m.videoWidth){
				this.videoWidth = m.videoWidth;
				this.videoHeight = m.videoHeight;
				this.videoAspect = this.videoHeight/this.videoWidth;
				this.resize();
			}

			if(!this.premetaFired){
				this.premetaFired = 1;
				this.onPreMeta(m);
			}

			this._metaHandle = timer(this, function(){
				this.onMeta(this.getMeta());
			}, 30);
		},

		_onProgress: function(){
			var m = this.getMeta();
			if(m.duration) this.onProgress(m);
		},



		_onDownload: function(evt){
			//
			var p, v = this.domNode;

			if(evt.total){
				p = (evt.loaded / evt.total);
			}else{
				if(!v.readyState){ // Firefox sometimes needs to wait
					timer(this, "_load", 100);
					return;
				}
				p = ((v.buffered.end(0) / v.duration));
			}
			// TODO: meta?
			this.onDownload({p:p});
		},

		// TODO:
		// connecting events needs to be a common signature
		disconnectEvents: function(){
			this.disWasPlaying = this.isPlaying();
			this.pause();
			this.connection.pause();
			this.subscriptions.pause();
		},

		reconnect: function(){
			this.connection.resume();
			this.subscriptions.resume();
			log('reconnect', this.disWasPlaying);
			this.disWasPlaying && this.play();
			this.disWasPlaying = false;
		},

		_setVideo: function(p){
			var path = p.path || p;
			if(!path) return;
			log("Video._setVideo......", path);
			timer(this, function(){
				this.complete = false;
				this.domNode.src = path;
				this.domNode.load();
				timer(this, 'play', 200, {debug:1});
			}, 100);
		},

		/************************************************************************
		 *																		*
		 *						Common Method Signatures						*
		 *																		*
		 ************************************************************************/

		destroy: function(){
			this.pause();
			this.disconnectEvents();
			this.inherited(arguments);
		},

		reload: function(path){
			on.once(this, "onMeta", this, function(){
				this.domNode.currentTime = .1
				this.domNode.play();
			});
			this.pause();
			this.domNode.src = path;
			this.domNode.load();
		},

		restart: function(){
			log(' ------------------------------------------ restart video');
			if(this.isPlaying()){
				this.seek(0);
			}else{
				this.show();
				this.complete = false;
				// without the pause, Safari crashes:
				timer(this, "onPlay", 1);
				timer(this, function(){
					this.domNode.currentTime = .1;
					this.domNode.play();
				}, 260);
				this.onRestart(this.getMeta());
			}
		},

		getMeta: function(){
			var p = this.domNode.currentTime / this.duration;
			return {
				p:p,
				time: this.domNode.currentTime,
				duration:this.duration,
				remaining:Math.max(0, this.duration-this.domNode.currentTime),
				isAd:this.isAd
			}
		},

		onError: function(evt){
			// code 4 == no source. what else?
			console.error("Video Error:", evt.target.error.code, evt.target.src); //evt.target.error.code,
			this.inherited(arguments);
		},

		

		play: function(){
			log('play me');
			this.domNode.play();
		},

		pause: function(){
			log('pause me');
			this.domNode.pause();
		},

		seek: function(cmd){
			var diff = 0;
			if(cmd === "start"){
				this.wasPlaying = this.isPlaying();
				//console.warn('SEEK START, [played:', this.hasPlayed, 'wasPlaying', wasPlaying);
				if(!this.hasPlayed){
					// need to do something...
					//topic.pub("/video/on/play", this.meta);
				}
				this.timeWas = this.domNode.currentTime;
				this.pause();
			}else if(cmd === "end"){
				if(this.wasPlaying){
					this.play();
				}else{
					this.pause();
				}
				diff = this.domNode.currentTime - this.timeWas;
			}else{
				this.domNode.currentTime = this.duration * cmd;
			}

			var m = this.getMeta();
			m.type = cmd || 'seeking';
			m.change = diff;
			this.onSeek(m);
		},

		volume: function(p){
			this.domNode.volume = p;
		},

		isPlaying: function(){
			log('isPlaying, complete:', this.complete, 'paused:', this.domNode.paused)
			return this.complete ? false : !this.domNode.paused;
		},



		load: function(path, isAd){
			this.isAd = !!isAd;
			log("Video.setVideo:", path, ' == ', this.domNode.src);

			// The reason for the aggressive check of new src to current src is
			// if a relative path is passed, the video node converts it to
			// absolute, so src == node.src will not work.
			// NOTE this could fail if two similar video names from different
			// locations are used.
			if(this.domNode && this.domNode.src && string.urlToObj(path).filename == string.urlToObj(this.domNode.src).filename){
				log('restart current video');
				this.restart();

			}else if(!this.domNode.src){
				log('setting for the first time...')
				this.domNode.src = path;
				// check autoplay? What if in a playlist?
				if(this.autoplay) timer(this, 'play', 200, {debug:1});

			}else{
				log('set new video...');
				this._setVideo({path:path});
			}
		}
	});

});
