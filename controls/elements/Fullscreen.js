define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/has",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, has, dom, lang, logger){

	//var log = logger('PLY', 1);

	return declare('dx-media.controls.elements.Fullscreen', [_Button], {

		innerTemplate: '<div class="dxIconFx ${iconClass}" data-dojo-attach-point="iconNode" data-dojo-attach-events="onClick:onClick"><div class="normal"></div><div class="hover"></div><div class="active"></div></div>',
		buttonClass:'dxFullscreenBtn',
		iconClass:'dxFullscreenIcon',

		onClick: function(){

		}
	});
});
