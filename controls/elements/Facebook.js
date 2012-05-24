define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('FBK', 1);

	return declare('dx-media.controls.elements.Facebook', [_Button], {

		align:'right',

		templateString:'<a href="${facebookUrl}" target="_BLANK" ><div class="dxIcon dxFacebookBtn" data-dojo-attach-event="onclick:onClick"></div></a>',
		align:'right',

		postMixInProperties: function(){
			var URL = 'http://www.facebook.com/sharer.php',
			PAGEURL = document.location.href,
			TITLE = document.title || "";
			this.facebookUrl = URL + "?u=" + escape(PAGEURL) + "&="+ escape(TITLE);
		}
	});

});
