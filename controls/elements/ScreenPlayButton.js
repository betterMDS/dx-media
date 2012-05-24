define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, dom, on, logger, timer){
	//
	//	summary:
	//		A big play button that shows over the video screen to give the user
	//		an obvious cue that the video is to be played.
	//
	var log = logger('SPB', 1);

	return declare('dx-media.controls.elements.ScreenPlayButton', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div data-dojo-attach-point="buttonNode" class="dxScreenPlayButton"></div>',

		postCreate: function(){
			on(this.domNode, 'click', this, 'onClick');
		},

		onClick: function(){
			log('CLICK')
			// stub
		}
	});

});
