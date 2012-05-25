define([
	'dojo',
	'../util/has',
	'dojo/_base/declare',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/log',
	'dx-timer/timer'
], function(dojo, has, declare, on, lang, logger, timer){

	var log = logger('SL', 1);

	window.__dojoSilverlightError = function(sender, err){
		var t = "Silverlight Error:\n" +
			"Code: " + err.ErrorCode + "\n" +
			"Type: " + err.ErrorType + "\n" +
			"Message: " + err.ErrorMessage + "\n";
		switch(err.ErrorType){
			case "ParserError":
				t += "XamlFile: " + err.xamlFile + "\n" +
					"Line: " + err.lineNumber + "\n" +
					"Position: " + err.charPosition + "\n";
				break;
			case "RuntimeError":
				t += "MethodName: " + err.methodName + "\n";
				if(err.lineNumber != 0){
					t +=
						"Line: " + err.lineNumber + "\n" +
						"Position: " + err.charPosition + "\n";
				}
				break;
		}

		console.error(t);

	};

	var slEvents = {
		'over':'MouseEnter',
		'out':'MouseLeave',
		'click':'MouseLeftButtonUp',
		'down':'MouseLeftButtonDown',
		'up':'MouseLeftButtonUp',
		'move':'MouseMove'
	}

	var Canvas = declare(null, {
		width:320,
		height:240,

		background:'#ffffff',
		windowless:true,
		enableFrameRateCounter:false,

		constructor: function(props, node){
			//b.mix(this, props);
			this.node = typeof node == 'string' ? document.getElementById(node) : node;
			console.log('SL CANVAS NODE', this.node)

			var onLoadName = lang.uid('sl_load'), self = this;
			window[onLoadName] = function(sender){
				setTimeout(function(){
					self.container = sender;
					self.onLoad(sender);
				}, 100)
			};
			var scriptId = lang.uid('SL');
			var name = lang.uid('SL');
			var embedId = lang.uid('SL');
			var sourceId = scriptId;
			var width = this.width + 'px';
			var height = this.height + 'px';

			var str =	/*'<div style="left:-200px;position:absolute;">' +*/
						'<script type="text/xaml" id="'+scriptId+'">' +
						'<?xml version="1.0"?><Canvas xmlns="http://schemas.microsoft.com/client/2007" Name="' + name + '"/>' +
						'</script>'

			if(has('ie')){
				str += "<object type='application/x-silverlight' data='data:application/x-silverlight,' id='" +
						embedId + "' width='" + width + "' height='" + height + "'>" +
						"<param name='background' value='"+this.background+"' />" +
						"<param name='source' value='#" + sourceId + "' />" +
						"<param name='windowless' value='"+this.windowless+"' />" +
						"<param name='maxFramerate' value='60' />" +
						"<param name='EnableFrameRateCounter' value='"+this.enableFrameRateCounter+"' />" +
						"<param name='onLoad' value='" + onLoadName + "' />" +
						"<param name='onError' value='__dojoSilverlightError' />" +
						"</object>"
			}else{
				str += "<embed type='application/x-silverlight' id='" + embedId + "'" +
						" width='" + width + "' height='" + height +"' background='"+this.background+"'" +
						" source='#" + sourceId + "'" +
						" windowless='"+this.windowless+"'" +
						" maxFramerate='60'" +
						" onLoad='" + onLoadName + "'" +
						" EnableFrameRateCounter='" + this.enableFrameRateCounter + "'" +
						" onError='__dojoSilverlightError'" +
						" />"; //<iframe style='visibility:hidden;height:0;width:0'/>
			}
			//str += '</div>';

			this.node.innerHTML = str;
		},

		add: function(xamlShape){
			this.container.children.add(xamlShape);
		},

		onLoad: function(sender){
			log('loaded', sender);
			this.canvas = sender;

			//var node = new Rect({height:50, radius:10}, this.canvas);
			//new Ellipse({width:30, x:5, y:5}, node);
		}
	})

	var Container = declare(null, {
		width:1000,
		height:1000,
		type:'Canvas',
		constructor: function(props, parent){
			log('make Group', parent);
			this.props = props;
			this.mix(this.props);
			this.parent = parent;
			this.container = (parent.getHost ? parent.getHost() : parent.container.getHost()).content.createFromXaml("<Canvas/>");
			(parent.children ? parent.children : parent).add(this.container);
			this.ctx = this.container.getHost().content;
			log('this.container', this.container);

		},
		add: function(xamlShape){
			this.container.children.add(xamlShape);
			return this;
		},
		show: function(){
			this.container.Visibility = "Visible";
			return this;
		},
		hide: function(){
			this.container.Visibility = "Collapsed";
			return this;
		},

		mix: function(props){
			if(!props) return;
			for(var nm in props){
				if(this[nm] !== undefined){
					if((nm == 'line' || nm == 'font') && !!props[nm] ){
						//console.log('prop:', nm, props[nm], props[nm] == 0, props[nm] === 0, !!props[nm])
						for(var n in props[nm]){
							this[nm][n] = props[nm][n];
						}
					}else{
						this[nm] = props[nm];
					}
				}
			}
		}
	});

	var Shape = declare(null, {
		x:20,
		y:20,
		id:'',
		nofill:false,
		nostroke:false,
		cursor:false,
		width:100,
		height:20,
		radius:0,
		grad:null,
		color:'#ff0000',
		line:{
			width:1,
			color:'#0000FF',
			opacity:1
		},
		opacity:1,
		type:'',
		constructor: function(props, parent){
			log('make shape', this.type);
			this.node = this.ctx.createFromXaml("<" + this.type + "/>");
			if(!this.id) this.id = lang.uid('SL');
			this.node.tag = this.id;
			if(this.cursor){
				this.container.Cursor = "Hand";
			}
			this.fill();
			this.stroke();
			this.size();
			this.position();
			this.container.children.add(this.node);
			log('node', this.node)
		},

		ani: function(obj, delay){
			for(var nm in obj) var prop = nm, to = obj[nm], from = this[prop];
			delay = delay || 0;

			if(this.aniHandle) this.aniHandle.remove();
			var dist = to-from;
			this.aniHandle = timer(this, function(e){
				this[prop] = from + dist * e.percentage;
				this.position();
				//console.log('ani', this.x, dist);
			}, {d:300, i:50, delay:delay});

		},

		size: function(obj){
			if(!this.supports('size')) return this;
			if(obj) this.mix(obj);
			this.node.width = this.width;
			this.node.height = this.height;
			return this;
		},

		position: function(obj, y){
			if(y !== undefined){
				this.x = obj; this.y = y;
			}else if(obj){
				//b.mix(this, obj);
			}
			//log('pos:', this.x, this.y)
			this.container['Canvas.Top'] = this.y;
			this.container['Canvas.Left'] = this.x;
			return this;
		},

		stroke: function(obj){
			if(!this.supports('stroke')) return this;
			if(obj) this.mix(obj);
			var scb = this.ctx.createFromXaml("<SolidColorBrush/>");
			scb.color = this.line.color;
			scb.opacity = this.line.opacity;
			this.node.strokeThickness = this.line.width;
			this.node.stroke = scb;
			return this;
		},

		fill: function(obj){
			if(!this.supports('fill')) return this;
			if(obj) this.mix(obj);
			if(this.radius){
				if(this.type == 'Rectangle'){
					this.node.RadiusX = this.node.RadiusY = this.radius;
				}	// Circle?
			}
			var scb;
			log('set style');
			if(this.grad){
				var g = this.grad;
				scb = this.ctx.createFromXaml("<LinearGradientBrush/>");
				scb.mappingMode = "Absolute";
				scb.startPoint = g.x1 + "," + g.y1;
				scb.endPoint = g.x2 + "," + g.y2;
				g.colors.forEach(function(c){
					var t = this.ctx.createFromXaml("<GradientStop/>");
					t.offset = c.offset;
					t.color = c.color;
					scb.gradientStops.add(t);
				}, this);
			}else{
				scb = this.ctx.createFromXaml("<SolidColorBrush/>");
				scb.color = this.color;
				scb.opacity = this.opacity;
			}

			this.node.fill = scb;
			return this;
		},
		on: function(name, ctx, method){
			var tokens = [], paused = 0;
			var f = lang.bind(ctx, method);
			var node = this.container;
			name = slEvents[name] || name;
			var fixEvent = lang.bind(this, function(e, m, type){
				var p = m.getPosition(this.node);
				f({
					x:p.x,
					y:p.y,
					id:e.tag,
					type:type || name
				}, m);
			});
			if(name == 'drag'){
				var isDown = 0, up, down, move, slup;
				up = on(document, 'mouseup', function(){
					if(!isDown) return;
					isDown = 0;
					up.pause();
					f({type:'up'});
				});
				up.pause();

				down = node.AddEventListener(slEvents['down'], function(e, m){
					isDown = 1;
					up.resume();
					fixEvent(e, m, 'down');
				});
				slup = node.AddEventListener(slEvents['up'], function(e, m){
					if(!isDown) return;
					isDown = 0;
					up.pause();
					fixEvent(e, m, 'up');
				});
				move = node.AddEventListener(slEvents['move'], function(e, m){
					if(!isDown) return;
					fixEvent(e, m, 'drag');
				})

			}else{
				tokens = [node.AddEventListener(name, fixEvent)];
			}

			return {
				// TODO
				remove: function(){
					tokens.forEach(function(tkn){
						node.RemoveEventListener(name, tkn);
					});
				}
			}
		},
		getSize: function(){
			if(this.type == 'TextBlock'){
				return {
					w:this.node.ActualWidth,
					h:this.node.ActualHeight
				};
			}else{
				return {
					w:this.node.Width,
					h:this.node.ActualHeight
				};
			}
		},
		supports: function(type){
			//console.log('Class:', this.getClass(), this.classes, this.type);
			switch(type){
				case 'fill': 	return !this.nofill && /Rectangle|Ellipse|Path/.test(this.type);
				case 'stroke': 	return !this.nostroke && !!this.line && /Rectangle|Ellipse|Path/.test(this.type);
				case 'size': 	return /Rectangle|Ellipse|Media/.test(this.type);
			}
			return true;
		}
	}, Container);

	var Media = declare(null, {
		type:'MediaElement',
		src:'',
		constructor: function(){
			if(this.src) this.node.Source = this.src;
			this.node.Stretch = true;
		}
	}, Shape);

	var Path = declare(null, {
		type:'Path',
		data:null, // String
		constructor: function(props, parent){
			if(this.data) this.draw();
		},
		draw: function(obj){
			if(obj) this.mix(obj);

			var str = '';
			this.data.forEach(function(p){
				if(p.t && p.t.toLowerCase() == 'z'){
					str += ' '+p.t;
				}else{
					str += p.t + ' ' + p.x + ',' + p.y;
				}
			}, this);

			this.node.Data = str;
		}
	}, Shape);

	var Text = declare(null, {
		type:'TextBlock',
		text:'',
		fontFamily:'Arial',
		fontSize:12,
		fontStyle:'Normal',
		fontWeight:'Normal',
		color:'#000000',
		constructor: function(props, parent){
			//FontFamily, FontSize, FontStretch, FontStyle, FontWeight, Foreground
			this.setText();
		},
		setText: function(obj){
			this.mix(obj);
			this.node.Text = this.text;
			this.node.FontSize = this.fontSize;
			this.node.FontStyle = this.fontStyle;
			this.node.FontWeight = this.fontWeight;
			this.node.Foreground = this.color;

		}
	}, Shape);

	var Rect = declare(null, {
		type:'Rectangle',
		constructor: function(props, parent){
			log('make Rect');
		}
	}, Shape);

	var Ellipse = declare(null, {
		type:'Ellipse',
		constructor: function(props, parent){
			log('make Ellipse');
		}
	}, Shape);

	log('base loaded.');

	return {
		Canvas:Canvas,
		Container:Container,
		Shape:Shape,
		Path:Path,
		Rect:Rect,
		Ellipse:Ellipse,
		Media:Media,
		Text:Text
	};
});
