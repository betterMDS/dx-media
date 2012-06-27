define([
	'dojo/_base/declare',
	'dojo/sniff',
	'../mobile/Video',
	'dx-alias/dom',
	'dx-alias/string',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/topic',
	'dx-alias/log',
	'dx-timer/timer',
	'./base',
	'./theme',
	'./Controls'
],function(declare, has, Mobile, dom, string, lang, on, topic, logger, timer, sl, theme, Controls){
	//
	//	summary:
	//		An Silverlight Video player.
	//		Can be used standalone, or as a component of a more versatile media
	//		player, for browsers that can't play HTML5 video or specific video
	//		codecs (like MP4 in Firefox).
	//
	var log = logger('SLV', 1);

	var errorMap = {
		'msg':'Silverlight Media Error',
		'3001':'Video Codec Not Supported',
		'4001':'File Not Found'
	};

	var delayHandle,
		isReady = function(ctx, name){
			if(delayHandle) delayHandle.remove();
			var f = isReady.caller.bind(ctx);
			if(ctx[name]) return true;
			delayHandle = timer(function(){
				f();
			}, 100);
			return false;
		}

	return declare("dx-media.silverlight.Video", [Mobile], {

		templateString:'<div class="${baseClass} dxSilverlightVideo" ></div>',
		baseClass:'',
		x:0,
		y:0,
		width:0,
		height:0,
		//path:'',

		timeInterval:100,
		autoplay:true,
		complete:false,
		isFullscreen:false,
		hasPlayed:false,
		videoReady:false,

		duration:0,
		naturalVideoHeight:0,
		naturalVideoWidth:0,

		useNaturalSize: 0,

		showing:1,

		background:'#ffff00',
		windowless:true,
		enableFrameRateCounter:false,

		renderer:'silverlight',

		postCreate: function(){
			this.hasHtmlControls = false; // TODO: really check for this
			this.init();
		},

		init: function(){
			log('stylesheet loaded, ready to build...');
			if(this.inited) return;
			this.inited = 1;
			dom.style(this.domNode, {
				height:'100%',
				width:'100%'
			});
			if(!this.width){
				var box = dom.box(this.domNode);
				this.width = box.w;
				this.height = box.h;
			}
			this.canvas = new sl.Canvas({
				width:this.width,
				height:this.height,
				background:this.background,
				windowless:this.windowless,
				enableFrameRateCounter:this.enableFrameRateCounter,
				onLoad: lang.bind(this, 'onCanvasReady')
			}, this.domNode);
		},

		onCanvasReady: function(sender){
			log(' --------------------- onCanvasReady');
			if(this.wasReady) return;
			this.wasReady = 1;
			this.buildBack();
			this.buildVideo();


			this.nativeControls = new Controls({width:this.width, height:this.height, video:this}, this.back);
			if(!this.controls) this.hideControls();

			this.setupEvents();

			timer(this, function(){
				if(this.src) this.setVideo(this.src);
			}, 100);
			console.warn('Video Built - HOOK UP HTML5 -------------------------- video source.', this.src)
		},

		buildBack: function(){
			var bk = {
				x:0,
				y:0,
				width:this.width,
				height:this.height,
				nostroke:1,
				grad:theme.getGrad(this.height, theme.medium, theme.dark)
			}
			this.back = new sl.Rect(bk, this.canvas);
		},

		buildVideo: function(){
			log('Video source:', this.src, 'autoplay:', this.autoplay);
			// size and pos set by centerVideo()
			// note video size slightly too big can crash the plugin
			this.video = new sl.Media({}, this.back);
			this.video.node.autoPlay = this.autoplay;
			on(this.domNode, 'click', this, 'onClick');
		},

		crashTest: function(){
			// summary:
			// 		Test that the plugin is still working.
			// 		I haven't been working with Silverlight long enough to know
			// 		when it crashes. I do know that if you size it to something
			// 		it doesn't like (usually bigger) it can crash the plugin.
			if(this.crashTested) return;
			this.crashTested = 1;
			//console.log('crash test....');
			timer(this, function(){
				try{
					//console.log('crash test:', this.getTime());
				}catch(e){
					this.timerHandle.pause();
					console.error('Silverlight crashed.')
				}
			}, 500);
		},

		setupEvents: function(s){
			// http://msdn.microsoft.com/en-us/library/system.windows.controls.mediaelement_events%28v=vs.95%29.aspx

			if(this.connections) return;
			this.connections = [];

			log(' ------------ setupEvents');

			this.timerHandle = timer(this, function(){
				this.onProgress(this.getMeta());
			}, Infinity, this.timeInterval, {paused:1});



			var ae = function(eventName, fn){
				var pauseable = lang.bind(this, fn);
				var event = {
					token:0,
					paused:0,
					fn: lang.bind(this, function(evt){
						pauseable(evt);
					})
				}
				this.video.node.AddEventListener(eventName, pauseable);
				return lang.bind(this, "on"+eventName);
			}.bind(this);

			var csc = ae('CurrentStateChanged', function(){
				var state = this.state = this.video.node.CurrentState;
				log('state:', state)
				if(state == "Playing"){ this.hasPlayed = true; this.onPlay(); }
				if(state == "Paused"){ this.onPause(); }
				if(state == "Playing" || state == "Buffering" || state == "Opening") {
					this.complete = false;
					this.timerHandle.resume();
					this.crashTest();
				} else {
					this.timerHandle.pause();
				}
				csc(state);
			});

			var bpc = ae('BufferingProgressChanged', function(){
				bpc(this.video.node.BufferingProgress);
			});
			var dpc = ae('DownloadProgressChanged', function(){
				dpc(this.video.node.DownloadProgress);
			});
			var me = ae('MediaEnded', function(){
				this.complete = true;
				this.onPause();
				me();
			});
			var mo = ae('MediaOpened', function(){
				var meta = {};
				this.duration = meta.duration = this.video.node.NaturalDuration.Seconds;
				this.naturalVideoHeight = meta.naturalVideoHeight = this.video.node.NaturalVideoHeight;
				this.naturalVideoWidth = meta.naturalVideoWidth = this.video.node.NaturalVideoWidth;
				mo(meta);
			});
			var mf = ae('MediaFailed', function(sender, args){
				var errorObject = {
					code:args.errorCode,
					source:sender.Source, // the url trying to be played
					message:errorMap.msg+args.errorCode+" - "+errorMap[args.errorCode]
				};
				mf(errorObject);
			});

			this.video.ctx.onFullScreenChange = lang.bind(this, function(){
				this.isFullscreen = this.video.ctx.FullScreen;
				if(this.isFullscreen){
					this.wasWidth = this.width;
					this.wasHeight = this.height;
					this.width = window.screen.width;
					this.height = window.screen.height;
					this.showControls();
				}else{
					this.width = this.wasWidth;
					this.height = this.wasHeight;
					if(this.hasHtmlControls) this.hideControls();
				}
				this.resize();
				this.onFullscreen();
			});

			this.video.node.AutoPlay = this.autoplay;

		},

		onDownloadProgressChanged: function(p){
			//console.info("DownloadProgressChanged", s);
			this.onDownload(p);
		},
		onMediaEnded: function(){
			console.info("MediaEnded");
			this.complete = true;
			this.onPause();
			this.hasPlayed = false;
			this.onComplete();
		},
		onBufferingProgressChanged: function(/* Float */f){
			console.info("BufferingProgressChanged", f);
			this.onBuffer(f);
		},

		onMediaOpened: function(meta){
			console.info("MediaOpened", meta);
			this.centerVideo();
			this._onmeta(meta);

			/*
			    Attributes
				AudioStreamCount
				AudioStreamIndex
				BufferingProgress
				DownloadProgress
				Markers
				NaturalDuration
				NaturalVideoHeight
				NaturalVideoWidth
				Position
			*/
		},

		onMediaFailed: function(e){
			console.error("MediaFailed::", e);
			console.timeEnd("time to fail"); // yikes! 500ms!
			this.onError(e);
		},

		onCurrentStateChanged: function(state){
			//console.info("CurrentState", state);
			if(state == 'Opening'){
				this.videoReady = false;
			}else{
				this.videoReady = true;
			}
			this.onStatus(state.toLowerCase());
		},





		setVideo: function(src, noPlay){
			if(src) this.src = src;
			if(!isReady(this, 'video')) return;
			this.complete = false;
			this.video.node.Source = this.src;
			if(!noPlay && this.autoplay){
				on.once(this, 'onMediaOpened', this, 'play');
			}
		},

		fullscreen: function(){
			// only callable by silverlight controls
			this.back.ctx.FullScreen = !this.isFullscreen;
		},

		goFullscreen: function(){
			var box = dom.box(this.domNode);

			this.isFullscreen = !this.isFullscreen;
			this.width = box.w
			this.height = box.h
			this.canvas.size(box.w, box.h);
			this.resize();
		},

		play: function(){
			log('play');
			if(!isReady(this, 'videoReady')){
				//log('silverlight not ready')
				return;
			}
			if(this.complete){ this.video.node.Position = '0:0:0'; }//seriously?

			try{
			this.video.node.Play();
			}catch(e){
				console.error(e)
			}
		},
		hide: function(){
			// can't actually hide a Flash video - not sure about SL.
			// this is here to maintain a common signature.
			this.pause();
		},

		show: function(){
			this.play();
		},

		pause: function(){
			log('play');
			this.video.node.Pause();
		},

		volume: function(/* Float */ p){
			this.video.node.Volume = p;
		},

		getTime: function(rounded){
			if(rounded){
				return Math.round(this.video.node.Position.Seconds*10)/10;
			}else{
				return this.video.node.Position.Seconds;
			}
		},

		seek: function(cmd){
			var diff = 0;
			if(cmd == "start"){
				this.wasPlaying = this.state == "Playing";
				if(!this.hasPlayed){
					topic.pub("/video/on/play", this.getMeta());
				}
				this.timeWas = this.getTime();
				this.pause();

			}else if(cmd == "end"){
				if(this.wasPlaying){
					this.play();
				}else{
					this.onPause();
				}
				diff = this.getTime() - this.timeWas;
			}else{
				var time = cmd * this.duration
				var tc = lang.timeCode(time, 'h:m:s.m');
				//console.log('seek:', cmd, time, tc);
				this.video.node.Position = tc;
			}

			var m = this.getMeta();
			m.type = cmd || 'seeking';
			m.change = diff;
			topic.pub('/video/on/seek', m);

		},

		resize: function(){
			this.back.size({width:this.width, height:this.height});
			//this.back.position(100, 200);
			this.centerVideo();
			this.nativeControls.onFullscreen(this.isFullscreen, this.controls);
		},

		showControls: function(){
			this.nativeControls.show();
		},

		hideControls: function(){
			this.nativeControls.hide();
		},

		centerVideo: function(){

			var mw = this.naturalVideoWidth;
			var mh = this.naturalVideoHeight;
			var cw = this.isFullscreen ? window.screen.width  : this.width;
			var ch = this.isFullscreen ? window.screen.height : this.height;
			var ma = mh/mw;
			var ca = ch/cw;
			var x, y, w, h;

			var videoIsSmaller = mw>cw || mh>ch;

			if(this.useNaturalSize && !this.isFullscreen){
				log('actual size');
				x = (cw-mw)/2;
				y = (ch-mh)/2;
				w = this.naturalVideoWidth;
				h = this.naturalVideoHeight;
				this.video.size({width:this.naturalVideoWidth,height:this.naturalVideoHeight});

			}else if(this.isFullscreen || videoIsSmaller){
				log('video is smaller (or fullscreen)');
				if(ma == ca){
					// same
					w = cw;
					h = ch;
					x = 0;
					y = 0;
				}else if(ca > ma){
					// cn is taller
					w = cw;
					x = 0;
					h = mh * cw/mw;
					y = (ch - h)/2;

				}else{
					// cn is wider
					h = ch;
					y = 0;
					w = mw * ch/mh
					x = (cw - w)/2;
				}



			}else{
				// tried making the video larger, using an even amount, 1.5, 2.0, etc.
				// didn't work. 1.5 still crashed it. It was pretty large, though, 940 x 500 or something.
				//
				/*

				var sizes = [1, 1.5, 2, 2.5, 3];
				var size = sizes[0];
				for(var i=0; i< sizes.length;i++){
					var s = sizes[i];
					log('size:', s, mw*s, mh*s);
					if(mw*s > cw || mh*s > ch) break;
					size = sizes[i];
				}

				w = mw*size;
				h = mh*size;*/

				log('scale video up');

				w = this.naturalVideoWidth;
				h = this.naturalVideoHeight;
				x = (cw-w)/2;
				y = (ch-h)/2;


			}
			log("center:", x, y, w, h, 'container:', cw, ch, 'media:', mw, mh, 'fullscreen', this.isFullscreen);
			this.video.size({width:w,height:h});
			this.video.position({x:x,y:y});
			///
		},

		getMeta: function(){

			var m = this.meta || {};
			var time = this.getTime();
			var dur = this.duration;
			var p = time / dur;
			var rem = Math.max(0, dur-time);
			time = time.toFixed(1);

			return {
				p:p,
				time: time,
				duration:dur,
				remaining:rem,
				isAd:false
			}
		},

		_onmeta: function(/*Object*/m){
			this.meta = m;
			this._metaHandle && this._metaHandle.remove();
			if(!this.premetaFired){
				this.premetaFired = 1;
				this.onPreMeta(m);
			}

			this._metaHandle = timer(this, function(){
				this.onMeta(m);
			}, 30);
		}
	});

});
