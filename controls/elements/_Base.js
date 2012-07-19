define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin"
], function(declare, _WidgetBase, _TemplatedMixin){

	return declare('dx-media.controls.elements._Base', [_WidgetBase, _TemplatedMixin], {

		startup: function(){
			var p = this.getParent();
			//console.log('parent:', p, this.declaredClass, this.domNode, this.domNode.parentNode);
			if(p){
				if(this.align == 'right'){
					p.addChildRight(this);
				}else{
					p.addChildLeft(this);
				}
			}
		}

	});
});
