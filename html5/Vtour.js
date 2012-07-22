define([
	'dojo/_base/declare',
	'dx-alias/has',
	'dx-alias/Widget',
	'./VtourCanvas',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/mouse',
	'dx-alias/log'

], function(declare, has, Widget, VtourCanvas, dom, on, mouse, logger){

	var log = logger('VT', 1);

	var adjMouseX = 1;
	var showing = 1;

	return declare('dx-media.html5.Vtour', [Widget], {
		templateString:'<div class="dxVtour"><div data-dojo-attach-point="listNode" class=""></div></div>',
		width:0,
		height:0,
		src:"",
		index:-1,
		autoplay:0,
		loaded:0,
		showing:1,

		postCreate: function(){

			this.vtours = {};

			if(has('ios') || has('android')) adjMouseX = -1;

			var box;
			var getBox = function(node){
				if(!box) box = dom.box(node.parentNode);
				return box;
			}
			if(!this.width) this.width = getBox(this.domNode).w;
			if(!this.height) this.height = getBox(this.domNode).h;

			dom.style(this.domNode, {width:'100%', height:'100%'});

			this.showing && this.load(this.src);

			var scroller = this.on(this.domNode, "scroll", this, "onScroll");

			mouse.track(this.domNode, this, 'onMouse');
		},

		resize: function(box){
			//console.log('VTOUR RESIZE' , box, this.domNode)
			if(!box) return;
			// actually should be all, not just this one
			dom.style(this.domNode, {
				width: box.w + 'px',
				height: box.h + 'px'
			});
			this.current.onSize(box);
		},

		onMouse: function(evt){
			//log('onMouse', evt);
			on.stopEvent(evt);
			var m = evt.mouse
			//console.log(m.type, m.last.x, m.last.y);
			if(m.move){
				this.push(m.last.x * adjMouseX);
				this.tilt(m.last.y);
			}
			if(m.click) this.stop();
			if(m.zoom) this.zoomTo(m.scale);
		},

		onScroll: function(evt){
			//log('scroll evt:', evt.scroll.x, evt.scroll.y);
			on.stopEvent(evt);
			if(evt.scroll.y){
				this.zoom(evt.scroll.y * -.01);
			}else if(evt.scroll.x){
				this.move(evt.scroll.x * 2);
			}
		},

		play: function(){
			this.current.play();
		},

		stop: function(){
			this.current.stop();
		},

		zoom: function(amount){
			this.current.zoom(amount);
		},
		zoomTo: function(amount){
			this.current.zoomTo(amount);
		},

		move: function(amount){
			this.current.move(amount);
		},

		tilt: function(amount){
			// move up or down
			amount && this.current.tilt(-amount);
		},

		push: function(amount){
			this.current.push(amount);
		},

		load: function(src){
			try{
			var _toggle = 0;
			if(!src || (this.current && this.current.src == src)) return;
			if(this.current) this.current.hide();

			if(this.vtours[src]){
				this.current = this.vtours[src];
				this.current.show();
				return;
			}
			this.index++;
			this.current = new VtourCanvas({
				src:src,
				autoplay:this.autoplay,
				width:this.width,
				height:this.height,
				index:this.index
			});
			this.listNode.appendChild(this.current.domNode);
			this.vtours[src] = this.current;
			}catch(e){console.error('CAUGHT', e)}
		},

		show: function(){
			log('show')
			if(showing) return;
			showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			log('hide')
			if(!showing) return;
			showing = 0;
			this.current.stop();
			dom.hide(this.domNode);
		}
	});

});
