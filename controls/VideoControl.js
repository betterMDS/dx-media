define([
	'dojo/_base/declare',
	'dijit/_WidgetBase',
	'dijit/registry',
	'dx-alias/on',
	'dx-alias/lang',
	'dx-alias/log'
],function(declare, _WidgetBase, registry, on, lang, logger){

	var log = logger('VC', 1);

	// TODO:
	// 	Make this a widget... problem is it has no DOM and confuses Dijit and
	// 	says ID already exists (for some other widget apparently)
	//
	return declare('dx-media.controls.VideoControl', [], {
		controls:null,
		video:null,
		preview:null,
		constructor: function(video, controls, preview){
			this.controls = this.getObject(controls);
			this.video = this.getObject(video);
			this.preview = this.getObject(preview);
			this.id = lang.uid('VideoControl');

			this._connections = [];

			this.buttons = this.controls.getElements();
			this.map = {};
			this.buttons.forEach(function(w){ this.map[w.name] = w}, this);
			this.init();
		},

		getObject: function(obj){
			return typeof obj == 'string' ? registry.byId(obj) : obj;
		},

		connectEvents: function(){
			this._connections.forEach(function(handle){ handle.resume(); }, this);
		},

		disconnectEvents: function(){
			this._connections.forEach(function(handle){ handle.pause(); }, this);
		},

		init: function(){
			if(this.inited) return;
			this.inited = 1;

			log('video', this.map);

			if(this.map.Play){
				this.on(this.map.Play, 'onPlay', this.video, 'play');
				this.on(this.map.Play, 'onPause', this.video, 'pause');
				this.on(this.video, 'onPlay', this.map.Play, 'showPause');
				this.on(this.video, 'onPause', this.map.Play, 'showPlay');
			}

			if(this.map.Fullscreen){
				this.on(this.map.Fullscreen, 'onClick', this.video, 'fullscreen');
			}

			if(this.map.Volume){
				this.on(this.map.Volume, 'onUpdate', this.video, 'volume');
			}

			if(this.map.Progress){
				this.on(this.map.Progress, 'onUpdate', this.video, 'seek');
				this.on(this.video, 'onFrame', this.map.Progress, 'update');
			}

			if(this.map.Duration){
				this.on(this.video, 'onMeta', this.map.Duration, 'update');
				this.on(this.video, 'onFrame', this.map.Duration, 'update');
			}

			if(this.map.Time){
				this.on(this.video, 'onFrame', this.map.Time, 'update');
			}

			if(this.preview){
				
			}


		},

		on: function(obj, event, ctx, method){
			this._connections.push(on(obj, event, ctx, method));
		}

	});
});
