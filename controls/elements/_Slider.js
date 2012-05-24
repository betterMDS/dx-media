define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/mouse",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, dom, on, mouse, logger){

	var log = logger('_SL', 1);

	return declare('dx-media.controls.elements._Slider', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxSlider">'+
							'<div class="dxSliderConstrain" data-dojo-attach-point="constrain"></div>' +
							'<div class="dxSliderProgress" data-dojo-attach-point="progress"></div>' +
							'<div class="dxSliderProgressA" data-dojo-attach-point="endA"></div>' +
							'<div class="dxSliderProgressB" data-dojo-attach-point="endB"></div>' +
							'<div class="dxSliderHandle" data-dojo-attach-point="handle"></div>' +
						'</div>',

		width:0,
		height:0,
		vertical:false,

		postCreate: function(){
			if(this.width) dom.style(this.domNode, 'width', this.width+'px');
			dom.selectable(this.domNode, false);
			mouse.track(this.domNode, this, 'onMouse');

		},


		update: function(p){
			p = p>1 ? 1 : p<0 ? 0 : p;
			this.handle.style.left = (p*100).toFixed(1)+"%";
			this.progress.style.width = (p*100).toFixed(1)+"%";
		},

		constrain: function(p){
			//console.log("downloaded", p)
			p = Math.max(Math.min(p, 1), 0);

			this.constrain.style.width = (p*100).toFixed(1)+"%";
			if(p == 1) dom.css(this.domNode, "maxed");
		},

		onMouse: function(e){
			on.stopEvent(e);
			log(e.mouse);
			this.update(e.mouse.px);
		}
	});

});
