define([
	'dojo/_base/declare',
	'dx-alias/Widget',
	'dx-alias/dom',
	'dx-timer/timer',
	'dx-alias/log'
], function(declare, Widget, dom, timer, logger){

	var log = logger('IMG', 0);

	return declare('dx-media.html5.Image', [Widget], {

		templateString:'<img />',
		width:0,
		height:0,
		nativeWidth:0,
		nativeHeight:0,
		lazy:false,
		className:"",
		style:null,
		id:"",
		center:false,
		ignoreNotFound:false,
		src:"",
		onload:null,
		onerror:null,
		node:null,
		type:"image", // or thumb
		isError:false,
		showing:1,
		loaded:0,
		hideAfterLoad:0,

		postCreate: function(){

			this.tempNode = dom('img', {
				style:{
					position:'absolute',
					left:'-2000px',
					top:'0px'
				},
				on:{
					error:this.onError.bind(this),
					load:this.onImageLoaded.bind(this)
				}
			}, document.body);
			if(this.className) dom.css(this.domNode, this.className);
			if(this.style) dom.style(this.domNode, this.style);
			if(!this.showing) this.hide();


			if(!this.lazy){
				this.tempNode.src = this.src;
			}else{
				this.placeholder = dom('div', {css:"dxThumbPlaceholder",
					style:{
						width:this.w+"px",
						height:this.h+"px"
					}}, this.domNode.parentNode);
			}
		},

		getActualSize: function(){
			return {
				w:this.nativeWidth,
				h:this.nativeHeight
			};
		},

		show: function(){
			this.showing = 1;
			log('show')
			dom.show(this.domNode);
		},

		hide: function(){
			this.showing = 0;
			log('hide')
			dom.hide(this.domNode);
		},

		fit: function(nodeOrObjectOrWidth, optionalHeight){
			// fits the image to either the width or height
			//
			log('fit, showing:', this.showing)
			var a1 = arguments[0], a2 = arguments[1], w1, h1, w2, h2, m, w = this.nativeWidth, h = this.nativeHeight;
			if(typeof a1 ==="object" && a1.tagName){
				var box = dom.box(a1);
				w1 = box.w;
				h1 = box.h;
			}else if(typeof a1 === "object"){
				w1 = a1.w;
				h1 = a1.h;
			}else{
				w1 = a1;
				h1 = a2;
			}

			var aspect = w1/w * h;


			this.boxAspect = w1 / h1;

			if(this.boxAspect == this.imageAspect){
				log('    boxAspect equal', w1);
				dom.style(this.domNode, {
					width:w1+'px',
					height:'auto'
				});
			}else if(this.boxAspect > this.imageAspect){
				log('    boxAspect height', h1);
				dom.style(this.domNode, {
					height:h1+'px',
					width:'auto'
				});
			}else{
				log('    boxAspect width', w1);
				dom.style(this.domNode, {
					width:w1+'px',
					height:'auto'
				});
			}



		},

		tries:2,
		onImageLoaded: function(){
			this.loaded = 1;
			if(!this.tempNode.width && this.tries-- > 0){
				timer( this, function(){
					//console.log(this.tries, "timed loaded image:", this.node.width, this.node.height);
					//dom.hide(this.domNode);//this.hide();
					this.onImageLoaded();
				}, 500);
				return;
			}
			this.nativeWidth = this.tempNode.width;
			this.nativeHeight = this.tempNode.height;

			log('onImageLoaded', this.nativeWidth, this.nativeHeight)
			this.imageAspect = this.nativeWidth / this.nativeHeight;

			//console.log("loaded image:", this.nativeWidth, this.nativeHeight, " / ", this.tries, " / ", this.src);

			if(this.width){
				this.domNode.width = this.width;
			}else{
				this.width = this.tempNode.width;
			}
			if(this.height){
				this.domNode.height = this.height;
			}else{
				this.height = this.tempNode.height;
			}
			if(this.center){
				dom.style(this.domNode, {
					marginLeft:-(this.height/this.nativeHeight*this.nativeWidth/2)+"px"
				});
			}

			this.domNode.src = this.src;
			dom.destroy(this.tempNode);

			if(this.onload){
				this.onload({
					img:this.domNode,
					w:this.nativeWidth,
					h:this.nativeHeight,
					error:this.isError
				});
			}
		},


		onError: function(err){
			if(this.isError || this.ignoreNotFound) return;
			console.warn("Image not found:", this.src, err)
			this.isError = true;
			this.domNode.src = this.notFound();
			this.onerror && this.onerror();
		},
		notFound: function(){
			console.log("not found:", this);
			return "";
			//var size = this.width + this.height;
			//return this.type=="thumb"||(size<400&&size>0)? b.config.thumbnotfound || b.dom.root+'assets/ThumbNotFound.jpg' : b.config.imagenotfound || b.dom.root+'assets/ImageNotFound.jpg';
		}

	});
});
