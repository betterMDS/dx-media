define([
	"dojo/_base/declare",
	"./_Slider",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Slider, dom, lang, logger){

	var log = logger('VSL', 0);

	return declare('dx-media.controls.elements.VolumeSlider', [_Slider], {

		postCreate: function(){
			this.inherited(arguments);
			dom.css(this.domNode, 'bvVolume');
		}
	});
});
