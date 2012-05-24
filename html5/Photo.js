define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"./Image",
	"dx-alias/dom",
	"dx-timer/timer",
	"dx-alias/lang",
	"dx-alias/on",
	"dx-alias/log"
], function(declare, _WidgetBase, _TemplatedMixin, Img, dom, timer, lang, on, logger){

	var log = logger('PHO', 0);

	return declare('dx-media.html5.Photo', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxPhoto"></div>',
		src:'',
		thumbnail:'',
		caption:'',
		index:-1,
		boxWidth:0,
		boxHeight:0,
		widthPercent:'90%',
		heightPercent:'90%',
		x:0,
		orgx:0,
		showing:1,
		transSpeed:400,

		postCreate: function(){

			this.trans = 'left '+this.transSpeed+'ms ease';

			// YIKES!
			// this.onImageLoad.bind(this) breaks the ability to connect to that method
			var cb = lang.bind(this, 'onImageLoad');

			this.img = new Img({src:this.src, onload:cb, showing:0});
			this.domNode.appendChild(this.img.domNode);
			on(this.domNode, 'webkitTransitionEnd', this, 'onAniDone');
			on(this.domNode, 'transitionend', this, 'onAniDone');
			on(this.domNode, 'MozTransitionend', this, 'onAniDone');
		},

		drag: function(x){
			this.x += x;
			this.stop();
			dom.style(this.domNode, 'left', this.x+'px');

		},

		slideTo: function(x){
			this.x = this.orgx = x;
			this.animating = 1;
			dom.style(this.domNode, {
				webkitTransition:this.trans,
				MozTransition:this.trans
			});
			timer(this, function(){
				dom.style(this.domNode, 'left', this.x+'px');
			}, 30);
		},

		moveTo: function(x){
			this.x = this.orgx = x;
			dom.style(this.domNode, 'left', this.x+'px');
		},

		stop: function(){
			if(!this.animating) return;
			this.animating = 0;
			dom.style(this.domNode, {
				webkitTransition:'',
				MozTransition:''
			});
		},

		onAniDone: function(){
			this.stop();
		},

		onImageLoad: function(sz){
			log('onImageLoad', sz.w, sz.h)
			this.imgWidth = sz.w;
			this.imgHeight = sz.h;
			this.imageAspect = this.imgWidth / this.imgHeight;
		},

		onSize: function(sz){
			if(!sz.w || !sz.h) return;
			if(!this.showing){
				this._size = sz;
			}
			if(!this.imageAspect){
				timer(this, function(){
					this.onSize(sz);
				}, 100);
				return;
			}
			log('onSize:', sz)
			var wasShowing = this.showing;
			this.show();
			this.img.show();
			this.img.fit(sz);
			if(!wasShowing) this.hide();
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
			if(this._size){
				this.onSize(this._size);
				this._size = null;
			}
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
