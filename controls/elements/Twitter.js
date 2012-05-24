define([
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/string",
	"dx-alias/log"

], function(declare, _Button, dom, string, logger){

	var log = logger('TWI', 1);

	return declare('dx-media.controls.elements.Twitter', [_Button], {

		templateString:'<a href="${twitterUrl}" target="_BLANK" ><div class="dxIcon dxTwitterBtn" data-dojo-attach-event="onclick:onClick"></div></a>',
		align:'right',

		postMixInProperties: function(){
			var URL = 'http://twitter.com/home',
			TEXT = 'Look at this great video: ',
			TITLE = document.title || "";
			this.twitterUrl = URL + "?status="+string.urlEscape(TEXT+" "+TITLE+" - "+document.location.href);
		}

	});

});
