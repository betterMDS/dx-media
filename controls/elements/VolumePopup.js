define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('VP', 0);

	return declare('dx-media.controls.elements.VolumePopup', [_WidgetBase, _TemplatedMixin], {

		templateString: '<div class=""></div>',
		buttonClass:'dxVolumeBtn',
		iconClass:'dxVolumeIcon',

		postCreate: function(){
			this.inherited(arguments);
		},

		onClick: function(){
			console.log('click');
		}
	});
});
