define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/sniff",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dojo/io/script",
	"./Photo",
	"dx-alias/on",
	"dx-alias/dom",
	"dx-alias/log",
	'dx-alias/mouse',
	'dx-alias/string',
	'dx-timer/timer',
	"../mobile/common"
], function(declare, connect, has, _WidgetBase, _TemplatedMixin, _Container, io, Photo, on, dom, logger, mouse, string, timer, common){
	//	summary:
	//		A horizontal image slideshow that pans between images by
	//		click-dragging in a browser or by a swipe gesture on a touch device,
	//		similar to the iPhone Photos app.
	//
	//		TODO:
	//			media and playlist stuff to be moved into a Playlist object.
	//
	var log = logger('SLD', 0);

	var isMobile = has('ios') || has('android');

	return declare('dx-media.html5.Slideshow', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div class="dxSlideshow"><div class="dxSlideshowContainer" data-dojo-attach-point="containerNode"></div></div>',
		buttonClass:'',

		// mediaRootPath:String
		// 		An optional string to use in front of all images.
		// 		It is rare you would need to use this. It's being used
		// 		for when playlists change locations between development and
		// 		the production.
		//
		mediaRootPath:'',

		//	media: Array|String
		//		Either an array of image paths, or a path to a jsonp file with
		//		a more extensive array of objects.
		media:'',

		// minDragPercent: Float
		// 		The distance the user must drag the image to qualify as far enough to
		// 		move it the rest of the way. Anything less will be "canceled" and
		// 		moved back to it's original position.
		minDragPercent: isMobile ? .4 : .2,

		postCreate: function(){

			log('JSON:', this.media);
			if(Array.isArray(this.media)){
				this.onData({image:this.media});
			}else if(typeof this.media == 'string'){
				var ext = string.urlToObj(this.media).ext;
				if(ext == 'js'){
					window.bvCallback = this.onData.bind(this);
					io.get({url:this.media, callbackParamName:'bvCallback', handleAs: "json"});
				}else if(ext == 'json'){
					// XHR - TODO
				}else{
					// single file
					this.onData({image:[this.media]});
				}
			}

		},

		onData: function(data){
			log('data', data);

			var root = this.mediaRootPath || '';
			if(data.root) root += data.root;
			this.index = 0;
			this.images = [];
			this.totalLoaded = 0;
			var sz = dom.box(this.domNode);
			data.image.forEach(function(img, i){
				if(typeof img == 'string'){
					img = {src:root + img}
				}else{
					if(img.src) img.src = root + img.src;
					if(img.thumbnail) img.thumbnail = root + img.thumbnail;
				}
				img.index = i;
				img.boxWidth = sz.w;
				img.boxHeight = sz.h;
				var w = new Photo(img);
				this.addChild(w);
				this.images.push(w);
				on(w, 'onImageLoad', this, 'onImageLoad' );
			}, this);
			//log('this.images', this.images);
			this._resize();
		},

		onImageLoad: function(){
			this.totalLoaded++;
			if(this.totalLoaded == this.images.length){
				this.setup();
			}
		},

		setup: function(){
			if(!this.getParent()){
				// if has parent, let it do the detecting
				if(isMobile){
					on(common, 'updateOrient', this, '_resize');
				}else{
					connect.subscribe('/dojox/mobile/screenSize/tablet', this, '_resize');
					on(window, 'resize', this, '_resize');
				}
			}
			this.setCurrentImages();
			log('mouse.track')
			mouse.track(this.domNode, this, 'onMouse');
			log('mouse.track done')
		},

		setCurrentImages: function(){
			//log('setCurrentImages', this.index);
			this.images.forEach(function(w){ w.hide(); });
			this.currentImages = [];
			if(this.index > 0){
				this.images[this.index-1].moveTo(-this.width);
				this.currentImages.push(this.images[this.index-1]);
				this.images[this.index-1].show();
			}

			this.images[this.index].moveTo(0);
			this.currentImages.push(this.images[this.index]);
			this.images[this.index].show();

			if(this.index < this.images.length-1){
				this.images[this.index+1].moveTo(this.width);
				this.currentImages.push(this.images[this.index+1]);
				this.images[this.index+1].show();
			}


		},

		onMouse: function(evt){
			//log('onMouse', evt);
			on.stopEvent(evt);
			var m = evt.mouse
			//log(m.type, m.last.x, m);
			if(m.move){
				if(this.moving){
					this.moving = 0;
					this.setCurrentImages();
					this.finishHandler.remove();
				}
				this.dragging = 1;
				this.drag(m.last.x);
			}else if(m.up && this.dragging){

				this.dragging = 0;
				var dir = m.dist.x < 0 ? -1 : 1;
				var legal = (this.index + -dir < this.images.length && this.index + -dir >= 0);

				//log('legal', legal, this.index + -dir, this.index, -dir)

				if(legal && Math.abs(m.dist.x) >= this.minDragPercent * this.width){
					//log('MOVED!')

					this.index += -dir;
					this.moving = 1;
					this.finishHandler = on(this.images[this.index], 'onAniDone', this, function(){
						this.moving = 0;
						this.setCurrentImages();
						this.finishHandler.remove();
					});


					this.currentImages.forEach(function(w){
						w.slideTo(w.orgx + this.width * dir);
					}, this);
				}else{
					//log('CANCELED!')
					this.currentImages.forEach(function(w){
						w.slideTo(w.orgx);
					}, this);
				}


			}
		},

		drag: function(x){
			this.currentImages.forEach(function(w){
				w.drag(x);
			});
		},


		_resize: function(){
			this.resize(dom.box(this.domNode));

		},

		resize: function(box){
			if(!box) return;
			if(!this.images){
				timer(this, function(){
					this.resize(box);
				}, 100);
				return;
			}
			this.width = box.w;
			this.height = box.h;
			this.images.forEach(function(w){
				//w.show();
				w.onSize(box);
			});
			this.currentImages && this.setCurrentImages();
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!this.showing) return;
			this.showing = 0;
			dom.hide(this.domNode);
		},

		onClick: function(){
			// overwrite or connect to me!
		}
	});

});
