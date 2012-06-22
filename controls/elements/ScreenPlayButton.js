define([
	"dojo/_base/declare",
	"dx-alias/Widget",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, Widget, dom, on, logger, timer){
	//
	//	summary:
	//		A big play button that shows over the video screen to give the user
	//		an obvious cue that the video is to be played.
	//
	var log = logger('SPB', 0);

	return declare('dx-media.controls.elements.ScreenPlayButton', [Widget], {

		templateString:'<div class="dxScreenPlayButton dxMuted"></div>',

		postCreate: function(){
			on(this.domNode, 'click', this, 'onClick');
		},

		onClick: function(){
			log('CLICK')
			// stub
		}
	});

});
