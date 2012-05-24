define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/fx",
	"dx-alias/log",
	"./Tooltip",
	"./VolumeSlider"

], function(declare, _Button, dom, lang, fx, logger, Tooltip, VolumeSlider){

	var log = logger('PLY', 1);

	return declare('dx-media.controls.elements.Volume', [_Button], {

		innerTemplate: '<div class="dxIconFx ${iconClass}" data-dojo-attach-point="iconNode" data-dojo-attach-events="onClick:onClick"><div class="normal"></div><div class="hover"></div><div class="active"></div></div>',
		buttonClass:'dxVolumeBtn',
		iconClass:'dxVolumeIcon',

		postCreate: function(){
			this.inherited(arguments);

			this.tooltip = new Tooltip({
				x:20,
				y:20,
				width:120,
				height:25,
				positionNode:this.domNode,
				child: VolumeSlider
			});

			var trans = fx.transistion(this.tooltip.domNode, 'fade', {hidden:1});
			fx.flyout(this.domNode, this.tooltip.domNode, {onShow:trans.show, onHide: trans.hide});
		},

		onClick: function(){
			console.log('click');


		}
	});
});
