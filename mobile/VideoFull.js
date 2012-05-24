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
	//	NOTE:
	//			This file is temporary, or needs work.
	//			Left here for reference.
	//
	//
	//
	var TYPES = {
		mp4: 'video/mp4',
		ogv: 'video/ogg',
		webm:'video/webm'
	};

	var
		domTemplate = '<div class="${baseClass} dxPlayer dxMobile">',
		imgTemplate = '<img data-dojo-attach-point="posterNode" src="${poster}" class="dxPoster" width="${width}" />',
		btnTemplate = '<div data-dojo-attach-point="buttonNode" class="dxScreenPlayButton"></div>',
		vidTemplate = '<video data-dojo-attach-point="video" src="${src}" poster="${poster}" width="${width}" height="${height}"></video>'

	var Mobile = declare("dx-media.video.Mobile", [_WidgetBase, _TemplatedMixin], {

		templateString:'',
		baseClass:'',
		width:320,
		height:240,
		poster:"",
		src:"",

		constructor: function(/*Object*/options, node){

			// A properly formed video tag works fine out of the gate.

			console.log('constructor', options);
			if(node){
				node = dom.byId(node);
				if(node.getAttribute('data-dojo-type')){
					var sources = dom.byTag('source', node);
					if(sources && sources.length){
						this.findSource(sources);
						this.src = this.sources[0].src;
					}
				}
				if(!options.width){
					if(dom.style(node, 'width')){
						this.width = dom.style(node, 'width');
						this.height = dom.style(node, 'height');
					}else if(dom.style(node.parentNode, 'width')){
						this.width = dom.style(node.parentNode, 'width');
						this.height = dom.style(node.parentNode, 'height');
					}
				}
			}

			if(has('ios')){
				this.templateString = [domTemplate, imgTemplate, btnTemplate, vidTemplate, '</div>'].join('');
			}else{
				this.templateString = [domTemplate, vidTemplate, imgTemplate, btnTemplate, '</div>'].join('');
			}

			console.log('mobile size:', this.width, this.height)
		},

		postCreate: function(){
			console.log('nodes', this.buttonNode, this.posterNode)
			if(has('ios')){
				this.iphoneSetup();

			}else if(has('android')){
				on(this.buttonNode, "click", this, function(){
					this.video.play();
				});
				on(this.posterNode, "click", this, function(){
					this.video.play();
				});
			}else{
				on(this.buttonNode, "click", this, function(){
					this.video.play();
					this.removePoster();
				});
			}
		},

		iphoneSetup: function(){
			console.log('iphoneSetup');

			dom.style(this.video, "opacity", 0);
			//dom.style(this.posterNode, "opacity", .5);
			//dom.style(this.buttonNode, "opacity", .5);
			if(dom.byId('dbg')) dom.byId('dbg').value = this.domNode.innerHTML;

			on(this.video, "play", this, function(){
				//dom.byId('dbg').value = 'PLAY'
			});
			on(this.video, "pause", this, 'removePoster');
			on(this.video, "ended", this, 'removePoster');
			console.log('iphoneSetup done');
		},

		removePoster: function(){
			// after play, iPhone shows the last frame.
			// Get rid of the poster and button.
			//dom.byId('dbg').value = 'DESTROY '+(!!this.posterNode)
			if(!this.posterNode) return;
			dom.style(this.video, "opacity", 1);
			dom.destroy(this.posterNode);
			dom.destroy(this.buttonNode);
			this.posterNode = null;
			this.buttonNode = null;
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
