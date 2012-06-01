define([
	"dojo/_base/declare",
	"./_Base",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Base, dom, lang, logger){

	var log = logger('DUR', 1);

	return declare('dx-media.controls.elements.Duration', [_Base], {

		templateString:'<div class="dxDuration">0:00</div>',

		remaining: true,

		postCreate: function(){
			if(!this.remaining) this.onFrame = function(){}
			this.inherited(arguments);
		},

		onMeta: function(meta){
			//log(meta);
			this.domNode.innerHTML = lang.timeCode(meta.duration, 'mm_ss');
		},

		update: function(meta){
			//log('frame', meta);
			this.domNode.innerHTML = lang.timeCode(meta.remaining, 'mm_ss');
		}

	});

});
