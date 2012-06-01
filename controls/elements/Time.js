define([
	"dojo/_base/declare",
	"./_Base",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Base, dom, lang, logger){

	//var log = logger('STS', 1);

	return declare('dx-media.controls.elements.Time', [_Base], {

		templateString:'<div class="dxTime">0:00</div>',

		update: function(meta){
			this.domNode.innerHTML = lang.timeCode(meta.time, 'mm_ss');
		}
	});

});
