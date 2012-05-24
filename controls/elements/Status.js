define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer",
	"./Time",
	"./Duration"
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, dom, lang, logger){

	var log = logger('STS', 1);

	return declare('dx-media.controls.elements.Status', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString:'<div class="dxStatus"><div data-dojo-type="dx-media.controls.elements.Time"></div> / <div data-dojo-type="dx-media.controls.elements.Duration"></div></div>',

		postCreate: function(){

		}
	});

});
