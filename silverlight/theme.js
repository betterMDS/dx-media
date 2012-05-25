define([

], function(){

	var
		norm = '#cccccc',
		over = '#eeeeee',
		down = '#aeaeae',
		light = '#999999',
		medium = '#666666',
		dark = '#494949';

	var theme = {
		gap:5,
		norm:norm,
		over:over,
		down:down,
		light:light,
		medium:medium,
		dark:dark,

		controls:{
			width:1,
			height:40,
			radius:5,
			gap:5
		},
		button:{
			width:30,
			height:30,
			radius:3
		},
		font:{
			family:'sans-serif',
			size:'12px'
		},
		grad:{
			type:"linear",
			x1:0,y1:0,x2:0,y2:40,
			colors:[
				{ offset: 0,   color: norm },
				{ offset: 1,   color: dark }
			]
		},
		line:{
			width:1,
			color:medium
		},
		getGrad: function(h, top, bot){
			top = top || norm;
			bot = bot || dark;
			return {
				type:"linear",
				x1:0,y1:0,x2:0,y2:h,
				colors:[
					{ offset: 0,   color: top },
					{ offset: 1,   color: bot }
				]
			};
		},
		play:{
			width:15,
			height:15
		},
		fullscreen:{
			width:20,
			height:12
		},
		volume: {
			width:30,
			height:15
		},
		progress: {
			width:1, //if 0, set later based on other ui sizes
			height:20
		},
		scrub:{
			radius:6
		},
		get: function(name, line, grad){
			var o = this[name];
			if(line) o.line = this.line;
			if(grad) o.grad = this.getGrad(o.height);
			return o;
		}
	};

	return theme;
});
