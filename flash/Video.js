define([
	'dojo/_base/declare',
	'../mobile/Video',
	'./Swf',
	'dx-alias/lang',
	'dx-alias/log',
	'dx-timer/timer'
], function(declare, Mobile, Swf, lang, logger, timer){
	//
	//	summary:
	//		A Flash video renderer which inherits methods and events from
	//		mobile/Video. See that Class for API summaries.
	//		Can be used standalone, or as a component of a more versatile media
	//		player, for browsers that can't play HTML5 video or specific video
	//		codecs, like MP4 in Firefox, or anything in old IE.
	//
	var log = logger('FLV', 1);

	var
		flashVideoCount = 0,
		fVideos = {},

		register = function(vid){
			fVideos[vid.videoRef] = vid;
		},

		pub = function(method, ref, args){
			timer(function(){
				fVideos[ref]['_'+method](args);
			}, 1)
		}


	window.dxMediaFlashVideo = {
		//	summary:
		// 		A SWF needs a global object to talk to, and that is this object.
		// 		It collects the methods and passes them to the flash/Video
		// 		instance based on the ref ID.
		// 		Note that while this object may be accessible, it only is for
		// 		the SWF, with the exception of version().
		//
		version: function(){
			//	summary:
			//		The only public method in this object. Returns the version
			//		of the installed Flash plugin.
			return getVersion();
		},

		onMeta: function(meta, ref){
			// [private]
			log('MEATA!')
			pub('onMeta', ref, meta);
		},
		onClick: function(ref){
			// [private]
			pub('onClick', ref);
		},
		onStatus: function(obj, ref){
			// [private]
			//console.log("flash.video_status:", obj.channel, ref);
			if(obj.channel) pub('onStatus', ref, obj);
		}
	};

	return declare('dx-media.flash.Video', [Mobile, Swf], {

		templateString:'<div class="${baseClass}">',
		baseClass:'dxFlashVideo',
		renderer:'flash',
		loadSwf:require.toUrl('dx-media') + '/resources/video.swf',

		constructor: function(options){

			// mobile/Video is used to find the src from markup
			this.inherited(arguments);

			log('src:', this.src);
			log('swf:', require.toUrl('dx-media'));

			var flashVars = {
				loadUrl:this.loadSwf,
				path: this.src,
				loader: true,
				videoRef: this.videoRef = 'flashVideo' + (flashVideoCount++),
				autoplay: options.autoplay || this.autoplay,
				standalone:this.controls,
				isDebug:true
			}

			this.queue = [];

			register(this);

			this.prepare(flashVars);
		},

		_timerTries:5,
		_timer:false,
		setTimer: function(){
			if(!this.swf() && !this._timer){
				log('create timer');
				this._timerTries--;
				log('no swf for timer - retry ', this._timerTries, 'times. swf:', this.swf(), 'timer:', this._timer)
				this.tmr = {
					pause:function(){},
					resume:function(){}
				}
				if(this._timerTries > 0){
					b.timer(this.setTimer.bind(this), 200);
				}
				return;
			}


			this.id = lang.uid('FV');
			this.tmr = timer(this, function(evt){
				try{
				var t = this.swf().getTime() || 0;
				var p = t / this.duration;
				this._timer = true;
				this.time = t;
				//console.log("    time", t)

				this.onProgress(this.getMeta());

				// use a large enough number here:
				// .5 is greater than the 300ms timer, AND
				// it allows enough time for onComplete to
				// fire BEFORE pause - for reporting.
				if(!this.seeking && !this.complete && t > this.duration - .5){
					this.complete = true;
					this.onComplete();
					timer(this, function(){
						log('onComplete pause:', this.tmr.pause());
					}, 300);
				}

				}catch(e){console.error('set time err', this.id, evt.id, evt, e); this.tmr.stop(); }


			}, Infinity, 300, 'debugX', {id:'FlashTimer.'+this.id});
			//this.tmr.pause();
		},

		_onPreload: function(){

		},
		_onPlay: function(){
			this.onPlay(this.getMeta());
		},
		_onPause: function(){
			this.onPause(this.getMeta());
		},

		_onBufferEmpty: function(){

		},

		_onStatus: function(obj){
			//log(' ------------ status:', obj);
			switch(obj.channel){
				case "/swf/on/error":
					console.error("Video Error:", obj);
					break;
				case "/swf/on/download":
					this.onDownload(obj.value.percent);
					break;
				case "/swf/on/fullscreen":
					obj = {isFullscreen:obj.state=="fullScreen"};
					break;
				default:
					if(obj.event) this['_'+obj.event](obj);
			}
			this.onStatus(obj.state);
		},

		_onSwfEmbeded: function(embedNode){
			log('  -----  onPlayerLoad  -----  ');
			this.onLoad(this);
			this.ei_ready = true;
			if(this.queue.length){
				for(var i=0;i<this.queue.length;i++){
					this.tell.apply(this, this.queue[i]);
				}
			}
		},

		tell: function(method, a1){
			//	summary:
			//		Private method. All JS-to-SWF communication runs through
			//		here so errors can be tracked. Also caches commands in the
			//		event the SWF is not ready and triggers them when it is.
			//
			//console.log("tell...", method, a1)
			if(this.ei_ready){
				try{
					this.swf()[method](a1);
					return true;
				}catch(e){
					console.error("swf."+method+" failed ", e);
					return false;
				}
			}else{
				this.queue.push(arguments);
			}
			return false;
		},

		/************************************************************************
		 *																		*
		 *						Common Method Signatures						*
		 *																		*
		 ************************************************************************/

		_onMeta: function(m){
			// *** on iPad won't fire until PLAY **************************
			this._metaHandle && this._metaHandle.remove();
			m.isAd = this.isAd;
			this.meta = lang.mix(this.meta || {}, m);
			this.duration = m.duration;

			if(m.path == this.src){
				this.complete = false;
				!this.tmr && this.setTimer();
			}

			log("META", m, this.duration);
			if(!this.premetaFired){
				this.premetaFired = 1;
				this.onPreMeta(this.meta);
			}
			this._metaHandle = timer(this, function(){
				this.onMeta(this.meta);
			}, 30);
		},

		getMeta: function(){
			if(!this.meta){
				return {
					isAd:this.isAd,
					time:0,
					duration:0,
					remaining:0
				};
			}
			var p = this.time / this.duration;
			return {
				p:p,
				time: this.time,
				duration:this.duration,
				remaining:Math.max(0, this.duration-this.time),
				isAd:this.isAd,
				width:this.meta.width,
				height:this.meta.height
			}
		},


		hide: function(){
			// can't actually hide a Flash video.
			// this is here to maintain a common signature.
			this.pause();
		},
		show: function(){
			this.play();
		},

		showFullscreen: function(){
			if(this.fsRemoved) return;
			this.tell('showFullscreen');
		},

		hideFullscreen: function(){
			if(this.fsRemoved) return;
			this.tell('hideFullscreen');
		},

		removeFullscreen: function(){
			this.tell('hideFullscreen');
			this.fsRemoved = true;
		},

		play: function(){
			log('play');
			this.tell("doPlay");
			this.tmr && this.tmr.resume();
		},

		pause: function(){
			log('PAUSE', this.tmr)
			this.tell("doPause");
			this.tmr && this.tmr.pause();
		},

		restart: function(){
			log(' *** Video restart');
			this.seek(0);
		},

		seek: function(cmd){

			// VAST doesn't work well with .1
			// whatever needed it needs to call it that way
			//if(cmd === 0) cmd = 0;//.1;

			if(typeof cmd != 'string'){
				// convert percentage to time
				cmd = cmd * this.duration;
			}

			// comunicate to the SWF here
			this.tell("seek", cmd);

			var diff = 0;
			if(cmd === "start"){
				this.timeWas = this.time;
				this.seeking = 1;
				this.wasPlaying = this.isPlaying();
				this.tmr.pause();
			}else if(cmd === "end"){
				diff = this.time - this.timeWas;
				this.seeking = 0;
				log('end seek time:', this.swf().getTime());
				this.tmr.resume();
				if(this.wasPlaying){
					this.play();
				}else{
					this.pause();
				}
				log('end seek time:', this.swf().getTime());
			}else{
				log('seek to:', cmd);
				this.time = cmd;
			}
			var m = this.getMeta();
			m.type = cmd || 'seeking';
			m.change = diff;
			this.onSeek(m);
		},

		volume: function(v){
			this.tell("doVolume", v);
		},

		isPlaying: function(){
			log('get swf isPlaying')
			if(this.swf() && this.ei_ready){
				return this.swf().isVideoPlaying(); // swf.isPlaying fubars IE - awesome!!
			}
			return false;
		},

		setVideo: function(path){
			log('setVideo', path);
			var filename = b.urlToObj(path).filename;
			log('setVideo', filename, this.filename)
			if(filename == this.filename){
				this.play();
			}else{
				this.path = path;
				this.filename = b.urlToObj(path).filename;
				this.tell("setVideo", path);
			}
		},

		resize: function(isFullscreen){
			//log('goFullscreen', isFullscreen);
		}
	});
});
