define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, dom, lang, logger){

	var log = logger('FXS', 1);

	return declare('dx-media.controls.elements.FlexSpace', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxFlexSpace"><div class="" data-dojo-attach-point="containerNode"></div></div>',

		postCreate: function(){
			this.getParent().addFlexSpace(this);
		},
		setMargins: function(lft, rgt){
			log('setMargins', lft, rgt)
			dom.style(this.domNode, {
				marginLeft:lft+'px',
				marginRight:rgt+'px'
			});
		}
	});

});
