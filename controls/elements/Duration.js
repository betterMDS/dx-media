define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, dom, lang, logger){

	//var log = logger('STS', 1);

	return declare('dx-media.controls.elements.Duration', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxDuration">0:00</div>',

		postCreate: function(){

		}
	});

});
