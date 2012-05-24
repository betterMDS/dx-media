define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, _Container, dom, on, lang, logger, timer){

	var log = logger('CON', 0);

	return declare('dx-media.controls.elements.Controls', [_WidgetBase, _TemplatedMixin, _Container], {

		templateStyle:'dxStyleIcon',

		templateString:'<div class="dxPlayerMobileControls ${templateStyle}"><div class="left" data-dojo-attach-point="containerNode"></div><div class="right" data-dojo-attach-point="containerRight"></div></div>',

		postMixInProperties: function(){

		},

		postCreate: function(){
			on(this.domNode, 'click', function(){
				log('clicked control bar')
			})
			on(document, 'click', function(){
				log('clicked doc')
			})
		},

		onClick: function(w){
			//
		},

		addChildLeft: function(w){
			this.register(w);
		},

		addChildRight: function(w){
			this.removeChild(w);
			dom.place(w.domNode, this.containerRight);
			this.register(w);
		},

		register: function(w){
			w.name = lang.last(w.declaredClass.split('.'));
			var widget = w;
			on(w, 'onClick', this, function(){
				//log('click', widget.name);
				this.onClick(widget);
			});
		}
	});

});
