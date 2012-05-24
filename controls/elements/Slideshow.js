define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('PHO', 1);

	return declare('dx-media.controls.elements.Slideshow', [_Button], {

		buttonClass:'dxIcon dxSlideshowBtn',
		radioGroup:'playerViews'
	});

});
