define([
	'dojo/_base/declare',
	'./Swf',
	'dx-alias/topic'
], function(declare, Swf, topic){

	var flashVideoCount = 0;

	var fVideos = [];
	var fPaths = [];
	window.dxMediaFlashVideo = {
		current:'',
		setCurrent: function(vid){
			this.current = vid;
			fVideos.push(vid);
			//console.warn('SET TO CURRENT:', this.current);
		},
		removeCurrent: function(path){
			fVideos.pop();
			if(fVideos.length) this.setCurrent(fVideos[fVideos.length-1]);
		},
		version: function(){
			return getVersion();
		},
		onMeta: function(meta){
			console.warn('FLASH ON META')
			meta.isAd = this.current.isAd;
			topic.pub("/swf/on/meta", meta);
		},
		onFrame: function(obj){
			// used in onMeta
			//console.log("time:", obj)
			//b.pub("/video/on/frame", obj);
		},
		onClick: function(){
			console.warn('SWF PUB CLICK');
			topic.pub("/video/on/click", this.current.meta);
		},
		onStatus: function(obj){
			console.log("flash.video_status:", obj.channel);
			if(obj.channel){
				switch(obj.channel){
					case "/swf/on/error":
						console.error("Video Error:", obj)
						topic.pub("/video/error", {
							src:obj.src
						});
						break;
					case "/swf/on/download":
						obj.value.p = obj.value.percent;
						topic.pub(obj.channel, obj.value);
						break;
					case "/swf/on/fullscreen":
						obj = {isFullscreen:obj.state=="fullScreen"};
						topic.pub("/video/on/fullscreen", obj);
						break;
					default:
						topic.pub(obj.channel, obj);
				}
			}
		}
	};

	return declare('dx-media.flash.Video', [Swf], {

		constructor: function(options){

			options.src = dojo.moduleUrl('dx-media', 'resources/video.swf');
			options.loader = true;
			options.videoRef = 'flashVideo' + (flashVideoCount++);
			options.autoplay = true;
			//options.standalone = true;
			this.inherited(arguments);
		}
	});
});
