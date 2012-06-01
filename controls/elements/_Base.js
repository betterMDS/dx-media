define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin"
], function(declare, _WidgetBase, _TemplatedMixin){

	return declare('dx-media.controls.elements._Base', [_WidgetBase, _TemplatedMixin], {

		postCreate: function(){
			var p = this.getParent();
			//console.log('parent:', this.declaredClass, p);
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
