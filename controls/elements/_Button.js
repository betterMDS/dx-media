define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/string",
	"dx-alias/topic",
	"dx-alias/dom",
	"dx-alias/log"
], function(declare, _WidgetBase, _TemplatedMixin, string, topic, dom, logger){

	var log = logger('_BT', 1);

	var _groups = {};
	var _widgets = {};
	var addRadio = function(w){
		if(!_groups[w.radioGroup]) _groups[w.radioGroup] = {};
		var name = string.last(w.declaredClass);
		_groups[w.radioGroup][name] = w;
		_widgets[name] = w;
	}
	topic.sub('/dx/button/on/select', function(w){
		if(!_groups) return;
		var g = _groups[w.radioGroup];
		for(var nm in g) g[nm].select(g[nm].id == w.id);
	});


	return declare('dx-media.controls.elements._Button', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxButton ${buttonClass}" data-dojo-attach-event="onclick:onClick">${innerTemplate}</div>',
		innerTemplate:'',
		buttonClass:'',		// set by child class
		templateStyle:'', 	// retrieved from Controls
		radioGroup:'',

		postMixInProperties: function(){
			this.innerTemplate = this.innerTemplate.replace('${iconClass}', this.iconClass);
			this.templateString = this.templateString.replace('${innerTemplate}', this.innerTemplate);
		},



		postCreate: function(){
			var p = this.getParent();
			this.templateStyle = p.templateStyle;

			if(this.align == 'right'){
				p.addChildRight(this);
			}else{
				p.addChildLeft(this);
			}

			if(this.radioGroup){
				addRadio(this);
			}
		},

		select: function(/*Boolean?*/selected){
			if(selected === undefined) selected = true;
			dom.css(this.domNode, 'dxSelected', selected);
		},

		onClick: function(){
			// overwrite or connect to me!
		}
	});

});
