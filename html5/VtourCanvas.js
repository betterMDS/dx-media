define([
	'dojo/_base/declare',
	'dojo/sniff',
	'dojo/fx/easing',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'./Image',
	'dx-alias/lang',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/log',
	'dx-timer/timer'
], function(declare, has, fx, _WidgetBase, _TemplatedMixin, Dimage, lang, dom, on, logger, timer){

	var log = logger('VTC', 0);
	var tmp;
	var Base = function(){};


	var reduceImageSize = function(){
		// Will get attached to the instance (hence use of "this").
		// Reducing image size to the height of the node. This *greatly*
		// improves performance. Note this is conditional, as it cannot be
		// done in older version of FF.
		this.temp = {
			h:this.height,
			w:this.image.w * (this.height/this.image.h)
		}

		this.resampledCanvas = dom('canvas', {
			width:this.temp.w,
			height:this.temp.h
		});
		tmp = this.resampledCanvas.getContext("2d");
		tmp.createImageData(this.temp.w, this.temp.h);
		//console.log('resample', this.image.w, this.image.h, 0, 0, this.temp.w, this.temp.h)
		tmp.drawImage(this.img, 0, 0, this.image.w, this.image.h, 0, 0, this.temp.w, this.temp.h);

		// FIXME:
		// createImageData is supported in FF 3.6, but getImageData is not.

		this.resampledImage = tmp.getImageData(0,0,this.temp.w, this.temp.h);
		//console.log("this.resampledImage", this.resampledImage);
		console.log("resampledImage", this.temp.w, this.temp.h)

		this.image = {
			w:this.temp.w,
			h:this.temp.h
		};
	};

	if(has('ff') && has('ff') < 5){ // older FF does not use a resampled canvas
		Base.prototype = {
			reduceImageSize: function(){},
			draw: function(){
				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					this.ctx.drawImage(this.img, s.fx(offset), s.y, s.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);

				}
			}
		}

	}else if(has('webkit')){ // no sign of this being fixed. Affects Chrome and Safairi.
		Base.prototype = {
			reduceImageSize: reduceImageSize,
			draw: function(){
				var refineParams = function(x, w, iw){
					// not even sure how well this works. I think the floating point inaccuracy of JS is keeping this from preventing errors.
					return (x + w > iw) ?
						{
							w:(x + w) - iw,
							x:x
						} : {
							x:x,
							w:w
						}
				};

				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					o = refineParams(s.fx(offset), s.w, sw);
					//console.log(this.x, this.y, o.x, s.y, o.w, s.h)
					try{
						// catching this for WebKit. Doesn't seem to slow down FF though.
						this.ctx.drawImage(this.resampledCanvas, o.x, s.y, o.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);
					}catch(e){
						//console.error(o.x, o.w)
					}
				}
			}
		}
	}else{ // FF 5+, IE9, Opera, etc
		Base.prototype = {
			reduceImageSize: reduceImageSize,
			isInError:false,
			draw: function(){
				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s, _x;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					_x = s.fx(offset);
					this.ctx.drawImage(this.resampledCanvas, _x, s.y, s.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);
				}
			}
		}
	}


	return declare('dx-media.html5.VtourCanvas', [Base, _WidgetBase, _TemplatedMixin], {
		templateString:'<div style="width:${width}px; height:${height}px"><canvas data-dojo-attach-point="canvas" width="${width}" height="${height}"></canvas></div>',

		x:0,
		y:0,
		width:0,
		height:0,
		src:"",

		zoomed:1,
		scaled: 1.5, // more is more.
		exscale: 1, // the middle portion. Less than 1 shows bg.
		magnify: 1, // smaller is more
		segment:2,  // divisor is equivalent to pixels. Prob needs to fit to image width else may cause problems.

		index:0,
		path:"",
		image:null, 	// params
		img:null, 		// the image node
		temp:null, 		// resampled image data
		resampledImage:null,

		autoplay:0, // TODO: in Flash also
		playing:0,
		showing:1,

		ease:"quad", // quad, cubic, circ - controls the amount of bend
		speed: 3,
		initSpeed: 3,
		maxspeed:30,

		postCreate: function(){
			this.slices = [];

			this.easeOut = fx[this.ease+"Out"];
			this.easeIn = fx[this.ease+"In"];

			this.ctx = this.canvas.getContext("2d");

			this.image = {};
			this.img = dom('img', {
				on:{
					"load": function(evt){
						this.image.w = this.img.width;
						this.image.h = this.img.height;

						log("canvas image loaded", this.image.w, this.image.h);
						this.prepare();
						dom.hide(this.preloader);

						// fix bug in iPhone where after 1 image the subsequent
						// do not appear unless toggled
						if(this.index > 0 && has('touch')){
							this.hide();
							timer(this, 'show', 100);
						}

					}.bind(this),
					"error":function(){
						console.error("Image not found:", this.path);
					}.bind(this)
				}
			});

			this.preloader = dom('div', {css:'dxVtourPreloader', style:{
				width:this.width+'px',
				height:this.height+'px'
			}}, this.domNode);

			this.ani = timer(this, function(){
				this.move(-this.speed, true);
			}, Infinity, 20, 'debug', true, {id:'ani_'+this.index});

			this.src && this.load();

		},

		onSize: function(size){
			if(!this.image || !this.image.w){
				timer(this, function(){
					this.onSize(size);
				}, 100);
				return;
			}
			dom.style(this.domNode, {
				width:size.w+'px',
				height:size.h+'px'
			});

			this.canvas.width = size.w;
			this.canvas.height = size.h;

			this.width = size.w;
			this.height = size.h;

			this.prepareSlices();
		},

		load: function(path){
			dom.show(this.preloader);
			if(path) this.src = path;
			log('load:', this.src.substring(0,50)+'...');
			this.img.src = this.src;
		},

		adjustY: function(){
			if(this.y > 0){
				this.y = 0;
			}else{
				var ph = this.slices[Math.floor(this.slices.length/2)].dh*this.zoomed - this.height;
				if(this.y < -ph){
					this.y = -ph;
				}
			}
		},

		tilt: function(amt){
			if(this.zoomed === 1) return;
			this.y += amt;
			this.adjustY();
			//log("tilt", this.y)
			this.draw();
		},

		move: function(amt, isAni){
			if(!amt) return;
			!isAni && this.stop();
			this.x -= amt;
			if(this.x < 0) this.x += this.image.w;
			this.draw();
		},

		push: function(amount){

			if(amount == "reset"){
				this.speed = 0;
			}else{
				this.speed += (amount*.1);
				if(this.speed < -this.maxspeed) this.speed = -this.maxspeed;
				if(this.speed > this.maxspeed) this.speed = this.maxspeed;
			}
			this.play();
			//log("push:", amount, this.speed, this.x)
		},

		zoom: function(adj){
			adj = adj || 0;
			this.zoomed += adj;
			this.zoomed = lang.minMax(this.zoomed, 1, 3);
			this.ctrX = (this.width - this.zoomed*this.width)/2;
			//console.log("zooom", this.zoomed, "adj:", adj)
			this.adjustY();
			this.draw(this.x);
		},

		zoomTo: function(amount){
			this.zoomed = amount;
			this.zoom();
		},



		scale: function(){
			var e, es, dh, h = this.height;
			for(var i=1, half=this.slices.length/2; i<=this.slices.length;i++){
				var s = this.slices[i-1];
				if(i <= half){
					e = this.easeOut(i/(half));
					es = (this.scaled-this.magnify)*(1-e) + this.exscale;
				}else{
					e = this.easeIn((i-half)/(half));
					es = (this.scaled-this.magnify)*e + this.exscale;
				}
				dh = h * es;

				s.dy = (dh - h) / -2;
				s.dh = dh;
			}
		},

		play: function(){
			log('play index:', this.index);
			if(this.playing) return;
			this.playing = 1;
			if(!this.speed) this.speed = this.initSpeed;
			this.ani.resume();
		},

		stop: function(){
			log('stop! index:', this.index, 'playing:', this.playing);
			if(!this.playing) return;
			this.playing = 0;
			this.ani.pause();
		},

		prepare: function(){
			log('prepare', this.img);
			this.reduceImageSize();
			this.prepareSlices();

			if(this.autoplay) timer(this, 'play', 500);//this.play();
		},

		prepareSlices: function(){
			var amount = this.width / this.segment;
			var seg = this.width / amount / 1; // width of each slice.
			this.slices = [];
			var x = 0, h = this.height, iw = this.image.w;
			var e, es, dh;

			for(var i=1, half = amount/2; i<=amount; i++){

				var s ={
					x:x,
					y:0,
					w:seg,
					h:this.image.h,

					dx: x,
					dw: seg
				};

				(function(){
					var _x = x;
					s.fx = function(offset){
						return (_x + offset)%iw;
					}
				})();

				this.slices.push(s);
				x += seg;
			}

			this.zoom();
			this.scale();
			this.draw();
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
			this.wasPlaying && this.play();
		},

		hide: function(){
			if(!this.showing) return;
			this.showing = 0;
			this.wasPlaying = this.playing;
			this.stop();
			dom.hide(this.domNode);
		}
	});

});
