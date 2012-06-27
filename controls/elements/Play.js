define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('PLY', 0);

	return declare('dx-media.controls.elements.Play', [_Button], {

		innerTemplate: '<div class="dxIconFx ${iconClass}" data-dojo-attach-point="iconNode" data-dojo-attach-event="click:_onClick"><div class="normal"></div><div class="hover"></div><div class="active"></div></div>',
		buttonClass:'dxPlayBtn',
		iconClass:'dxPlayIcon',
		pauseClass:'dxPauseIcon',
		playShowing:1,


		postCreate: function(){
			this.inherited(arguments);
		},

		showPlay: function(){
			dom.css.replace(this.iconNode, this.iconClass, this.pauseClass);
			this.playShowing = 1;
		},

		showPause: function(){
			dom.css.replace(this.iconNode, this.pauseClass, this.iconClass);
			this.playShowing = 0;
		},

		_onClick: function(){
			log('_onClick')
			if(this.playShowing){
				this.onClick('play');
				this.onPlay();
			}else{
				this.onClick('pause');
				this.onPause();
			}
		},

		onPlay: function(){
			log('onPlay');
		},

		onPause: function(){

		},

		onClick: function(/*String*/playOrPause){

		}
	});
});
