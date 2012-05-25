define([
	'dojo/_base/declare',
	'./theme',
	'./base',
	'dx-alias/topic',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/log'
], function(declare, theme, sl, topic, lang, on, logger){

	var log = logger('SLC', 1);
	var
		norm = theme.norm,
		over = theme.over,
		down = theme.down,
		light = theme.light,
		medium = theme.medium,
		dark = theme.dark;

	return declare(null, {
		width:0,
		height:0,

		playing: 0,

		constructor: function(options, parent){
			lang.mix(this, options);
			this.canvas = parent;

			log('size:', this.width, this.height)

			this.buildControlBar();
			this.buildPlay();
			this.buildTime();
			this.buildProgress();
			this.buildVolume();
			this.buildDur();
			this.buildFullscreen();

			this.positionElements();

			this.connect();
		},

		connect: function(){
			topic.sub.multi({
				'/video/on/play':'onPlay',
				'/video/on/pause':'onPause',
				'/video/on/frame':'onFrame',
				'/video/on/seek':'onFrame',
				'/video/on/download':'onDownload',
				'/video/on/meta':'onMeta'
			}, this);

			/*if(b.player && b.player.controls){
				b.timer(this, function(){
					on(b.player.controls, "onShowControls", this, 'showFullscreen');
					on(b.player.controls, "onHideControls", this, 'hideFullscreen');
				}, 1);
			}*/
		},

		show: function(){
			this.controlbar.show();
		},

		hide: function(){
			this.controlbar.hide();
		},

		showFullscreen: function(){
			//this.fsBtn.show();
			this.fsBtn.ani({x:this.width - theme.button.width - theme.gap});
		},

		hideFullscreen: function(){
			//this.fsBtn.hide();
			this.fsBtn.ani({x:this.width + 5}, 1000);
		},

		onPlay: function(meta){
			// button is connected to this event
		},

		onPause: function(meta){
			// button is connected to this event
		},

		onFullscreen: function(isFullscreen){
			// called directly from sl.Video
			if(isFullscreen){
				this.wasWidth = this.width;
				this.wasHeight = this.height;
				this.width = window.screen.width;
				this.height = window.screen.height;

			}else{
				this.width = this.wasWidth;
				this.height = this.wasHeight;
			}
			log('onFullscreen', this.width, this.wasWidth, this.height, this.wasHeight)
			this.positionElements();
		},

		onFrame: function(meta){
			this.timeNode.setText({text:lang.timeCode(meta.time, 'mm_ss')});
			this.durNode.setText({text:lang.timeCode(meta.remaining, 'mm_ss')});
			this.progressNode.size({width:this.progressWidth * meta.p});
		},

		updateProgress: function(meta){
			this.progressNode.size({width:this.progressWidth * meta.p});
		},

		onMeta: function(meta){
			this.durNode.setText({text:lang.timeCode(meta.duration, 'mm_ss')});
		},

		onDownload: function(meta){
			this.downloadNode.size({width:this.progressWidth * meta.p});
		},

		buildControlBar: function(){
			var cb = theme.get('controls', true, true);
			cb.y = this.height - cb.height - theme.gap;
			this.controlbar = new sl.Rect(cb, this.canvas);
		},

		buildProgress: function(){
			var w = theme.progress.width;
			var h = theme.progress.height;
			var grad

			grad = theme.getGrad(h, dark, norm);
			this.progressBackNode = new sl.Rect({width:w,height:h, grad:grad, nostroke:1}, this.controlbar);

			grad = theme.getGrad(h, medium, dark);
			this.downloadNode = new sl.Rect({width:w,height:h, grad:grad, nostroke:1}, this.controlbar);

			grad = theme.getGrad(h, over, light);
			this.progressNode = new sl.Rect({width:w,height:h, grad:grad, nostroke:1}, this.controlbar);

			this.progressHit = new sl.Rect({width:w,height:h, opacity:0, nostroke:1, cursor:1}, this.controlbar);

			this.progressHit.on('drag', this, function(e){
				console.log('prog click', e.type, e.x);
				if(e.type == 'up'){
					topic.pub("/video/seek", "end");
				}else{

					if(e.type == 'down') topic.pub("/video/seek", "start");
					var p = lang.minMax(e.x / this.progressWidth, 0, 1);
					this.updateProgress({p:p});
					topic.pub("/video/seek", p);
				}
			});

		},

		buildPlay: function(){
			var h = theme.button.height;
			var btnNorm = {grad:theme.getGrad(h, norm, medium)};
			var btnOver = {grad:theme.getGrad(h, over, medium)};
			var btnDown = {grad:theme.getGrad(h, medium, over)};

			var bo = theme.get('button', true, false);
			bo.cursor = 1;
			bo.grad = btnNorm.grad;
			this.playBtn = new sl.Rect(bo, this.controlbar);

			var x = 0, y = 0, w = theme.play.width, h = theme.play.height;
			var data = [
				{x:x,y:y,t:'M'},
				{x:x+w, y:y+h/2, t:'L'},
				{x:x, y:y+h, t:'L'},
				{t:'z'}
			];
			var playIcon = new sl.Path({
				id:'playicon',
				x:(theme.button.width - theme.play.width)/2,
				y:(theme.button.height - theme.play.height)/2,
				data:data,
				nostroke:1,
				color:theme.norm
			}, this.playBtn);

			var p1 = w*.4, p2 = w * .6;
			data = [
				{x:x,y:y,t:'M'},
				{x:x+p1,y:y,t:'L'},
				{x:x+p1,y:y+h,t:'L'},
				{x:x,y:y+h,t:'L'},
				{x:x,y:y,t:'L'},
				{x:x+p2,y:y,t:'M'},
				{x:x+w,y:y,t:'L'},
				{x:x+w,y:y+h,t:'L'},
				{x:x+p2,y:y+h,t:'L'},
				{x:x+p2,y:y,t:'L'}
			];
			var pauseIcon = new sl.Path({
				id:'pauseIcon',
				x:(theme.button.width - theme.play.width)/2,
				y:(theme.button.height - theme.play.height)/2,
				data:data,
				nostroke:1,
				color:theme.norm
			}, this.playBtn).hide();

			this.playBtn.on('over', this, function(evt, e2){
				playIcon.fill({color:theme.over});
				pauseIcon.fill({color:theme.over});
				this.playBtn.fill(btnOver);
			});
			this.playBtn.on('out', this, function(evt, e2){
				playIcon.fill({color:theme.norm});
				pauseIcon.fill({color:theme.norm});
				this.playBtn.fill(btnNorm);
			});
			this.playBtn.on('down', this, function(evt, e2){
				this.playBtn.fill(btnDown);
			});
			this.playBtn.on('up', this, function(evt, e2){
				this.playBtn.fill(btnOver);
			});
			this.playBtn.on('click', this, function(evt, e2){
				log('PLAY CLICK')
				if(this.playing){
					topic.pub("/video/pause");
					topic.pub("/button/pause");
				}else{
					topic.pub("/video/play");
					topic.pub("/button/play");
				}
			});


			on(this, 'onPlay', this, function(){
				this.playing = 1;
				pauseIcon.show();
				playIcon.hide();
			});
			on(this, 'onPause', this, function(){
				this.playing = 0;
				pauseIcon.hide();
				playIcon.show();
			});
		},

		buildTime: function(){
			this.timeNode = new sl.Text({text:'0:00', fontSize:10, color:'#FFFFFF'}, this.controlbar);
		},
		buildDur: function(){
			this.durNode = new sl.Text({text:'0:00', fontSize:10, color:'#FFFFFF'}, this.controlbar);
		},

		updateVolume: function(evt){
			var c, p, volume = evt ? evt.p : .7;
			this.volLines.forEach(function(ln, i){
				p = i===0 ? 0 : i/this.volLines.length;
				c = p <= volume ? theme.norm : theme.dark;
				ln.fill({color:c});
			}, this);
		},

		buildVolume: function(s){

			var lineWidth = 2.0;
			var lineGap = 2;
			var lw = (lineWidth+lineGap);
			var amt = Math.ceil(theme.volume.width/lw);

			var volume = .7;//this.player.volume;

			this.volNode = new sl.Rect({x: 0, y: 0, width: theme.volume.width, height: theme.volume.height, color:'#ffffff', nostroke:1, opacity:0, cursor:1}, this.controlbar);

			this.volLines = [];
			var x = 0, y = 0, p, c;
			for(var i=0; i<amt; i++){
				p = i===0 ? 0 : i/amt;
				c = p <= volume ? theme.norm : theme.dark;
				c = '#ff0000'
				var rect = new sl.Rect({x:x, y:y, width:lineWidth, height:theme.volume.height, color:c, nostroke:1, opacity:.5}, this.volNode);
				this.volLines.push(rect);
				x += lw;
			}
			this.updateVolume();

			this.volNode.on('drag', this, function(e){
				console.log('vol click', e.type, e.x);
				if(e.type == 'up'){

				}else{
					var p =  b.minMax( e.x / theme.volume.width );
					this.updateVolume({p:p});
				}
			});
		},

		buildFullscreen: function(){

			var bw = theme.button.width, bh = theme.button.height;
			var btnNorm = {grad:theme.getGrad(bh, norm, medium)};
			var btnOver = {grad:theme.getGrad(bh, over, medium)};
			var btnDown = {grad:theme.getGrad(bh, medium, over)};

			var bo = theme.get('button', true, false);
			bo.cursor = 1;
			bo.grad = btnNorm.grad;
			this.fsBtn = new sl.Rect(bo, this.canvas);

			var w = theme.fullscreen.width, h = theme.fullscreen.height, x = (bw-w)/2, y = (bh-h)/2, w1 = 2, w2 = w1 * 1;

			var data = [
				{x:x, y:y, t:'M'},
				{x:x+w,y:y,t:'L'},
				{x:x+w,y:y+h,t:'L'},
				{x:x,y:y+h,t:'L'},
				{t:'Z'},
				{x:x+w1, y:y+w1, t:'M'},
				{x:x+w/2,y:y+w1,t:'L'},
				{x:x+w/2,y:y+h/2,t:'L'},
				{x:x+w-w2,y:y+h/2,t:'L'},
				{x:x+w-w2,y:y+h-w2,t:'L'},
				{x:x+w1,y:y+h-w2,t:'L'},
				{t:'Z'}
			];

			var fsIcon = new sl.Path({x:0,y:0,data:data, line:0, color:theme.norm}, this.fsBtn);

			this.fsBtn.on('over', this, function(evt, e2){
				fsIcon.fill({color:theme.over});
				this.fsBtn.fill(btnOver);
			});
			this.fsBtn.on('out', this, function(evt, e2){
				fsIcon.fill({color:theme.norm});
				this.fsBtn.fill(btnNorm);
			});
			this.fsBtn.on('down', this, function(evt, e2){
				this.fsBtn.fill(btnDown);
			});
			this.fsBtn.on('up', this, function(evt, e2){
				this.fsBtn.fill(btnOver);
			});
			this.fsBtn.on('click', this, function(evt, e2){
				topic.pub('/video/fullscreen');
			});
		},


		positionElements: function(){

			var box, t = theme, x, y, w, h, bw = t.button.width;
			y = this.height - t.controls.height - theme.gap;
			w = this.width - t.gap*2;
			x = (this.width - w)/2;

			log('resize', x, y, this.width, this.height);
			this.controlbar.size({width:w});
			this.controlbar.position({x:x,y:y});

			this.playBtn.position({x:t.gap, y:(t.controls.height-t.button.height)/2});

			box = this.timeNode.getSize();
			x = t.gap*2 + bw;
			y = (t.controls.height - box.h)/2;
			this.timeNode.position({x:x, y:y});

			var px1 = x + t.gap + box.w;

			x = w - t.volume.width - t.gap - t.gap;
			y = (t.controls.height - t.volume.height)/2;
			this.volNode.position({x:x,y:y});
log('vol', w - t.volume.width - t.gap - t.gap, w, t.volume.width, t.gap )

			box = this.durNode.getSize();
			x = x - t.gap - box.w;
			y = (t.controls.height - box.h)/2;
			this.durNode.position({x:x, y:y});

			var px2 = x - t.gap;
			y = (t.controls.height - t.progress.height)/2;
			this.progressWidth = px2-px1;
			this.progressBackNode.size({width:this.progressWidth}).position({x:px1, y:y});
			this.progressHit.size({width:this.progressWidth}).position({x:px1, y:y});
			this.downloadNode.size({width:0}).position({x:px1, y:y});
			this.progressNode.size({width:0}).position({x:px1, y:y});

log('fs:', this.width - bw - t.gap, this.width, bw, t.gap)
			this.fsBtn.position({x:this.width - bw - t.gap, y:5});

			log(' --- controls set ---');
		}

	});
});
