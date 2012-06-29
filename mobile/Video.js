define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dx-alias/dom',
	'dx-alias/string',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/has',
	'dx-alias/log'
],function(declare, _WidgetBase, _TemplatedMixin, dom, string, lang, on, has, logger){
	//
	//	summary:
	//		An HTML5 Video player designed to work specifically on mobile
	//		devices.
	//		This is also the Base Class for the other Video renderers.
	//
	var log = logger('MOV', 1);

	var
		HTML5TYPES = {
			mp4: 'video/mp4',
			ogv: 'video/ogg',
			webm:'video/webm'
		},

		SLTYPES = {
			// TODO: what else?
			mp4: 'video/mp4',
			wmv: 'video/wmv'
		},

		FLASHTYPES = {
			mp4: 'video/mp4',
			flv: 'video/flv'
		},

		TYPES = lang.mix({}, [HTML5TYPES, SLTYPES, FLASHTYPES]);

		supports = function(type, renderer){
			if(renderer == 'html5' && has(type)){
				return true;
			}else if(renderer == 'silverlight'){
				for(var nm in SLTYPES) if(SLTYPES[nm] == type) return true;
			}else if(renderer == 'flash'){
				for(var nm in FLASHTYPES) if(FLASHTYPES[nm] == type) return true;
			}
			return false;
		},

		deriveType =  function(filename){
			log('deriveType', filename)
			if(!filename) return null;
			var ext = lang.last(filename.split('.'));
			return TYPES[ext];
		}

		getSources = function(node){
			log('findSource...', sources);

			if(dom.prop(node, 'src')){
				return [{
					src:dom.prop(node, 'src'),
					node:node,
					type:deriveType(dom.prop(node, 'src'))
				}];
			}
log('byTag')
			var sources = dom.byTag('source', node);
			log('sources:', sources)
			if(!sources || !sources.length) return [];

			var a = [];
			sources.forEach(function(node){
				a.push({
					node:node,
					src:dom.prop(node, 'src'),
					type:dom.prop(node, 'type') || deriveType(dom.prop(node, 'src'))
				});
			}, this);
			log('return...')
			return a;
		}

	var Mobile = declare("dx-media.mobile.Video", [_WidgetBase, _TemplatedMixin], {

		templateString:'<video class="${baseClass}" src="${src}" ${attributes}>',
		baseClass:'dxMobileVideo',
		width:0,
		height:0,
		poster:"",
		src:"",
		showing:true,

		// autoplay: Boolean
		// 		If true, video plays on load. If false, waits until Play is
		// 		clicked.
		autoplay:false,

		// controls: Boolean
		// 		If true, uses native controls. Else, assumes either custom
		// 		controls, or no controls.
		// 		NOTE: ignored for mobile/Video. Used in extended classes.
		controls:false,

		// attributes: String
		// 		Additional HTML5 attributes to add to the node
		attributes:'',

		// renderer: [readonly] String
		// 		The type of video renderer to be used.
		renderer:'html5',



		constructor: function(/*Object*/options, node){
			log('mobile')

			// A properly formed video tag works fine out of the gate.
			if(node){
				this.sources = this.getSources(node);
				this.src = this.determineSource(this.sources);
				log('src:', this.src);
			}

			if(this.width){
				this.attributes = ['width="'+this.width+'"', 'height="'+this.height+'"'];
			}
		},

		postMixInProperties: function(){
			if(Array.isArray(this.attributes)) this.attributes = this.attributes.join(' ');
		},

		postCreate: function(){
			if(!has('ios')){
				log('NOT IOS')
				on(this.domNode, "click", this, function(){
					log('CLICK')
					this.domNode.play();
				});
			}else{
				log('is iOS')
			}

			on(this.domNode, "play", this, 'onPlay');
			on(this.domNode, "pause", this, function(){
				this.onPause(this.domNode);
				this.onStop(this.domNode);
			});
			on(this.domNode, "ended", this, function(){
				this.onComplete(this.domNode);
				this.onStop(this.domNode);
			});
		},

		deriveType: function(/*String*/filename){
			//	summary:
			//		Derives a mimetype string from the extension of a video file.
			return deriveType(filename); // String
		},

		getSources: function(/*DOMNode*/node){
			//	summary:
			//		Finds the source child elements of the main video node, and
			//		returns an array of objects with information of each. If
			//		there are no source nodes (as in teh case of being created
			//		programtically) this will return an empty array.
			//
			return getSources(node); // Array
		},

		determineSource: function(/*Array*/sources){
			//	summary:
			//		Determines from a list of sources, which video would be most
			//		optimal to play in the current video renderer, and returns
			//		the src (file path).
			//
			var src;
			sources.some(function(s){
				if(this.supports(s.type)){
					src = s.src;
					return true;
				}
				return false;
			}, this);
			return src; //String
		},

		supports: function(/*String*/type, /*String?*/renderer){
			//	summary:
			//		Checks whether the specified renderer supports a certain
			//		type of video. Silverlight and Flash support different
			//		codecs than HTML5 video, so different tests are needed.
			//		type:String
			//			A mime type, such as video/mp4.
			//		renderer: String?
			//			The video renderer: html5, silverlight, or Flash.
			//
			renderer = renderer || this.renderer;
			return supports(type, this.renderer);
		},

		/***********************************************************************
		 *
		 *								Methods
		 *			(most of which should be overridden by extending class)
		 *
		 **********************************************************************/

		show: function(){
			//	summary:
			//		Shows the video component.
			//
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			//	summary:
			//		Shows the video component. Does not apply in all cases -
			//		namely flash/Video which cannot be hidden without reseting.
			//
			if(!this.showing) return;
			this.pause();
			this.showing = 0;
			dom.hide(this.domNode);
		},


		play: function(){
			// should be overridden by extending class
		},

		pause: function(){
			// should be overridden by extending class
		},

		restart: function(){
			//	summary:
			//		Plays the video from the beginning.
		},

		seek: function(/*String|Float*/value){
			//	summary:
			//		Seeks to a specific point in the video. 'value' should be
			//		a float between 0 - 1.
			//		Also used are strings 'start' and 'end' to signify mousedown
			//		and mouseup as the user interacts with the scrub handle.
			//
			// should be overridden by extending class
		},

		volume: function(/*Float*/value){
			// should be overridden by extending class
		},

		isPlaying: function(){
			//	summary:
			//		A getter for determining if video is playing.
			// 		Should be overridden by extending class.
			return false;
		},

		goFullscreen: function(/*Boolean*/ isFullscreen){
			//	summary:
			//		A notification that fullscreen mode has changed.
		},

		showFullscreen: function(){
			//	summary:
			//		Used for Flash and Silverlight - shows the fullscreen button
			//		in the upper right corner.
		},

		hideFullscreen: function(){
			//	summary:
			//		Used for Flash and Silverlight - hides the fullscreen button
			//		in the upper right corner.
		},
		removeFullscreen: function(){
			//	summary:
			//		Used for Flash and Silverlight - hides the fullscreen button
			//		in the upper right corner, and keeps it hidden (destroyed
			//		visually but not literally).
		},

		getMeta: function(){
			//	summary:
			//		Returns video metadata.
			// 		Should be overridden by extending class.
			return {};
		},

		/***********************************************************************
		 *
		 *								Events
		 *
		 **********************************************************************/


		onPreview: function(w, h){
			// DOCTHIS KLUDGE
			// I think I made this as a mobile-only event.
			// we can't get the meta from a mobile video, so we'll go by the size
			// of the preview image
			this.width = w;
			this.height = h;
			this.imageAspect = w / h;
		},

		onLoad: function(/* Object */ Video){
			// summary:
			// 		Fired when the player has loaded
			// 		NOT when the video has loaded
			//
		},

		onProgress: function(/* Object */meta){
			// summary:
			//		Fired on each new update (or frame, or tick) of the video.
			//		Meta data contains percentage
		},

		onDownload: function(/* Float */percent){
			// summary:
			//		Fires the amount of that the media has been
			//		downloaded. Number, 0-1
		},

		onClick: function(/* Object */ evt){
			// summary:
			// 		TODO: Return x/y of click
			// 		Fires when the player is clicked
			// 		Could be used to toggle play/pause, or
			// 		do an external activity, like opening a new
			//		window.
		},

		onPreMeta: function(/*Object*/meta){
			//	summary:
			//		Fires when the meta data information about the video is
			//		ready, but *before* onMeta fires. This is used for video
			//		ads.
		},

		onMeta: function(/*Object*/meta){
			//	summary:
			//		Fires when the meta data information about the video is
			//		received. Some renderers will have different information
			//		than others - like Flash, which has audio codec info.
			//		The following properties are garaunteed:
			// 			p: Float
			//				The percentage of the video ellapsed
			//			time: Number,
			//				The time, in seconds of the position of the video
			//			duration: Number
			//				The length, in seconds of the video
			//			remaining:Number
			//				The time, in seconds, until the end of the video
			//			isAd:Boolean
			//				Experimental. Tells if this is an ad playing during
			//				the main video.
			//			width: Number
			//				Actual (not displayed) width of the video
			//			height:Number
			//				Actual (not displayed) height of the video
		},

		onTime: function(/* Float */ time){
			// summary:
			//		The position of the playhead in seconds
		},

		onRestart: function(){
			// summary:
			// 	Fires when the video is restarted after completion.
		},

		onStart: function(/* Object */ meta){
			// summary:
			// 		Fires when video starts
		},

		onPlay: function(/* Object */ meta){
			// summary:
			// 		Fires when video starts or resumes
		},

		onPause: function(/* Object */ meta){
			// summary:
			// 		Fires when video stops
		},

		onSeek: function(/* Object */ meta){
			// summary:
			// 		Fires at the start, during, and the end of dragging the
			// 		progress handle.
		},

		onStop: function(/* Object */ meta){
			// summary:
			// 		Fired on pause OR end. (I think I use this for mobile only)
		},

		onComplete: function(/* Object */ meta){
			// summary:
			// 		Fires on completion of video
		},

		onBuffer: function(/* Boolean */ isBuffering){
			// summary:
			//		Fires when buffering or when buffering
			//		has finished. (not a garaunteed event to fire in all
			//		renderers)
		},

		onError: function(/* Object */ errorObject){
			// summary:
			// 		Fired when the player encounters an error
		},

		onStatus: function(/* String */status){
			// summary:
			// 		The status of the video from the SWF
			// 		playing, stopped, bufering, etc.
		},

		onFullscreen: function(/* Boolean */ isFullscreen){
			// summary:
			// 		Fired when video toggles fullscreen
		},

		onSize: function(size){
			// summary:
			// 		Fires on video resize.
		},

		onResize: function(){
			// summary:
			// 		Fired when video resizes, but not when it goes fullscreen
		}
	});

	return Mobile;
});



/*

<video width="320" height="240" controls >
	<source src="SightAndSound.mp4"  type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'"/>
	<source src="SightAndSound.ogv"  type="video/ogg  codecs='theora, vorbis'" />
	<source src="SightAndSound.webm" type="video/webm codecs='vorbis, vp8'" />
</video>

*/
