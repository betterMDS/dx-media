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
	//		An HTML5 Video player designed to work spcifically on mobile devices.
	//
	var log = logger('MOV', 0);
	var showing = 1;

	var TYPES = {
		mp4: 'video/mp4',
		ogv: 'video/ogg',
		webm:'video/webm'
	};
	var SLTYPES = {
		// TODO: what else?
		mp4: 'video/mp4',
		wmv: 'video/wmv'
	};
	var FLASHTYPES = {
		mp4: 'video/mp4',
		flv: 'video/flv'
	};

	var Mobile = declare("dx-media.mobile.Video", [_WidgetBase, _TemplatedMixin], {

		templateString:'<video class="${baseClass}" src="${src}" ${attributes}>',
		baseClass:'dxMobileVideo',
		width:0,
		height:0,
		poster:"",
		src:"",

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

			// A properly formed video tag works fine out of the gate.
			if(node){
				this.src = this.findSource(dom.byId(node));
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

		onPreview: function(w, h){
			// DOCTHIS KLUDGE
			// we can't get the meta from a mobile video, so we'll go by the size
			// of the preview image
			this.width = w;
			this.height = h;
			this.imageAspect = w / h;
		},

		play: function(){
			// should be overridden by extending class
			throw new Error('play() not implemented.');
		},

		pause: function(){
			// should be overridden by extending class
			throw new Error('pause() not implemented.');
		},

		seek: function(){
			// should be overridden by extending class
			throw new Error('seek() not implemented.');
		},

		volume: function(){
			// should be overridden by extending class
			throw new Error('volume() not implemented.');
		},

		show: function(){
			if(showing) return;
			showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!showing) return;
			this.pause();
			showing = 0;
			dom.hide(this.domNode);
		},

		isPlaying: function(){
			// should be overridden by extending class
			throw new Error('isPlaying() not implemented.');
		},

		getMeta: function(){
			// should be overridden by extending class
			throw new Error('getMeta() not implemented.');
		},



		deriveType: function(filename){
			log('deriveType', filename)
			if(!filename) return null;
			var ext = lang.last(filename.split('.'));
			return TYPES[ext];
		},

		findSource: function(node){
			log('findSource...', sources);

			if(dom.prop(node, 'src')) return dom.prop(node, 'src');

			var sources = dom.byTag('source', node);
			log('sources:', sources)
			if(!sources || !sources.length) return null;

			this.sources = [];
			sources.forEach(function(node){
				this.sources.push({
					node:node,
					src:dom.prop(node, 'src'),
					type:dom.prop(node, 'type') || this.deriveType(dom.prop(node, 'src'))
				});
				log('this.sources', this.sources);
			}, this);
			log('findSource:', this.sources);

			var src;
			this.sources.some(function(s){
				if(this.supports(s.type)){
					src = s.src;
					return true;
				}
				return false;

			}, this);
			return src;
		},

		supports: function(type){
			if(this.renderer == 'html5' && has(type)){
				return true;
			}else if(this.renderer == 'silverlight'){
				for(var nm in SLTYPES) if(SLTYPES[nm] == type) return true;
			}else if(this.renderer == 'flash'){
				for(var nm in FLASHTYPES) if(FLASHTYPES[nm] == type) return true;
			}
			return false;
		},






		onLoad: function(/* Object */ Video){
			// summary:
			// 		Fired when the player has loaded
			// 		NOT when the video has loaded
			//
		},

		onProgress: function(/* Object */meta){

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

		},

		onMeta: function(/*Object*/meta){

		},

		onTime: function(/* Float */ time){
			// summary:
			//		The position of the playhead in seconds
		},

		onRestart: function(){

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

		onSize: function(size){

		},

		onStop: function(/* Object */ meta){
			// fired on pause OR end
			console.log(this.domNode.width)
		},


		onComplete: function(/* Object */ meta){
			// summary:
			// 		Fires on completion of video
		},

		onBuffer: function(/* Boolean */ isBuffering){
			// summary:
			//		Fires when buffering or when buffering
			//		has finished
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
