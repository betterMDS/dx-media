define([
	"dojo/_base/declare",
	"dojo/uacss",
	"dijit/_Container",
	"dx-alias/Widget",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, uacss, _Container, Widget, dom, on, lang, logger, timer){
	//	summary:
	//		Media player container widget for controls (play button, etc).
	//
	var log = logger('CON', 0);

	return declare('dx-media.controls.Controlbar', [Widget], {

		templateStyle:'dxStyleIcon',
		baseClass:'dxControlbar',

		templateString:'<div class="${baseClass} ${templateStyle}"><div class="left" data-dojo-attach-point="containerNode"></div><div class="right" data-dojo-attach-point="containerRight"></div></div>',

		constructor: function(){
			this.elements = [];
		},

		_lftMargin:10,
		_rgtMargin:10,
		gap:5,

		postCreate: function(){
			log('postCreate')
		},

		startup: function(){
			log('startup');
		},

		onClick: function(/*Dijit*/widget){
			//	summary:
			//		Fires when one of the control bar buttons has been clicked
			//log('clicked:', widget.name);
		},

		getElements: function(){
			return this.elements;
		},

		addChildLeft: function(w){
			this.register(w);
			this._lftMargin += dom.box(w.domNode).w + this.gap;
			this.setFlex();
			//log('addChildLeft')
		},

		addChildRight: function(w){
			this.removeChild(w);
			dom.place(w.domNode, this.containerRight);
			this.register(w);
			this._rgtMargin += dom.box(w.domNode).w + this.gap;
			this.setFlex();
		},

		addFlexSpace: function(w){
			this.removeChild(w);
			dom.place(w.domNode, this.domNode);
			this.flexSpace = w;
			this.setFlex();
		},

		setFlex: function(){
			this.flexSpace && this.flexSpace.setMargins(this._lftMargin, this._rgtMargin);
		},

		register: function(w){
			w.name = lang.last(w.declaredClass.split('.'));
			log('register', w.name);
			var widget = w; // scoped
			this.elements.push(w);
			on(w, 'onClick', this, function(){
				//log('click', widget.name);
				this.onClick(widget);
			});
		}
	});

});
