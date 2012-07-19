define([
	'dojo/_base/declare',
	'../mobile/Video',
	'../html5/Video',
	'../silverlight/Video',
	'../flash/Video',
	'../html5/Preview',
	'../controls/elements/ScreenPlayButton',
	'../controls/Controller',
	'../controls/Controlbar',
	'../controls/elements/Play',
	'../controls/elements/Fullscreen',
	'../controls/elements/Volume',
	'../controls/elements/Time',
	'../controls/elements/Progress',
	'../controls/elements/Duration',
	'dx-alias/Widget',
	'dx-alias/has',
	'dx-alias/dom',
	'dx-alias/lang',
	'dx-alias/log',
	'dx-timer/timer'
], function(declare, Mobile, H5Video, SLVideo, FLVideo, Preview,
			ScreenPlayButton, Controller, Controlbar, Play, Fullscreen, Volume, Time, Progress, Duration,
			Widget,  has, dom, lang, logger, timer){
	//	summary:
	//		A top-level class that is a mobile-only player.
	//

	var log = logger('PLR', 1);

	var
		isMobile = has('mobile'),

		renderers = ['html5','silverlight','flash'],

		classes = {
			html5:H5Video,
			silverlight:SLVideo,
			flash:FLVideo
		};

	return declare('dx-media.player.Player', [Widget], {

		templateString:'<div><div class="dxPlayer" data-dojo-attach-point="containerNode"></div></div>',

		src:'',
		poster:'',
		controls:1,
		width:0,
		height:0,

		screenButton:true,

		renderer:'',


		constructor: function(/*Object*/options, node){

			log('options', !!options.src, options)

			this.sources = Mobile.getSources(node, options.src);
			var obj = Mobile.determineSource(this.sources, renderers);
			this.renderer = obj.renderer;
			this.src = obj.src;

			log('renderer/src:', this.renderer, this.src)
		},

		postCreate: function(){
			log('SRC:', this.src);
			log('poster:', this.poster);
			var node = this.containerNode;
			var components = {};

			if(!this.width){
				var box = dom.box(this.domNode);
				this.width = box.w;
				this.height = box.h;
			}

			log('creating video component type:', this.renderer);
			
			this.video = components.video = this.addChild(new classes[this.renderer]({
				src:this.src,
				width:this.width,
				height:this.height,
			}));

			if(this.poster){
				this.preview = components.preview = this.addChild(new Preview({src:this.poster}));
			}

			if(this.screenButton){
				this.screenButton = components.screenButton = this.addChild(new ScreenPlayButton({}));
			}

			if(this.controls){
				this.controls = components.controls = this.addChild(new Controlbar({}));

				this.controls.addChildren([
					new Play({}),
					new Fullscreen({}),
					new Volume({}),
					new Time({}),
					new Progress({width:100}),
					new Duration({})
				]);
				this.controls.startup();
				log('components', components);
				this.controller = new Controller(components);
			}



		}
	});

});
