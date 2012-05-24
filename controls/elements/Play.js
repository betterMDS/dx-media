define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('PLY', 1);

	return declare('dx-media.controls.elements.Play', [_Button], {

		innerTemplate: '<div class="dxIconFx ${iconClass}" data-dojo-attach-point="iconNode" data-dojo-attach-events="onClick:onClick"><div class="normal"></div><div class="hover"></div><div class="active"></div></div>',
		buttonClass:'dxPlayBtn',
		iconClass:'dxPlayIcon',
		pauseClass:'dxPauseIcon',
		playing:false, // temp?

		postCreate: function(){
			this.inherited(arguments);
		},

		showPlay: function(){
			dom.css.replace(this.iconNode, this.iconClass, this.pauseClass);
		},

		showPause: function(){
			dom.css.replace(this.iconNode, this.pauseClass, this.iconClass);
		},

		onClick: function(){
			console.log('click');

			if(this.playing){
				this.playing = false;
				this.showPlay();
			}else{
				this.playing = true;
				this.showPause();
			}
		}
	});
});
