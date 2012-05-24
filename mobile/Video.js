define([
	'dojo/_base/declare',
	'dojo/sniff',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dx-alias/dom',
	'dx-alias/string',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/log'
],function(declare, has, _WidgetBase, _TemplatedMixin, dom, string, lang, on, logger){
	//
	//	summary:
	//		An HTML5 Video player designed to work spcifically on mobile devices.
	//
	var log = logger('VMO', 1);
	var showing = 1;

	var TYPES = {
		mp4: 'video/mp4',
		ogv: 'video/ogg',
		webm:'video/webm'
	};

	var Mobile = declare("dx-media.mobile.Video", [_WidgetBase, _TemplatedMixin], {

		templateString:'<video class="${baseClass} dxMobileVideo" src="${src}" >',
		baseClass:'',
		width:0,
		height:0,
		poster:"",
		src:"",

		constructor: function(/*Object*/options, node){

			// A properly formed video tag works fine out of the gate.
			if(node){
				node = dom.byId(node);
				if(node.getAttribute('data-dojo-type')){
					var sources = dom.byTag('source', node);
					if(sources && sources.length){
						this.findSource(sources);
						this.src = this.sources[0].src;
					}
				}
			}
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
				this.onEnd(this.domNode);
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

		onSize: function(size){

		},

		onEnd: function(meta){

		},

		onPause: function(meta){

		},

		onStop: function(meta){
			// fired on pause OR end
			console.log(this.domNode.width)
		},

		onPlay: function(meta){
			// warning: unpredictable on the iPhone.
		},

		deriveType: function(filename){
			if(!filename) return null;
			var ext = lang.last(filename.split('.'));
			return TYPES[ext];
		},

		findSource: function(sources){
			this.sources = [];
			sources.forEach(function(node){
				this.sources.push({
					src:dom.get(node, 'src'),
					type:dom.get(node, 'type') || this.deriveType(dom.get(node, 'src'))
				});
			}, this);
			console.log('this.sources:', this.sources);
			return this.sources;
		},

		show: function(){
			if(showing) return;
			showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!showing) return;
			showing = 0;
			dom.hide(this.domNode);
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
