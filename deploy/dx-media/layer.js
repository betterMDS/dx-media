//>>built
require({cache:{
'dx-media/image/Image':function(){
define("dx-media/image/Image", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/lang",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, lang, dom, on, timer){

	return declare('dx.media.image.Image', [_WidgetBase, _TemplatedMixin], {

		templateString:'<img />',
		width:60,
		height:0,
		nativeWidth:0,
		nativeHeight:0,
		lazy:false,
		className:"",
		style:null,
		id:"",
		center:false,
		ignoreNotFound:false,
		src:"",
		onload:null,
		onerror:null,
		node:null,
		type:"image", // or thumb
		loaded: false,
		isError:false,
		showing:1,
		loaded:0,
		hideAfterLoad:0,

		postCreate: function(){

			if(this.className) dom.css(this.domNode, this.className);
			if(this.style) dom.style(this.domNode, this.style);

			on.multi(this.domNode, {
				'error':'onError',
				'load':'onImageLoaded'
			}, this);

			if(!this.lazy){
				this.domNode.src = this.src;
				dom.hide(this.domNode);;//this.hide();
			}else{
				this.placeholder = dom.create('div', {className:"dxThumbPlaceholder"}, this.domNode.parentNode);
				 style(this.placeholder, {
					width:this.w+"px",
					height:this.h+"px"
				});
			}
		},

		getActualSize: function(){
			var wasShowing = 1;
			if(!this.showing){
				wasShowing = 0;
				dom.show(this.domNode);//this.show();
			}
			var sz = dom.box(this.domNode);
			if(!wasShowing) dom.hide(this.domNode);//this.hide();
			return sz;
		},

		show: function(){
			this.hideAfterLoad = 0;
			//if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			//console.log(' ------------ hide me', this.loaded, this.src)
			if(!this.loaded){
				this.hideAfterLoad = 1;
				//console.log(' ------------ hide me later.');
				//on.once(this, 'onFinishedLoading', this, 'hide');
				return;
			}
			//if(!this.showing) return;
			this.showing = 0;
			dom.hide(this.domNode);
		},

		fit: function(){
			var a1 = arguments[0], a2 = arguments[1], w1, h1, w2, h2, m, w = this.nativeWidth, h = this.nativeHeight;
			if(typeof a1 ==="object" && a1.tagName){
				var box = dom.box(a1);
				w1 = box.w;
				h1 = box.h;
			}else{
				w1 = a1;
				h1 = a2;
			}

			var aspect = w1/w * h;
			var block = dom.style(this.domNode, 'display') == 'block';

			if(aspect > h1){
				h2 = h1;
				w2 = w * (h / h1);
				if(block){
					m = (-h2/2)+'px 0 0 '+(-w2/2)+'px';
				}else{
					m = '0px auto';
				}
				console.log('height', h, h1, h2, ' w', w);

			}else if(aspect < h1){
				console.log('width');
				w2 = w1;
				h2 = h * (w1 / w);
				if(block){
					m = (-h2/2)+'px 0 0 '+(-w2/2)+'px';
				}else{
					m = (h1-h2)+'px auto';
				}
			}else{
				console.log('SAME');
				w2 = w1; h2 = h1;
				m = '0';
			}

			console.log(dom.style(this.domNode, {
				width:w2+'px',
				height:h2+'px',
				margin:m
			}));



		},

		tries:2,
		onImageLoaded: function(){
			this.loaded = 1;
			dom.show(this.domNode);//this.show(); // In IE - be sure to SHOW the damn image or you get dimensions of zero!!!
			if(!this.domNode.width && this.tries-- > 0){
				timer( this, function(){
					//console.log(this.tries, "timed loaded image:", this.node.width, this.node.height);
					dom.hide(this.domNode);//this.hide();
					this.onImageLoaded();
				}, 500);
				return;
			}
			this.nativeWidth = this.domNode.width;
			this.nativeHeight = this.domNode.height;
			//console.log("loaded image:", this.nativeWidth, this.nativeHeight, " / ", this.tries, " / ", this.src);

			if(this.w){
				this.domNode.width = this.width;
			}else{
				this.width = this.domNode.width;
			}
			if(this.h){
				this.domNode.height = this.height;
			}else{
				this.height = this.domNode.height;
			}
			if(this.center){
				dom.style(this.domNode, {
					marginLeft:-(this.height/this.nativeHeight*this.nativeWidth/2)+"px"
				});
			}

			dom.show(this.domNode);//this.show();

			timer(this, function(){ // IE definitely... needs a timeout.
				dom.show(this.domNode);//this.show(); // IE insists we do this twice.
				if(this.onload){
					this.onload({
						img:this.domNode,
						w:this.nativeWidth,
						h:this.nativeHeight,
						error:this.isError
					});
				}
				this.onFinishedLoading();
			}, 20);
		},

		onFinishedLoading: function(){
			// fired after load, after setup, and after the show/hide shenanigans
			if(this.hideAfterLoad) this.hide();
		},

		onError: function(err){
			if(this.isError || this.ignoreNotFound) return;
			console.warn("Image not found:", this.src, e)
			this.isError = true;
			this.domNode.src = this.notFound();
			this.onerror && this.onerror();
		},
		notFound: function(){
			console.log("not found:", this);
			return "";
			//var size = this.width + this.height;
			//return this.type=="thumb"||(size<400&&size>0)? b.config.thumbnotfound || b.dom.root+'assets/ThumbNotFound.jpg' : b.config.imagenotfound || b.dom.root+'assets/ImageNotFound.jpg';
		}

	});
});

},
'dx-alias/lang':function(){
define("dx-alias/lang", [
	'dojo/_base/lang'
], function(lang){

	var
		_uidMap = {},
		uid = function(str){
			str = str || "id";
			if(!_uidMap[str]) _uidMap[str] = 0;
			_uidMap[str]++;
			return str+"_"+_uidMap[str];

		};

	return {

		uid:uid,
		bind:lang.hitch,
		hitch:lang.hitch,

		last: function(array){
			return array[array.length -1];
		},

		minMax: function(num, n1, n2){
			var min, max;
			if(n1 > n2){
				min = n2; max = n1;
			}else{
				min = n1; max = n2;
			}

			if(num < min) return min;
			if(num > max) return max;
			return num;

			return Math.max(num, Math.min(num, max));
		}
	};

});

},
'dx-alias/dom':function(){
define("dx-alias/dom", [
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-prop",
	"dojo/on"
], function(domDom, domCon, domGeom, domClass, domStyle, domProp, on){

	var
		dom = function(tag, atts, node, place){
			var n, nm, attCss, attOn, attHtml, attStyle, attValue, attSelectable;

			if(atts){
				if(typeof(atts)=="string"){
					atts = {className:atts};

				}else{
					if(atts.on){
						attOn = atts.on;
						delete atts.on;
					}
					for(nm in atts){
						if(nm == "on"){
							attOn = atts[nm];
							delete atts[nm];
						}else if(nm == "css"){
							atts.className = atts[nm];
							delete atts[nm];
						}else if(nm == "html"){
							atts.innerHTML = atts[nm];
							delete atts[nm];
						}else if(nm == "style"){
							attStyle = atts[nm];
							delete atts[nm];
						}else if(nm == "value"){
							attValue = atts[nm];
							delete atts[nm];
						}else if(nm == "selectable"){
							attSelectable = atts[nm];
							delete atts[nm];
						}
					}
				}
			}

			n = domCon.create(tag, atts, node, place);
			if(attStyle) domStyle.set(n, attStyle);
			if(attSelectable) domDom.setSelectable(n, attSelectable);
			if(attValue) n.value = attValue; // need this?
			if(attOn){
				for(nm in attOn){
					on(n, nm, attOn[nm]);
				}
			}

			return n;
		};

	dom.center = function(){

	};

	dom.fit = function(node){
		var a1 = arguments[1], a2 = arguments[2], w1, h1, w2, h2, m, nodebox = dom.box(node), w = nodebox.w, h = nodebox.h;
		if(typeof a1 ==="object" && a1.tagName){
			var box = dom.box(a1);
			w1 = box.w;
			h1 = box.h;
		}else{
			w1 = a1;
			h1 = a2;
		}

		var aspect = w1/w * h;
		var block = dom.style(this.domNode, 'display') == 'block';

		if(aspect > h1){
			h2 = h1;
			w2 = w * (h / h1);
			if(block){
				m = (-h2/2)+'px 0 0 '+(-w2/2)+'px';
			}else{
				m = '0px auto';
			}
			console.log('height', h, h1, h2, ' w', w);

		}else if(aspect < h1){
			console.log('width');
			w2 = w1;
			h2 = h * (w1 / w);
			if(block){
				m = (-h2/2)+'px 0 0 '+(-w2/2)+'px';
			}else{
				m = (h1-h2)+'px auto';
			}
		}else{
			console.log('SAME');
			w2 = w1; h2 = h1;
			m = '0';
		}

		console.log(dom.style(node, {
			width:w2+'px',
			height:h2+'px',
			margin:m
		}));

	};

	dom.byTag = function(tag, node, returnFirstOnly){
		if(!tag) return null;
		if(node === true){
			returnFirstOnly = true;
			node = document.body;
		}else{
			node = dom.byId(node);
		}
		var list = node.getElementsByTagName(tag);
		if(returnFirstOnly) return list[0];
		return Array.prototype.slice.call(list);
		return list;
	};

	dom.show = function(node, opt){
		if(node && node instanceof Array){
			node.forEach(function(n){
				dom.show(n, opt);
			}, this);
			return;
		}
		if(opt===false){
			dom.hide(node); // allows for toggling
			return;
		}
		var display = typeof opt == 'string' ? opt : ''; // allows to reset to proper style, like inline-block
		node = dom.byId(node);
		node.style.display = display;
	};

	dom.hide = function(node){
		if(node && node instanceof Array){
			node.forEach(function(n){
				dom.hide(n);
			}, this);
			return;
		}
		node = dom.byId(node);
		node.style.display = 'none';
	};

	dom.box = function(node, options){
		// TODO: allow options to ask for margin, padding, border
		// TODO: optionally ask for position
		// See if there is a way to cache computedStyle for perf
		return domGeom.getContentBox(node);
	};

	dom.pos = function(node, includeScroll){
		return domGeom.position(node, includeScroll);
	};

	dom.css = function(node, className, conditional){
		if(conditional === false || conditional === 0) return domClass.remove(node, className);
		return domClass.add(node, className);
	};

	dom.css.remove = domClass.remove;
	dom.css.replace = domClass.replace;
	dom.css.toggle = domClass.toggle;

	dom.style = function(node, prop, value){
		if(value === undefined && typeof prop === 'string') return domStyle.get(node, prop);
		if(value === undefined) return domStyle.set(node, prop);
		return domStyle.set(node, prop, value);
	};

	dom.place = domCon.place;
	dom.selectable = domDom.setSelectable;
	dom.byId = domDom.byId;
	dom.destroy = domCon.destroy;
	dom.set = domProp.set;
	dom.get = domProp.get;


	return dom;

});

},
'dx-alias/on':function(){
define("dx-alias/on", [
	'dojo/on',
	'dojo/aspect',
	'dojo/sniff',
	'dojo/_base/lang',
	'dojo/_base/event'
], function(on, aspect, has, lang, event){

	var
		WKADJUST = -20, // chrome still seems to scroll faster than Safari

		global = window,

		normalizeScroll = function(evt){
			var o = {
				type:"scroll",
				horizontal:0,
				vertical:0,
				x:0,
				y:0
			};
			if(evt.wheelDelta){
				// Safari
				if(evt.wheelDeltaX){
					o.horizontal = 1;
					o.x = Math.ceil(evt.wheelDeltaX/WKADJUST);
					o.wheelDeltaX = evt.wheelDeltaX;
				}else{
					o.vertical = 1;
					o.y = evt.wheelDeltaY/WKADJUST;
				}
			}else{
				if(evt.axis == evt.HORIZONTAL_AXIS){
					o.horizontal = 1;
					o.x = evt.detail;
				}else{
					o.vertical = 1;
					o.y = evt.detail;
				}
			}
			evt.scroll = o;
			return evt;
		},

		aliasOn =  function(target, event, ctx, scope, group){

			// mandating that there is always a target and event
			// may not be ctx though
			var fn;
			if(typeof ctx == 'function'){
				fn = ctx;
				group = scope;
			}else if(typeof ctx == 'string'){
				group = scope;
				scope = ctx;
				ctx = global;
			}
			fn = fn || lang.hitch(ctx, scope);

			if(typeof target == 'string'){
				target = document.getElementById(target); // race condition with dx-alias/dom

			}else if(!target.addEventListener && !target.attachEvent){ // need better checking here (emtters, objects with addEventListener)
				// an object, not a node
				return aspect.after(target, event, fn, true);
			}

			if(event == 'scroll'){
				event = has("ff") ? "DOMMouseScroll" : "mousewheel";
				return on.pausable(target, event, function(evt){
					fn(normalizeScroll(evt));
				});
			}

			if(event == 'press'){
				// TO PORT!
			}

			// TODO:
			// 	group
			// 	pub/sub
			// on-press
			return on.pausable(target, event, fn);
		};

		aliasOn.multi = function(target, obj, ctx, group){
			// example
			// 	|	on.multi(node, {
			// 	|		'mousedown':'onMouseDown',
			// 	|		'mouseup':this.onMouseUp
			// 	|	}, this);
			//
			var listeners = [];
			ctx = ctx || null;
			for(var nm in obj){
				listeners.push(aliasOn(target, nm, !!ctx?ctx:obj[nm], !!ctx?obj[nm]:null, group));
			}
			return {
				remove: function(){
					listeners.forEach(function(lis){ lis.remove(); });
				},
				pause: function(){
					listeners.forEach(function(lis){ lis.pause(); });
				},
				resume: function(){
					listeners.forEach(function(lis){ lis.resume(); });
				}
			};
		};

		aliasOn.once = function(target, event, ctx, method){
			var fn = lang.hitch(ctx, method);
			var handle = aliasOn(target, event, function(){
				handle.remove();
				fn.apply(null, arguments);
			});

		};

		aliasOn.selector = on.selector;
		aliasOn.stopEvent = event.stop; // move to dx-event?

		// aliasOn.group = {
		//		pause
		//		resume
		//}

	return aliasOn;
});

},
'dx-timer/timer':function(){
(function(define){
define("dx-timer/timer", [],function(){

	var ua = window.navigator.userAgent;
	var logit = /IE/.test(ua) ?
		function(args){
			console.log(Array.prototype.slice.call(args).join(" "));
		} :
		function(args){
			console.log.apply(console, args);
		};

	var

		logger = function(){
			logit(arguments);
			return function(){
				logit( Array.prototype.slice.call(arguments));
			};
		},

		bind = function(ctx, func){
			if(typeof(func) == "string"){
				if(!func){ func = ctx; ctx = window; }
				return function(){
					ctx[func].apply(ctx, arguments); }
			}else{
				var method = !!func ? ctx.func || func : ctx;
				var scope = !!func ? ctx : window;
				return function(){ method.apply(scope, arguments); }
			}
		},
		eases = {
			// all are "quad"
			easeIn: function(/* Decimal? */n){
				return Math.pow(n, 2);
			},

			easeOut: function(/* Decimal? */n){
				return n * (n - 2) * -1;
			},

			easeInOut: function(/* Decimal? */n){
				n = n * 2;
				if(n < 1){ return Math.pow(n, 2) / 2; }
				return -1 * ((--n) * (n - 2) - 1) / 2;
			}
		},
		uids = 0,
		uid = function(){
			return 'TMR_'+(uids++);
		},
		_uidInt = 0,
		time = function(){
			return (new Date()).getTime();
		},

		callbacks = {},
		empty = function(o){ for(var n in o){ return 0; } return 1;},
		iHandle = 0,
		interval = function(callback){
			// main timers run through this, as one timer with multiple
			// callbacks is more efficient than multiple timers
			var id = uid();
			callbacks[id] = callback;
			if(!iHandle){
				iHandle = setInterval(function(){
					for(var n in callbacks) callbacks[n]();
				}, 20);
			}

			return {
				remove: function(){
					delete callbacks[id];
					if(empty(callbacks)){
						clearInterval(iHandle);
						iHandle = 0;
					}
				}
			}
		};




	var timer = function(){

		var
			INTEGER = 'integer',
			SECONDS = 'seconds',
			FLOAT = 'float',
			log = function(){}, // use 'debug'
			_setlog = 0,

			o = {},
			args = arguments,

			ctx,
			cb,	// bind callback
			d,	// duration
			i,	// increment
			delay, 	// delay to start timer (number or stringified number)
			format, // return integer, float, milliseconds|ms (default), number:toFixed
			ease, //ease
			debug = 0,
			pausedAtStart = false, // if true, does not start until prompted
			id = 'TMR'; // can be set if using options object

		var argList = Array.prototype.slice.call(arguments);

		// create variables from "magic argument signature(TM)"
		var
			actx = 1,
			afn = 1,
			adur = 1,
			aint = 1,
			adelay = 1,
			aform = 1,
			aease = 1,
			adebug = 1,
			apause = 1
			aoptions = 1;

		while(argList.length){

			var a = argList.shift();

			//console.log(' --> a:', typeof a, typeof a != 'function', a)

			if(actx){
				actx = 0;
				// if one arg and it's an object, then expect an options object.
				if(args.length > 1 && typeof a == 'object' && typeof a != 'function'){
					ctx = a;
					continue;
				}

			}

			if(afn){
				afn = 0;
				if(typeof a == 'function' || (!!ctx && typeof a == 'string')){
					cb = !!ctx ? bind(ctx, a) : a;
					continue;
				}
			}

			if(adur){
				adur = 0;
				if(typeof a == 'number'){
					d = a;
					continue;
				}
			}

			if(aint){
				aint = 0;
				if(typeof a == 'number'){
					i = a;
					continue;
				}
			}

			if(adelay){
				adelay = 0;
				if(typeof a == 'number' || (typeof a == 'string' && Number(a) == a)){ // allow stringified delay
					delay = Number(a);
					continue;
				}
			}

			if(aform){
				aform = 0;
				if(typeof a == 'string' && (a == INTEGER || a == FLOAT || a == SECONDS )){
					format = a;
					continue;
				}
			}

			if(aease){
				aease = 0;
				if(typeof a == 'string' && eases[a]){
					ease = eases[a];
					continue;
				}else if(typeof a == 'function'){
					ease = a;
					continue;
				}
			}

			if(adebug){
				adebug = 0;
				if(a == 'debug'){
					debug = 1;
					// logger is not required
					if(logger) _setlog = 1;
					continue;
				}
			}

			if(apause){
				apause = 0;
				if(a === true){
					pausedAtStart = 1;
					continue;
				}
			}

			if(aoptions){
				if(a.ctx) ctx = a.ctx;
				if(a.callback) fn = !!ctx ? bind(ctx, a.callback) : a.callback;
				if(a.i) i = a.i;
				if(a.d) d = a.d;
				if(a.delay) delay = a.delay;
				if(a.format) format = a.format;
				if(a.ease) ease = typeof a.ease == 'string' ? eases[a.ease] : a.ease;
				if(a.paused) pausedAtStart = 1;
				if(a.id) id = a.id;
			}
		} // end while

		if(!ease) ease = function(n){ return n; }
		if(!d) d = Infinity;
		if(_setlog){
			log = logger(id, 1);
		}

		//console.log("timer options:", d, i, delay, cb, pausedAtStart);

		var
			h; // timer handle

		var
			// allow for promise-like then() chain
			thenList = [],
			addThen = function(c, f){
				thenList.push(bind(c,f));
				return getEvent();
			},
			thenCallback = function(evt){
				for(var i=0;i<thenList.length;i++){
					thenList[i](evt);
				}
				thenList = [];
			},

			// format the return time
			formatTime = function(n){ return n; };
			if(format == INTEGER){
				formatTime = function(n){ return Math.ceil(n*.001); }
			}else if(format == SECONDS){
				formatTime = function(n){ return n*.001; }
			}else if(typeof format == "number"){ // this ain't gonna happen
				formatTime = function(n){ return Number(n.toFixed(format)); }
			}

		var
			stopped = false,
			playing = false,

			starttime=0, startinc=0, pausetime=0, pausetick=0, elapsed=0, tick=0,
			increment=0, pausedelay=0, resumedelay=0, pingtime=0,
			callback = function(){},
			endback = function(){};


		// create the proper functions here, to avoid unecessary if() statements
		// that could slow things down
		callback.name = 'empty';
		if(!!cb && !!i){
			callback = function(){
				//console.log('cb', increment,  i)
				if(increment >= i){
					cb(getEvent());
					startinc = time();
				}
			}
			callback.name = 'increment';
		}

		if(!!d && !!cb){
			endback = function(){
				if(tick >= d){
					stopTimer();
					cb(getEvent());
					thenCallback(getEvent());
				}
			}
		}else if(!!d){
			endback = function(){
				if(tick >= d){
					stopTimer();
					thenCallback(getEvent());
				}
			}
		}else{
			// infinite timer
		}






		// controlling methods
		var stop = function(){
			// stop cannot be delayed because
			// it needs to happen syncronously
			stopped = true;
			stopTimer();
			var event = getEvent();
			pausetime = 0;
			pausetick = 0;
			elapsed = 0;
			tick = 0;
			increment = 0;
			return event;
		}

		var start = function(_delay){
			log('start!!')
			if(_delay !== undefined) delay = _delay;
			if(pausedAtStart){
				pausedAtStart = false;
				stopped = true;
				return;
			}
			stopped = false;
			setTimeout(function(){
				stop(); // reset
				stopped = false;
				starttime = startinc = time();
				startTimer();
			}, delay);
		}

		var pause = function(){
			log('pause!!!!');
			stopTimer();
			pausetick = time();
			return getEvent();
		}

		var resume = function(){
			log('resume!!!!');
			if(stopped){
				start();
			}else{
				pausetime += time() - pausetick;
				startTimer();
			}
			return getEvent();
		}



		// The actual timer happens here
		var startTimer = function(){
			playing = true;
			h = interval(function(){
				tick = time() - starttime - pausetime;
				increment = Math.max(0, time() - startinc);
				elapsed = time()-starttime;
				callback();
				endback();
			});
		}

		var stopTimer = function(){
			playing = false;
			//clearInterval(h);
			!!h && h.remove();
		}





		var handle = {
			// methods
			pause:function(_delay){
				setTimeout(pause, _delay||0);
				return getEvent();
			},
			resume: function(_delay){
				setTimeout(resume, _delay||0);
				return getEvent();
			},
			start: function(_delay){
				// this delay can be overwritten
				start(_delay);
				return getEvent();
			},
			ping: function(reset){
				var result;
				if(!pingtime){
					result = 0;
				}else{
					result = time() - pingtime;
				}
				if(reset){
					pingtime = 0;
					handle.pingtime = 0;
				}else{
					pingtime = time();
					this.pingtime = result;
				}
				return result;
			},
			stop:stop,
			remove:stop,
			then: addThen,
			onEnd: addThen,

			// properties
			time:0,
			playtime:0,
			elapsed:0,
			pausetime:0,
			increment:0,
			percentage:0,
			pingtime:0,
			playing:false,
			type :'timer'
		};

		var getEvent = function(){
			handle.time = 		formatTime(tick);
			handle.playtime = 	formatTime(tick);
			handle.elapsed = 	formatTime(elapsed);
			handle.pausetime = 	formatTime(pausetime);
			handle.increment = 	formatTime(increment);
			handle.percentage = 0;
			handle.playing = 	playing;


			if(!!d) handle.percentage = ease(tick/d<0 ? 0 : tick/d>1 ? 1 : tick/d);

			return handle;
		}

		start();

		return handle;
	}

	return timer;

});
})(typeof define == "undefined" ? function(deps, factory){
	timer = factory();
} : define);

},
'dx-media/image/Preview':function(){
define("dx-media/image/Preview", [
	"dojo/_base/declare",
	"dojo/_base/connect",
	"../mobile/common",
	"./Image",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, connect, mobile, Image, dom, lang, on, logger, timer){

	var log = logger('PRE', 0);

	return declare('dx-media.image.Preview', [Image], {

		className:'dxPlayerPreview',

		constructor: function(){
			this.inherited(arguments);
			on(this, 'onImageLoaded', this, 'onReady');
		},

		postCreate: function(){
			this.inherited(arguments);
			log('postCreate');
		},

		onReady: function(){
			log('ready', this.width, this.height, this.nativeWidth, this.nativeHeight);
			this.imageAspect = this.nativeWidth / this.nativeHeight;
		},

		onSize: function(size){
			if(!this.imageAspect){
				timer(this, function(){
					this.onSize(size);
				}, 100);
				return;
			}

			//log('size', size.w, size.h);
			this.boxAspect = size.w / size.h;

			if(this.boxAspect == this.imageAspect){
				log('boxAspect equal');
				dom.style(this.domNode, {
					height:size.h+'px',
					width:size.w+'px',
					top:'0px',
					left:'0px'
				});
			}else if(this.boxAspect > this.imageAspect){
				log('boxAspect height');
				dom.style(this.domNode, {
					height:size.h+'px',
					width:'auto',
					top:'0px',
					left:.5*(size.w - ((size.h/this.nativeHeight)*this.nativeWidth))+'px'
				});
			}else{
				log('boxAspect width');
				dom.style(this.domNode, {
					width:size.w+'px',
					height:'auto',
					top:.5*(size.h - ((size.w/this.nativeWidth)*this.nativeHeight))+'px',
					left:'0px'
				});
			}

		}
	});

});

},
'dx-media/mobile/common':function(){
define("dx-media/mobile/common", [
	"dojo/_base/array",
	"dojo/_base/config",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/ready",
	"dijit/registry",
	"./sniff",
	"./uacss" // (no direct references)
], function(array, config, connect, lang, win, domClass, domConstruct, ready, registry, has){

	var dm = {};
/*=====
	var dm = dojox.mobile;
=====*/

	// module:
	//		dojox/mobile/common
	// summary:
	//		A common module for dojox.mobile.
	// description:
	//		This module includes common utility functions that are used by
	//		dojox.mobile widgets. Also, it provides functions that are commonly
	//		necessary for mobile web applications, such as the hide address bar
	//		function.

	dm.getScreenSize = function(){
		// summary:
		//		Returns the dimensions of the browser window.
		return {
			h: win.global.innerHeight || win.doc.documentElement.clientHeight,
			w: win.global.innerWidth || win.doc.documentElement.clientWidth
		};
	};

	dm.updateOrient = function(){
		// summary:
		//		Updates the orientation specific css classes, 'dj_portrait' and
		//		'dj_landscape'.
		var dim = dm.getScreenSize();
		domClass.replace(win.doc.documentElement,
				  dim.h > dim.w ? "dj_portrait" : "dj_landscape",
				  dim.h > dim.w ? "dj_landscape" : "dj_portrait");
	};
	dm.updateOrient();

	dm.tabletSize = 500;
	dm.detectScreenSize = function(/*Boolean?*/force){
		// summary:
		//		Detects the screen size and determines if the screen is like
		//		phone or like tablet. If the result is changed,
		//		it sets either of the following css class to <html>
		//			- 'dj_phone'
		//			- 'dj_tablet'
		//		and it publishes either of the following events.
		//			- '/dojox/mobile/screenSize/phone'
		//			- '/dojox/mobile/screenSize/tablet'
		var dim = dm.getScreenSize();
		var sz = Math.min(dim.w, dim.h);
		var from, to;
		if(sz >= dm.tabletSize && (force || (!this._sz || this._sz < dm.tabletSize))){
			from = "phone";
			to = "tablet";
		}else if(sz < dm.tabletSize && (force || (!this._sz || this._sz >= dm.tabletSize))){
			from = "tablet";
			to = "phone";
		}
		if(to){
			domClass.replace(win.doc.documentElement, "dj_"+to, "dj_"+from);
			connect.publish("/dojox/mobile/screenSize/"+to, [dim]);
		}
		this._sz = sz;
	};
	dm.detectScreenSize();

	// dojox.mobile.hideAddressBarWait: Number
	//		The time in milliseconds to wait before the fail-safe hiding address
	//		bar runs. The value must be larger than 800.
	dm.hideAddressBarWait = typeof(config["mblHideAddressBarWait"]) === "number" ?
		config["mblHideAddressBarWait"] : 1500;

	dm.hide_1 = function(){
		// summary:
		//		Internal function to hide the address bar.
		scrollTo(0, 1);
		dm._hidingTimer = (dm._hidingTimer == 0) ? 200 : dm._hidingTimer * 2;
		setTimeout(function(){ // wait for a while for "scrollTo" to finish
			if(dm.isAddressBarHidden() || dm._hidingTimer > dm.hideAddressBarWait){
				// Succeeded to hide address bar, or failed but timed out
				dm.resizeAll();
				dm._hiding = false;
			}else{
				// Failed to hide address bar, so retry after a while
				setTimeout(dm.hide_1, dm._hidingTimer);
			}
		}, 50); //50ms is an experiential value
	};

	dm.hideAddressBar = function(/*Event?*/evt){
		// summary:
		//		Hides the address bar.
		// description:
		//		Tries hiding of the address bar a couple of times to do it as
		//		quick as possible while ensuring resize is done after the hiding
		//		finishes.
		if(dm.disableHideAddressBar || dm._hiding){ return; }
		dm._hiding = true;
		dm._hidingTimer = has("iphone") ? 200 : 0; // Need to wait longer in case of iPhone
		var minH = screen.availHeight;
		if(has("android")){
			minH = outerHeight / devicePixelRatio;
			// On some Android devices such as Galaxy SII, minH might be 0 at this time.
			// In that case, retry again after a while. (200ms is an experiential value)
			if(minH == 0){
				dm._hiding = false;
				setTimeout(function(){ dm.hideAddressBar(); }, 200);
			}
			// On some Android devices such as HTC EVO, "outerHeight/devicePixelRatio"
			// is too short to hide address bar, so make it high enough
			if(minH <= innerHeight){ minH = outerHeight; }
			// On Android 2.2/2.3, hiding address bar fails when "overflow:hidden" style is
			// applied to html/body element, so force "overflow:visible" style
			if(has("android") < 3){
				win.doc.documentElement.style.overflow = win.body().style.overflow = "visible";
			}
		}
		if(win.body().offsetHeight < minH){ // to ensure enough height for scrollTo to work
			win.body().style.minHeight = minH + "px";
			dm._resetMinHeight = true;
		}
		setTimeout(dm.hide_1, dm._hidingTimer);
	};

	dm.isAddressBarHidden = function(){
		return pageYOffset === 1;
	};

	dm.resizeAll = function(/*Event?*/evt, /*Widget?*/root){
		// summary:
		//		Call the resize() method of all the top level resizable widgets.
		// description:
		//		Find all widgets that do not have a parent or the parent does not
		//		have the resize() method, and call resize() for them.
		//		If a widget has a parent that has resize(), call of the widget's
		//		resize() is its parent's responsibility.
		// evt:
		//		Native event object
		// root:
		//		If specified, search the specified widget recursively for top level
		//		resizable widgets.
		//		root.resize() is always called regardless of whether root is a
		//		top level widget or not.
		//		If omitted, search the entire page.
		if(dm.disableResizeAll){ return; }
		connect.publish("/dojox/mobile/resizeAll", [evt, root]); // back compat
		connect.publish("/dojox/mobile/beforeResizeAll", [evt, root]);
		if(dm._resetMinHeight){
			win.body().style.minHeight = dm.getScreenSize().h + "px";
		}
		dm.updateOrient();
		dm.detectScreenSize();
		var isTopLevel = function(w){
			var parent = w.getParent && w.getParent();
			return !!((!parent || !parent.resize) && w.resize);
		};
		var resizeRecursively = function(w){
			array.forEach(w.getChildren(), function(child){
				if(isTopLevel(child)){ child.resize(); }
				resizeRecursively(child);
			});
		};
		if(root){
			if(root.resize){ root.resize(); }
			resizeRecursively(root);
		}else{
			array.forEach(array.filter(registry.toArray(), isTopLevel),
					function(w){ w.resize(); });
		}
		connect.publish("/dojox/mobile/afterResizeAll", [evt, root]);
	};

	dm.openWindow = function(url, target){
		// summary:
		//		Opens a new browser window with the given url.
		win.global.open(url, target || "_blank");
	};

	if(config["mblApplyPageStyles"] !== false){
		domClass.add(win.doc.documentElement, "mobile");
	}
	if(has("chrome")){
		// dojox.mobile does not load uacss (only _compat does), but we need dj_chrome.
		domClass.add(win.doc.documentElement, "dj_chrome");
	}

	if(win.global._no_dojo_dm){
		// deviceTheme seems to be loaded from a script tag (= non-dojo usage)
		var _dm = win.global._no_dojo_dm;
		for(var i in _dm){
			dm[i] = _dm[i];
		}
		dm.deviceTheme.setDm(dm);
	}

	// flag for Android transition animation flicker workaround
	has.add("mblAndroidWorkaround",
			config["mblAndroidWorkaround"] !== false && has("android") < 3, undefined, true);
	has.add('mblAndroid3Workaround',
			config["mblAndroid3Workaround"] !== false && has("android") >= 3, undefined, true);

	ready(function(){
		dm.detectScreenSize(true);

		if(config["mblAndroidWorkaroundButtonStyle"] !== false && has("android")){
			// workaround for the form button disappearing issue on Android 2.2-4.0
			domConstruct.create("style", {innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;}"}, win.doc.head, "first");
		}
		if(has("mblAndroidWorkaround")){
			// add a css class to show view offscreen for android flicker workaround
			domConstruct.create("style", {innerHTML:".mblView.mblAndroidWorkaround{position:absolute;top:-9999px !important;left:-9999px !important;}"}, win.doc.head, "last");
		}

		//	You can disable hiding the address bar with the following djConfig.
		//	var djConfig = { mblHideAddressBar: false };
		var f = dm.resizeAll;
		if(config["mblHideAddressBar"] !== false &&
			navigator.appVersion.indexOf("Mobile") != -1 ||
			config["mblForceHideAddressBar"] === true){
			dm.hideAddressBar();
			if(config["mblAlwaysHideAddressBar"] === true){
				f = dm.hideAddressBar;
			}
		}
		if(has("android") && win.global.onorientationchange !== undefined){
			var _f = f;
			f = function(evt){
				var _conn = connect.connect(null, "onresize", null, function(e){
					connect.disconnect(_conn);
					_f(e);
				});
			};
		}
		connect.connect(null, win.global.onorientationchange !== undefined
			? "onorientationchange" : "onresize", null, f);
		win.body().style.visibility = "visible";
	});

	return dm;
});

},
'dx-media/mobile/sniff':function(){
define("dx-media/mobile/sniff", [
	"dojo/_base/window",
	"dojo/_base/sniff"
], function(win, has){

	var ua = navigator.userAgent;

	// BlackBerry (OS 6 or later only)
	has.add("bb", ua.indexOf("BlackBerry") >= 0 && parseFloat(ua.split("Version/")[1]) || undefined, undefined, true);

	// Android
	has.add("android", parseFloat(ua.split("Android ")[1]) || undefined, undefined, true);

	// iPhone, iPod, or iPad
	// If iPod or iPad is detected, in addition to has("ipod") or has("ipad"),
	// has("iphone") will also have iOS version number.
	if(ua.match(/(iPhone|iPod|iPad)/)){
		var p = RegExp.$1.replace(/P/, 'p');
		var v = ua.match(/OS ([\d_]+)/) ? RegExp.$1 : "1";
		var os = parseFloat(v.replace(/_/, '.').replace(/_/g, ''));
		has.add(p, os, undefined, true);
		has.add("iphone", os, undefined, true);
	}

	if(has("webkit")){
		has.add("touch", (typeof win.doc.documentElement.ontouchstart != "undefined" &&
			navigator.appVersion.indexOf("Mobile") != -1) || !!has("android"), undefined, true);
	}

	return has;
});

},
'dx-media/mobile/uacss':function(){
define("dx-media/mobile/uacss", [
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/window",
	"./sniff"
], function(dojo, lang, win, has){
	var html = win.doc.documentElement;
	html.className = lang.trim(html.className + " " + [
		has("bb") ? "dj_bb" : "",
		has("android") ? "dj_android" : "",
		has("iphone") ? "dj_iphone" : "",
		has("ipod") ? "dj_ipod" : "",
		has("ipad") ? "dj_ipad" : ""
	].join(" ").replace(/ +/g," "));
	return dojo;
});

},
'dx-alias/log':function(){
define("dx-alias/log", function(){

	var ua = window.navigator.userAgent;

	window.bvConfig = {
		debug:1
	};

	var fixConsole = function(){
		if(window.bvConfig === undefined) window.bvConfig = {};
		if(bvConfig.nofixios) return;
		var dbg = window.debug || bvConfig.debug || /debug=true/.test(document.location.href) || false;
		bvConfig.loglimit = bvConfig.loglimit || 299;
		var count = bvConfig.loglimit;

		var common = "info,error,log,warn";
		var more = "debug,time,timeEnd,assert,count,trace,dir,dirxml,group,groupEnd,groupCollapsed,exception";

		var supportedBrowser = /Android/.test(ua);


		if(bvConfig.pageDebug || (supportedBrowser && bvConfig.androidDebug)){
			var loaded = false;

			if(!/Firefox/.test(ua)) window.console = {};
			var c = window.console;

			var node;

			var list = [];
			var cache = function(type, args){
				list.push({
					type:type,
					args:args
				});

			}
			var flush = function(){
				list.forEach(function(o){
					bv.dom('div', {css:"bvLog", innerHTML:o.type+":"+o.args}, node);
				});
				list = [];
			}

			common.split(",").forEach(function(n){
				(function(){
					var type = n;
					c[n] = function(){
						cache(type, Array.prototype.slice.call(arguments).join(" "));
					}
				})();

			});

			more.split(",").forEach(function(n){
				c[n] = function(){}
			});

			window.bvPageDebugger = function(){
				bv.ready(function(){
					node = bv.byId("bvDbg");
					flush();
				});
				bv.on("interval", function(){
					if(list.length) flush();
				}, 100);


			}


		}


		if(!window.console) {
			console = {};
			dbg = false;
		}

		var fixIE = function(){
			var calls = common.split(",");
			for(var i=0;i<calls.length;i++){
				var m = calls[i];
				var n = "_"+calls[i]
				console[n] = console[m];
				console[m] = (function(){
					var type = n;
					return function(){
						count--;
						if(count == 0){
							console.clear();
							count = bvConfig.loglimit;
						}//console._log("***LOG LIMIT OF "+bvConfig.loglimit+" HAS BEEN REACHED***");
						if(count < 1) return;
						try{
							console[type](Array.prototype.slice.call(arguments).join(" "));
						}catch(e){
							throw new Error("Error **consoleFix** Failed on log type "+type);
						}
					}
				})();
			}
			// clear the console on load. This is more than a convenience - too many logs crashes it.
			// (If closed it throws an error)
				try{ console.clear(); }catch(e){}
		}

		var fixMobile = function(){
			// iPad and iPhone use the crappy old Safari debugger.
			console._log = console.log;
			console.log = console.debug = console.info = console.warn = console.error = function(){
				var a = [];
				for(var i=0;i<arguments.length;i++){
					a.push(arguments[i])
				}
				console._log(a.join(" "));
			}
		}

		var hideCalls = function(str){
			var calls = str.split(",");
			for(var i=0;i<calls.length;i++){
				console[calls[i]] = function(){};
			}
		}


		if(dbg && /Trident/.test(ua)){
			fixIE();
			hideCalls(more);
		}else if(dbg && /iPad|iPhone/.test(ua)){
			fixMobile();
		}else if((/IE/.test(ua) && !/Trident/.test(ua)) || !dbg || !window.console){
			hideCalls(more+","+common);
		}
		//console.log("test log")
	}

	fixConsole();

	var hash = document.location.search+"#"+document.location.hash;
	var logit = /IE/.test(ua) ?
	function(args){
		console.log(Array.prototype.slice.call(args).join(" "));
	} :
	function(args){
		console.log.apply(console, args);
	};

	return function(name, enabled){
		var r = new RegExp(name);
		if(!r.test(hash) && (enabled === false || enabled === 0)) return function(){};
		return function(){
			var args = Array.prototype.slice.call(arguments);
			args.forEach(function(a,i){
				if(a && typeof a==="object" && a.tagName){
					args[i]=a.tagName.toLowerCase()+"#"+a.id;
				}
			}, this);
			args.unshift(" "+name+" ");
			logit(args);
		};
	};
});

},
'dx-media/player/Mobile':function(){
define("dx-media/player/Mobile", [
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/sniff",
	"../mobile/common",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, connect, has, mobile, _WidgetBase, _TemplatedMixin, _Container, dom, lang, on, logger, timer){

	var log = logger('PMO', 1);
	var screensize;
	var isMobile = has("ios") || has("android");

	return declare('dx-media.player.Mobile', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div><div class="dxPlayerMobile" data-dojo-attach-point="containerNode"></div></div>',

		poster:'',
		controls:1,
		defaultView:'',

		constructor: function(){
			if(isMobile){
				on(mobile, 'updateOrient', this, 'onResize');
			}else{
				connect.subscribe('/dojox/mobile/screenSize/tablet', this, 'onResize');
				on(window, 'resize', this, 'onResize');
			}
		},


		postCreate: function(){
			console.log('  postCreate...'); // not firing....????
		},

		startup: function(){
			//log('  startup...', this);

			this.views = {};

			this.getChildren().forEach(function(w){
				w.name = lang.last(w.declaredClass.split('.'));

				switch(w.name){
					case 'Preview':
						this.preview = w;
						break;
					case 'Controls':
						this.controls = w;
						on(this.controls, 'onClick', this, 'onClick');
						break;
					case 'ScreenPlayButton':
						this.screenBtn = w;
						break;


					case 'Mobile':
						this.views['Mobile'] = this.views['Video'] = this.video = w;
						on(this.video, 'onStop', this, 'onStop');
						on(this.video, 'onPlay', this, 'onStop');
						this.setCurrent(w);
						break;
					case 'Vtour':
						this.views['Vtour'] = this.vtour = w;
						this.setCurrent(w);
						break;
					case 'Slideshow':
						this.views['Slideshow'] = this.slideshow = w;
						this.setCurrent(w);
						break;

				}

			}, this);


			if(this.preview && this.video){
				dom.style(this.video.domNode, "opacity", 0);
				if(this.preview.width){
					this.video.onPreview(this.preview.width, this.preview.height);
				}else{
					on(this.preview, 'onReady', this, function(){
						this.video.onPreview(this.preview.width, this.preview.height);
					});
				}
			}

			if(this.defaultView) this.setCurrent(this.defaultView);
		},

		setCurrent: function(widget){
			// widget may be a button, with the same name as a view widget
			var name = typeof widget == 'string' ? widget : widget.name;
			if((this.current && name == this.current.name )|| !this.views[name]) return;
			log('setCurrent', name);
			//log('has preview', !!this.preview, !!this.screenBtn)

			this.preview && this.preview.hide();
			this.screenBtn && dom.hide(this.screenBtn.domNode);

			this.current && this.current.hide();
			this.current = this.views[name];
			this.current.show();

			if(name == 'Mobile' || name == 'Video'){
				this.preview && this.preview.show();
				this.screenBtn && dom.show(this.screenBtn.domNode);
			}
		},

		onClick: function(w){
			//log('onClick:', w.name);
			this.setCurrent(w);
		},

		onStop: function(){
			this.preview && this.preview.destroy();
			this.screenBtn && this.screenBtn.destroy();
			dom.style(this.video.domNode, "opacity", 1);
			this.preview = this.screenBtn = null;
		},

		onResize: function(){
			mobile.hideAddressBar();

			// seems to work, but after a few ms:
			//log('RESIZE', document.documentElement.className)

			this.onSize(dom.box(this.domNode));
		},


		onSize: function(sz){
			this.getChildren().forEach(function(w){
				w.onSize && w.onSize(sz);
			});
		},

		onOrient: function(){
			log('orient');
			this.onResize();
		}
	});

});

},
'dx-media/player/ScreenPlayButton':function(){
define("dx-media/player/ScreenPlayButton", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, dom, on, logger, timer){

	var log = logger('SPB', 1);

	return declare('dx-media.player.ScreenPlayButton', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div data-dojo-attach-point="buttonNode" class="dxScreenPlayButton"></div>',

		postCreate: function(){
			on(this.domNode, 'click', this, 'onClick');
		},

		onClick: function(){
			log('CLICK')
			// stub
		}
	});

});

},
'dx-media/player/controls/Controls':function(){
define("dx-media/player/controls/Controls", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, _Container, dom, on, lang, logger, timer){

	var log = logger('CON', 0);

	return declare('dx-media.player.controls.Controls', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div class="dxPlayerMobileControls"><div class="left" data-dojo-attach-point="containerNode"></div><div class="right" data-dojo-attach-point="containerRight"></div></div>',

		postCreate: function(){
			on(this.domNode, 'click', function(){
				log('clicked control bar')
			})
			on(document, 'click', function(){
				log('clicked doc')
			})
		},

		onClick: function(w){
			//
		},

		addChildLeft: function(w){
			this.register(w);
		},

		addChildRight: function(w){
			this.removeChild(w);
			dom.place(w.domNode, this.containerRight);
			this.register(w);
		},

		register: function(w){
			w.name = lang.last(w.declaredClass.split('.'));
			var widget = w;
			on(w, 'onClick', this, function(){
				//log('click', widget.name);
				this.onClick(widget);
			});
		}
	});

});

},
'dx-media/player/controls/Embed':function(){
define("dx-media/player/controls/Embed", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('EMB', 1);

	return declare('dx-media.player.controls.Embed', [_Button], {

		align:'right',
		buttonClass:'dxEmbedBtn'

	});

});

},
'dx-media/player/controls/_Button':function(){
define("dx-media/player/controls/_Button", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dx-alias/log"
], function(declare, _WidgetBase, _TemplatedMixin, logger){

	//var log = logger('PMO', 1);

	return declare('dx-media.player.controls._Button', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxIcon ${buttonClass}" data-dojo-attach-event="onclick:onClick"></div>',
		buttonClass:'',

		postCreate: function(){
			if(this.align == 'right'){
				this.getParent().addChildRight(this);
			}else{
				this.getParent().addChildLeft(this);
			}
		},

		onClick: function(){
			// overwrite or connect to me!
		}
	});

});

},
'dx-media/player/controls/Facebook':function(){
define("dx-media/player/controls/Facebook", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('FBK', 1);

	return declare('dx-media.player.controls.Facebook', [_Button], {

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

},
'dx-media/player/controls/Slideshow':function(){
define("dx-media/player/controls/Slideshow", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('PHO', 1);

	return declare('dx-media.player.controls.Slideshow', [_Button], {

		buttonClass:'dxSlideshowBtn'
	});

});

},
'dx-media/player/controls/Twitter':function(){
define("dx-media/player/controls/Twitter", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/string",
	"dx-alias/log"

], function(declare, _Button, dom, string, logger){

	var log = logger('TWI', 1);

	return declare('dx-media.player.controls.Twitter', [_Button], {

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

},
'dx-alias/string':function(){
define("dx-alias/string", [], function(){

	return {

		urlToObj: function(url){
			var loc = location, q;
			url = url || loc.href;
			if(/\?|\#/.test(url)){
				q = url.split(/\?|\#/);
				url = q[0];
				q = q[1];
			}
			var o = {
				protocol:loc.protocol,
				host:loc.host,
				href:url
			}, parts;

			o.query = q ? this.strToObj(q) : {};

			if(/\:/.test(url)){
				url = url.replace('://', '/');
				parts = url.split('/');
				o.protocol = parts.shift();
				o.host = parts.shift();
				o.sameDomain = o.host == loc.host;
			}else{
				parts = url.split('/');
				o.sameDomain = true;
			}
			o.filename = parts.pop();
			o.folder = parts.join("/");
			return o;
		},

		strToObj: function(str){
			if(!str) return {};
			var delim = /&/.test(str) ? "&" : ",",
				eq = /=/.test(str) ? "=" : ":",
				o = {},
				a = str.split(delim);
			for(var i=0; i<a.length;i++){
				if(!/=/.test(a[i]) && !/=/.test(a[i])) continue;
				var pr = this.trim(a[i]).split(eq);
				if (pr[0]=="file"){
					o[this.trim(pr[0])] = this.normalize(a[i].substring(a[i].indexOf(eq)+1));
				}else{
		            o[this.trim(pr[0])] = this.normalize(this.trim(pr[1]));
				}
			}
			return o;
		},

		trim: function(str){
			return !str ?
				str :
				str.trim ?
					str.trim() :
					str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},

		normalize: function(v, delim){
			//console.trace(); console.log("value:", v)
			if(v == "true") return true;
			if(v == "false") return false;
			if(v.substring(0,1) == "0") return v; // 001 id
			if(Number(v) == v) return Number(v);
			if(/,/.test(v) && delim == "&"){ // this looks like object parsing and should be a different function
				v = v.split(",");
				for(var i=0;i<v.length;i++){
					v[i] = this.normalize(v[i]);
				}
			}
			return v;
		},

		urlEscape: function(s){
			// blocks unicode chars
			var t = "";
			for(var i=0;i<s.length;i++){
				if(s.charCodeAt(i) < 255) t+=s.charAt(i);
			}
			return escape(t);
		},

		urlEncode: function(str){
			return encodeURI(this.trim(str).replace(" ", "+"));
			//encodeURIComponent
		}
	};
});

},
'dx-media/player/controls/Video':function(){
define("dx-media/player/controls/Video", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('BV', 1);

	return declare('dx-media.player.controls.Video', [_Button], {

		buttonClass:'dxVideoBtn'
	});

});

},
'dx-media/player/controls/Vtour':function(){
define("dx-media/player/controls/Vtour", [
	"dojo/_base/declare",
	"./_Button",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _Button, dom, lang, logger){

	var log = logger('VTR', 1);

	return declare('dx-media.player.controls.Vtour', [_Button], {

		buttonClass:'dxVtourBtn'
	});

});

},
'dx-media/plugins/VAST':function(){
define("dx-media/plugins/VAST", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dojo/io/script",
	"../image/Image",
	"dx-alias/dom",
	"dx-alias/on",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, _WidgetBase, _TemplatedMixin, _Container, io, DImage, dom, on, logger, timer){

	var log = logger('VST', 1);

	return declare('dx-media.plugins.VAST', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div class="dxPluginsVAST"><div class="dxVastContainer" data-dojo-attach-point="containerNode"></div></div>',

		media:'',

		postMixInProperties: function(){
			log('JSON:', this.media);
			window.bvVastCallback = this.onData.bind(this);
			io.get({url:this.media, callbackParamName:'bvVastCallback', handleAs: "json"});
		},

		onData: function(data){
			log('data', data);
			this.ads = data.ads;
			this.index = -1;
			timer(this, function(){
				this.next();
			}, 1500);
		},

		postCreate: function(){
			log('postCreate');
		},

		next: function(){
			this.index++;
			if(this.index >= this.ads.length) return;
			var ad = this.ads[this.index].src;
			this.current && this.current.hide();
			this.current = new DImage({
				src:ad
			});
			this.addChild(this.current);
			timer(this, function(){
				this.display(true);
			}, 500);
			timer(this, function(){
				this.display(false);
			}, 2500);
			timer(this, function(){
				this.next();
			}, 3600);
		},

		display: function(show){

			// FOR BROWSER TESTING
			//dom.css.replace(document.documentElement, 'dj_portrait','dj_landscape');
			//log('class:', document.documentElement.className)

			dom.css(this.domNode, 'showing', show);
		},

		onClick: function(){
			log('CLICK')
			// stub
		}
	});

});

},
'dx-media/slideshow/Photo':function(){
define("dx-media/slideshow/Photo", [
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"../image/Image",
	"dx-alias/dom",
	"dx-timer/timer",
	"dx-alias/lang",
	"dx-alias/on",
	"dx-alias/log"
], function(declare, _WidgetBase, _TemplatedMixin, Img, dom, timer, lang, on, logger){

	var log = logger('PHO', 1);

	return declare('dx-media.slideshow.Photo', [_WidgetBase, _TemplatedMixin], {

		templateString:'<div class="dxPhoto"></div>',
		src:'',
		thumbnail:'',
		caption:'',
		index:-1,
		boxWidth:0,
		boxHeight:0,
		widthPercent:'90%',
		heightPercent:'90%',
		x:0,
		orgx:0,
		showing:1,
		transSpeed:400,

		postCreate: function(){
			//
			// TODO
			// 	Hide image to avoid the resize flash - BUT
			// 	hiding the image will prevent IE from getting the size.
			// 	Maybe use visibility:hidden instead
			//
			// TODO:
			//  	NO!!!
			//  	Instead load the image at a -2000px, get the size
			//  	then move it into position.

			this.trans = 'left '+this.transSpeed+'ms ease';

			// YIKES!
			// this.onImageLoad.bind(this) breaks the ability to connect to that method
			var cb = lang.bind(this, 'onImageLoad');

			this.img = new Img({src:this.src, onload:cb});
			this.domNode.appendChild(this.img.domNode);
			on(this.domNode, 'webkitTransitionEnd', this, 'onAniDone');
			on(this.domNode, 'transitionend', this, 'onAniDone');
		},

		drag: function(x){
			this.x += x;
			this.stop();
			dom.style(this.domNode, 'left', this.x+'px');

		},

		slideTo: function(x){
			this.x = this.orgx = x;
			this.animating = 1;
			dom.style(this.domNode, {
				webkitTransition:this.trans,
				MozTransition:this.trans
			});
			timer(this, function(){
				dom.style(this.domNode, 'left', this.x+'px');
			}, 30);
		},

		moveTo: function(x){
			this.x = this.orgx = x;
			dom.style(this.domNode, 'left', this.x+'px');
		},

		stop: function(){
			if(!this.animating) return;
			this.animating = 0;
			dom.style(this.domNode, {
				webkitTransition:'',
				MozTransition:''
			});
		},

		onAniDone: function(){
			this.stop();
		},

		onImageLoad: function(sz){
			//log('onImageLoad', sz.w, sz.h)
			this.imgWidth = sz.w;
			this.imgHeight = sz.h;
			this.imageAspect = this.imgWidth / this.imgHeight;
		},

		onSize: function(sz){
			if(!this.imageAspect){
				timer(this, function(){
					this.onSize(sz);
				}, 100);
				return;
			}

			this.boxAspect = sz.w / sz.h;

			if(this.boxAspect == this.imageAspect){
				//log('boxAspect equal');
				dom.style(this.img.domNode, {
					width:this.widthPercent
				});
			}else if(this.boxAspect > this.imageAspect){
				//log('boxAspect height');
				dom.style(this.img.domNode, {
					height:this.heightPercent
				});
			}else{
				//log('boxAspect width');
				dom.style(this.img.domNode, {
					width:this.widthPercent
				});
			}

			if(this.heightPercent !== '100%'){
				var wasShowing = 1;
				if(!this.showing){
					wasShowing = 0;
					this.show();
				}
				var box = this.img.getActualSize();
				dom.style(this.img.domNode, {
					marginTop:(sz.h-box.h)*.5+'px'
				});
				if(!wasShowing) this.hide();

				//log('box.h:', box.h, 'x', box.w, 'sz.h', sz.h, 'margin', (sz.h-box.h)*.5)
			}
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!this.showing) return;
			this.showing = 0;
			dom.hide(this.domNode);
		},

		onClick: function(){
			// overwrite or connect to me!
		}
	});

});

},
'dx-media/slideshow/Slideshow':function(){
define("dx-media/slideshow/Slideshow", [
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/sniff",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_Container",
	"dojo/io/script",
	"./Photo",
	"dx-alias/on",
	"dx-alias/dom",
	"dx-alias/log",
	'dx-alias/mouse',
	'dx-timer/timer',
	"../mobile/common"
], function(declare, connect, has, _WidgetBase, _TemplatedMixin, _Container, io, Photo, on, dom, logger, mouse, timer, common){

	var log = logger('SLD', 0);

	var isMobile = has("ios") || has("android");

	return declare('dx-media.slideshow.Slideshow', [_WidgetBase, _TemplatedMixin, _Container], {

		templateString:'<div class="dxSlideshow"><div class="dxSlideshowContainer" data-dojo-attach-point="containerNode"></div></div>',
		buttonClass:'',
		media:'',

		// minDragPercent:
		// 	The distance the user must drag the image to qualify as far enough to
		// 	move it the rest of the way. Anything less will be "canceled" and
		// 	moved back to it's original position.
		minDragPercent: isMobile ? .4 : .2,

		postMixInProperties: function(){
			log('JSON:', this.media);
			window.bvCallback = this.onData.bind(this);
			io.get({url:this.media, callbackParamName:'bvCallback', handleAs: "json"});
		},

		onData: function(data){
			//log('data', data);
			this.index = 0;
			this.images = [];
			this.totalLoaded = 0;
			var sz = dom.box(this.domNode);
			data.image.forEach(function(img, i){
				img.index = i;
				img.boxWidth = sz.w;
				img.boxHeight = sz.h;
				var w = new Photo(img);
				this.addChild(w);
				this.images.push(w);
				on(w, 'onImageLoad', this, 'onImageLoad' );
			}, this);
			//log('this.images', this.images);
			this.onResize();
		},

		onImageLoad: function(){
			this.totalLoaded++;
			if(this.totalLoaded == this.images.length){
				this.setup();
			}
		},

		postCreate: function(){


		},

		setup: function(){
			if(!this.getParent()){
				// if has parent, let it do the detecting
				if(isMobile){
					on(common, 'updateOrient', this, 'onResize');
				}else{
					connect.subscribe('/dojox/mobile/screenSize/tablet', this, 'onResize');
					on(window, 'resize', this, 'onResize');
				}
			}
			this.setCurrentImages();
			log('mouse.track')
			mouse.track(this.domNode, this, 'onMouse');
			log('mouse.track done')
		},

		setCurrentImages: function(){
			//log('setCurrentImages', this.index);
			this.images.forEach(function(w){ w.hide(); });
			this.currentImages = [];
			if(this.index > 0){
				this.images[this.index-1].moveTo(-this.width);
				this.currentImages.push(this.images[this.index-1]);
				this.images[this.index-1].show();
			}

			this.images[this.index].moveTo(0);
			this.currentImages.push(this.images[this.index]);
			this.images[this.index].show();

			if(this.index < this.images.length-1){
				this.images[this.index+1].moveTo(this.width);
				this.currentImages.push(this.images[this.index+1]);
				this.images[this.index+1].show();
			}


		},

		onMouse: function(evt){
			//log('onMouse', evt);
			on.stopEvent(evt);
			var m = evt.mouse
			//log(m.type, m.last.x, m);
			if(m.move){
				if(this.moving){
					this.moving = 0;
					this.setCurrentImages();
					this.finishHandler.remove();
				}
				this.dragging = 1;
				this.drag(m.last.x);
			}else if(m.up && this.dragging){

				this.dragging = 0;
				var dir = m.dist.x < 0 ? -1 : 1;
				var legal = (this.index + -dir < this.images.length && this.index + -dir >= 0);

				//log('legal', legal, this.index + -dir, this.index, -dir)

				if(legal && Math.abs(m.dist.x) >= this.minDragPercent * this.width){
					//log('MOVED!')

					this.index += -dir;
					this.moving = 1;
					this.finishHandler = on(this.images[this.index], 'onAniDone', this, function(){
						this.moving = 0;
						this.setCurrentImages();
						this.finishHandler.remove();
					});


					this.currentImages.forEach(function(w){
						w.slideTo(w.orgx + this.width * dir);
					}, this);
				}else{
					//log('CANCELED!')
					this.currentImages.forEach(function(w){
						w.slideTo(w.orgx);
					}, this);
				}


			}
		},

		drag: function(x){
			this.currentImages.forEach(function(w){
				w.drag(x);
			});
		},


		onResize: function(){
			this.onSize(dom.box(this.domNode));

		},

		onSize: function(sz){
			if(!this.images){
				timer(this, function(){
					this.onSize(sz);
				}, 100);
				return;
			}
			this.width = sz.w;
			this.height = sz.h;
			this.images.forEach(function(w){
				w.onSize(sz);
			});
			this.currentImages && this.setCurrentImages();
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!this.showing) return;
			this.showing = 0;
			dom.hide(this.domNode);
		},

		onClick: function(){
			// overwrite or connect to me!
		}
	});

});

},
'dx-alias/mouse':function(){
define("dx-alias/mouse", [
	'dojo/sniff',
	'./lang',
	'./dom',
	'./on',
	'./log',
	'dx-timer/timer'
], function(has, lang, dom, on, logger, timer){

	// TODO: scroll

	var log = logger('MSE', 0);

	var
		CLICKTIME = 400,
		DBLCLICKTIME = 400,
		trackers = {},
		org = {},
		last = {},

		Tracker = function(node, callback){

			this.uid = lang.uid('mouse');
			this.node = node;
			dom.selectable(node, false);
			this.begTime = 0;
			this.callback = callback;
			this.tmr = timer(true);

			this.init();

			on(this.node, 'scroll', function(evt){
				log('scroll', evt.scroll.x, evt.scroll.y)
			});

			this.handle = {
				pause: function(){
					this.dHandle.pause();
				},
				resume: function(){
					this.dHandle.resume();
				},
				remove: function(){
					this.dHandle.remove();
				}
			};
		};

		Tracker.prototype = {

			onEvent: function(evt, type){

				//log('type', type);

				var pos = this.getPos(evt, type);

				var x = pos.x - this.box.x;
				var y = pos.y - this.box.y;
				if(type == 'down'){
					org  = { x:x, y:y };
					last = { x:x, y:y };
				}

				var py = lang.minMax(y/this.box.h, 0, 1);
				var px = lang.minMax(x/this.box.w, 0, 1);

				var cx = this.box.w * px;
				var cy = this.box.h * py;

				evt.mouse = {
					// x/y: the mouse pos on the node
					x:x,
					y:y,

					// cx/cy: the mouse pos on the node, constrained to not
					// be less than zero or greater than the width/height
					cx: cx,
					cy: cy,

					// org: the original x/y that occurred on mousedown
					org:{
						x: org.x,
						y: org.y
					},

					// dist: the distance from the original point
					dist:{
						x: x - org.x,
						y: y - org.y
					},

					// last: distance from the last point
					last:{
						x: x - last.x,
						y: y - last.y
					},

					// px/py: percentage of x/y position across width/height of node
					px:     px,
					py:		py,

					scale:(type == 'zoom') ? evt.scale : 1,

					move:	type=='move',
					down:	type=='down',
					up:		type=='up',
					click:	type=='click',
					zoom:	type=='zoom',
					type:	type,

					dblclick:type=='dblclick'
				};

				if(type == 'move') last = { x:x, y:y };

				this.callback(evt);
			},

			onStart: function(evt){
				log('start', evt);
				var ping = this.tmr.ping();
				//log('beg ping:', ping);
				if(ping > 0 && ping < DBLCLICKTIME){
					this.onEvent(evt, 'dblclick');
					this.tmr.ping(true);
				}else if(ping > DBLCLICKTIME){
					this.tmr.ping(true);
				}
				this.started = 1;
				this.moved = 0;
				this.mHandle.resume();
				this.box = dom.pos(this.node);
				log('start', evt);
				this.onEvent(evt, 'down');
			},
			onMove: function(evt){
				log('move', evt);
				this.moved = 1;
				this.onEvent(evt, 'move');
			},
			onEnd: function(evt){
				if(!this.started) return; // iphone sends cancel without click
				this.started = 0;
				log('end', evt);
				this.mHandle.pause();
				this.onEvent(evt, 'up');

				var ping = this.tmr.ping();
				//log('end ping:', ping);
				if(!this.moved && ping < CLICKTIME){
					this.onEvent(evt, 'click');
				}

			},
			onGestureStart: function(evt){},
			onGestureEnd: 	function(evt){},
			onGesture:	 	function(evt){
				this.onEvent(evt, 'zoom');
			}
		};

		if(has("touch")){
			//
			// Mobile
			//
			Tracker.prototype.init = function(){

				this.dHandle = on.multi(this.node, {
					"touchstart":"onStart",
					"gesturechange":"onGesture",
					"gesturestart":"onGestureStart",
					"gestureend":"onGestureEnd"
				}, this);

				this.mHandle = on.multi(document, {
					"touchend":"onEnd",
					"touchcancel":"onEnd",
					"touchmove":"onMove"
				}, this);
				this.mHandle.pause();

				this.getPos = function(evt, type){
					// on touchend, there are no targetTouches
					if (type=='zoom' || evt.targetTouches.length < 1) return last;

					return {
						x:evt.targetTouches[0].clientX,
						y:evt.targetTouches[0].clientY
					};
				}
			};

		}else{
			//
			// Browser
			//
			Tracker.prototype.init = function(){
				this.dHandle = on(this.node, 'mousedown', this, 'onStart', this.uid);
				this.mHandle = on.multi(document, {
					'mousemove':'onMove',
					'mouseup':'onEnd'
				}, this, this.uid);
				this.mHandle.pause();

				this.getPos = function(evt){
					return {
						x:evt.clientX,
						y:evt.clientY
					};
				};


			};

		}



	var mouse = {
		track: function(node, ctx, scope){
			var callback = lang.bind(ctx, scope);
			var uid = lang.uid('mouse');
			trackers[uid] = new Tracker(node, callback);
			return trackers[uid].handle;
		}
	};

	return mouse;
});

},
'dx-media/video/Mobile':function(){
define("dx-media/video/Mobile", [
	'dojo/_base/declare',
	'dojo/sniff',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dx-alias/dom',
	'dx-alias/string',
	'dx-alias/lang',
	'dx-alias/on',
	'dx-alias/log'
],function(declare, has, _WidgetBase, _TemplatedMixin, dom, string, lang, on, logger){

	var log = logger('MV', 0);
	var showing = 1;

	var TYPES = {
		mp4: 'video/mp4',
		ogv: 'video/ogg',
		webm:'video/webm'
	};

	var Mobile = declare("dx-media.video.Mobile", [_WidgetBase, _TemplatedMixin], {

		templateString:'<video class="${baseClass} dxMobileVideo" src="${src}" controls>',
		baseClass:'',
		width:0,
		height:0,
		poster:"",
		src:"",

		constructor: function(/*Object*/options, node){

			// A properly formed video tag works fine out of the gate.

			if(node){
				node = dom.byId(node);
				if(node.getAttribute('data-dojo-type')){
					var sources = dom.byTag('source', node);
					if(sources && sources.length){
						this.findSource(sources);
						this.src = this.sources[0].src;
					}
				}
			}
		},

		postCreate: function(){
			if(!has("ios")){
				log('NOT IOS')
				on(this.domNode, "click", this, function(){
					log('CLICK')
					this.domNode.play();
				});
			}

			on(this.domNode, "play", this, 'onPlay');
			on(this.domNode, "pause", this, function(){
				this.onPause(this.domNode);
				this.onStop(this.domNode);
			});
			on(this.domNode, "ended", this, function(){
				this.onEnd(this.domNode);
				this.onStop(this.domNode);
			});
		},

		onPreview: function(w, h){
			// we can't get the meta from a mobile video, so we'll go by the size
			// of the preview image
			this.width = w;
			this.height = h;
			this.imageAspect = w / h;
		},

		onSize: function(size){

		},

		onEnd: function(meta){

		},

		onPause: function(meta){

		},

		onStop: function(meta){
			// fired on pause OR end
			console.log(this.domNode.width)
		},

		onPlay: function(meta){
			// warning: unpredictable on the iPhone.
		},

		deriveType: function(filename){
			if(!filename) return null;
			var ext = lang.last(filename.split('.'));
			return TYPES[ext];
		},

		findSource: function(sources){
			this.sources = [];
			sources.forEach(function(node){
				this.sources.push({
					src:dom.get(node, 'src'),
					type:dom.get(node, 'type') || this.deriveType(dom.get(node, 'src'))
				});
			}, this);
			console.log('this.sources:', this.sources);
			return this.sources;
		},

		show: function(){
			if(showing) return;
			showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			if(!showing) return;
			showing = 0;
			dom.hide(this.domNode);
		}
	});

	return Mobile;
});



/*

<video width="320" height="240" controls >
	<source src="SightAndSound.mp4"  type="video/mp4; codecs='avc1.42E01E, mp4a.40.2'"/>
	<source src="SightAndSound.ogv"  type="video/ogg  codecs='theora, vorbis'" />
	<source src="SightAndSound.webm" type="video/webm codecs='vorbis, vp8'" />
</video>

*/

},
'dx-media/vtour/Vtour':function(){
define("dx-media/vtour/Vtour", [
	'dx-alias/shim',
	'dojo/_base/declare',
	'dojo/sniff',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'./VtourCanvas',
	'dx-alias/string',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/mouse',
	'dx-alias/log'

], function(shim, declare, has, _WidgetBase, _TemplatedMixin, VtourCanvas, string, dom, on, mouse, logger){

	var log = logger('VT', 1);

	var adjMouseX = 1;
	var showing = 1;

	return declare('dx-media.vtour.Vtour', [_WidgetBase, _TemplatedMixin], {
		templateString:'<div class="dxVtour"><div data-dojo-attach-point="listNode" class=""></div></div>',
		width:0,
		height:0,
		src:"",
		index:-1,
		autoplay:0,
		loaded:0,
		showing:1,

		postCreate: function(){

			this.vtours = {};

			if(has("ios") || has("android")) adjMouseX = -1;

			var box;
			var getBox = function(node){
				if(!box) box = dom.box(node.parentNode);
				return box;
			}
			if(!this.width) this.width = getBox(this.domNode).w;
			if(!this.height) this.height = getBox(this.domNode).h;

//			dom.style(this.domNode, {width:this.width+'px', height:this.height+'px'});
			dom.style(this.domNode, {width:'100%', height:'100%'});

			this.showing && this.load(this.src);

			var scroller = on(this.domNode, "scroll", this, "onScroll");

			mouse.track(this.domNode, this, 'onMouse');
		},

		onSize: function(size){
			// actually should be all, not just this one
			this.current.onSize(size);
		},

		onMouse: function(evt){
			//log('onMouse', evt);
			on.stopEvent(evt);
			var m = evt.mouse
			//console.log(m.type, m.last.x, m.last.y);
			if(m.move){
				this.push(m.last.x * adjMouseX);
				this.tilt(m.last.y);
			}
			if(m.click) this.stop();
			if(m.zoom) this.zoomTo(m.scale);
		},

		onScroll: function(evt){
			//log('scroll evt:', evt.scroll.x, evt.scroll.y);
			on.stopEvent(evt);
			if(evt.scroll.y){
				this.zoom(evt.scroll.y * -.01);
			}else if(evt.scroll.x){
				this.move(evt.scroll.x * 2);
			}
		},

		play: function(){
			this.current.play();
		},

		stop: function(){
			this.current.stop();
		},

		zoom: function(amount){
			this.current.zoom(amount);
		},
		zoomTo: function(amount){
			this.current.zoomTo(amount);
		},

		move: function(amount){
			this.current.move(amount);
		},

		tilt: function(amount){
			// move up or down
			amount && this.current.tilt(-amount);
		},

		push: function(amount){
			this.current.push(amount);
		},

		load: function(src){
			try{
			var _toggle = 0;
			if(!src || (this.current && this.current.src == src)) return;
			if(this.current) this.current.hide();

			if(this.vtours[src]){
				this.current = this.vtours[src];
				this.current.show();
				return;
			}
			this.index++;
			this.current = new VtourCanvas({
				src:src,
				autoplay:this.autoplay,
				width:this.width,
				height:this.height,
				index:this.index
			});
			this.listNode.appendChild(this.current.domNode);
			this.vtours[src] = this.current;
			}catch(e){console.error('CAUGHT', e)}
		},

		show: function(){
			console.log('show')
			if(showing) return;
			showing = 1;
			dom.show(this.domNode);
		},

		hide: function(){
			console.log('hide')
			if(!showing) return;
			showing = 0;
			this.current.stop();
			dom.hide(this.domNode);
		}
	});

});

},
'dx-alias/shim':function(){
define("dx-alias/shim", function(){

	if(!Function.prototype.bind){
		Function.prototype.bind = function (oThis) {
			// from Mozilla
			if (typeof this !== "function") {
			  // closest thing possible to the ECMAScript 5 internal IsCallable function
			  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var fSlice = Array.prototype.slice,
				aArgs = fSlice.call(arguments, 1),
				fToBind = this,
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP
										 ? this
										 : oThis || window,
									   aArgs.concat(fSlice.call(arguments)));
				};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		}
	}

	if(!([]).forEach){

		Array.prototype.forEach = function(fn, ctx){
			ctx = ctx || window;
			var f = fn.bind(ctx);
			for(var i=0;i<this.length;i++){
				f(this[i], i, this);
			}
		}

		Array.prototype.some = function(fn, ctx){
			ctx = ctx || window;
			var f = fn.bind(ctx);
			var i, len = this.length;
			for(i=0;i<len;i++){
				if(f(this[i], i, this)) return true;
			}
			return false;
		}

		Array.prototype.indexOf = function(elem){
			var i, len = this.length;
			for(i=0;i<len;i++){
				if(this[i] == elem) return i;
			}
			return -1;
		}
	}

	return null; // sets environmental helpers, does not return anything
});

},
'dx-media/vtour/VtourCanvas':function(){
define("dx-media/vtour/VtourCanvas", [
	'dojo/_base/declare',
	'dojo/sniff',
	'dojo/fx/easing',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'../image/Image',
	'dx-alias/lang',
	'dx-alias/dom',
	'dx-alias/on',
	'dx-alias/log',
	'dx-timer/timer'
], function(declare, has, fx, _WidgetBase, _TemplatedMixin, Dimage, lang, dom, on, logger, timer){

	var log = logger('VTC', 0);
	var tmp;
	var Base = function(){};


	var reduceImageSize = function(){
		// Will get attached to the instance (hence use of "this").
		// Reducing image size to the height of the node. This *greatly*
		// improves performance. Note this is conditional, as it cannot be
		// done in older version of FF.
		this.temp = {
			h:this.height,
			w:this.image.w * (this.height/this.image.h)
		}

		this.resampledCanvas = dom('canvas', {
			width:this.temp.w,
			height:this.temp.h
		});
		tmp = this.resampledCanvas.getContext("2d");
		tmp.createImageData(this.temp.w, this.temp.h);
		//console.log('resample', this.image.w, this.image.h, 0, 0, this.temp.w, this.temp.h)
		tmp.drawImage(this.img, 0, 0, this.image.w, this.image.h, 0, 0, this.temp.w, this.temp.h);

		// FIXME:
		// createImageData is supported in FF 3.6, but getImageData is not.

		this.resampledImage = tmp.getImageData(0,0,this.temp.w, this.temp.h);
		//console.log("this.resampledImage", this.resampledImage);
		console.log("resampledImage", this.temp.w, this.temp.h)

		this.image = {
			w:this.temp.w,
			h:this.temp.h
		};
	};

	if(has("ff") && has("ff") < 5){ // older FF does not use a resampled canvas
		Base.prototype = {
			reduceImageSize: function(){},
			draw: function(){
				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					this.ctx.drawImage(this.img, s.fx(offset), s.y, s.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);

				}
			}
		}

	}else if(has("webkit")){ // no sign of this being fixed. Affects Chrome and Safairi.
		Base.prototype = {
			reduceImageSize: reduceImageSize,
			draw: function(){
				var refineParams = function(x, w, iw){
					// not even sure how well this works. I think the floating point inaccuracy of JS is keeping this from preventing errors.
					return (x + w > iw) ?
						{
							w:(x + w) - iw,
							x:x
						} : {
							x:x,
							w:w
						}
				};

				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					o = refineParams(s.fx(offset), s.w, sw);
					//console.log(this.x, this.y, o.x, s.y, o.w, s.h)
					try{
						// catching this for WebKit. Doesn't seem to slow down FF though.
						this.ctx.drawImage(this.resampledCanvas, o.x, s.y, o.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);
					}catch(e){
						//console.error(o.x, o.w)
					}
				}
			}
		}
	}else{ // FF 5+, IE9, Opera, etc
		Base.prototype = {
			reduceImageSize: reduceImageSize,
			isInError:false,
			draw: function(){
				var offset = this.x;
				var sx = 0,
					sy = 0,
					sw = this.image.w,
					sh = this.image.h,

					dx = 0,
					dy = 0,
					dw = this.image.w,
					dh = this.image.h,
					o, s, _x;

					offset = offset || 0; // x-segs, so not a 1x1 pixel

				for(var i=0; i<this.slices.length;i++){
					s = this.slices[i];
					_x = s.fx(offset);
					this.ctx.drawImage(this.resampledCanvas, _x, s.y, s.w, s.h, s.dx*this.zoomed + this.ctrX, s.dy+this.y, s.dw*this.zoomed, s.dh*this.zoomed);
				}
			}
		}
	}


	return declare('dx-media.VtourCanvas', [Base, _WidgetBase, _TemplatedMixin], {
		templateString:'<div style="width:${width}px; height:${height}px"><canvas data-dojo-attach-point="canvas" width="${width}" height="${height}"></canvas></div>',

		x:0,
		y:0,
		width:0,
		height:0,
		src:"",

		zoomed:1,
		scaled: 1.5, // more is more.
		exscale: 1, // the middle portion. Less than 1 shows bg.
		magnify: 1, // smaller is more
		segment:2,  // divisor is equivalent to pixels. Prob needs to fit to image width else may cause problems.

		index:0,
		path:"",
		image:null, 	// params
		img:null, 		// the image node
		temp:null, 		// resampled image data
		resampledImage:null,

		autoplay:0, // TODO: in Flash also
		playing:0,
		showing:1,

		ease:"quad", // quad, cubic, circ - controls the amount of bend
		speed: 3,
		initSpeed: 3,
		maxspeed:30,

		postCreate: function(){
			this.slices = [];

			this.easeOut = fx[this.ease+"Out"];
			this.easeIn = fx[this.ease+"In"];

			this.ctx = this.canvas.getContext("2d");

			this.image = {};
			this.img = dom('img', {
				on:{
					"load": function(evt){
						this.image.w = this.img.width;
						this.image.h = this.img.height;

						log("canvas image loaded", this.image.w, this.image.h);
						this.prepare();
						dom.hide(this.preloader);

						// fix bug in iPhone where after 1 image the subsequent
						// do not appear unless toggled
						if(this.index > 0 && has("touch")){
							this.hide();
							timer(this, 'show', 100);
						}

					}.bind(this),
					"error":function(){
						console.error("Image not found:", this.path);
					}.bind(this)
				}
			});

			this.preloader = dom('div', {css:'dxVtourPreloader', style:{
				width:this.width+'px',
				height:this.height+'px'
			}}, this.domNode);

			this.ani = timer(this, function(){
				this.move(-this.speed, true);
			}, Infinity, 20, 'debug', true, {id:'ani_'+this.index});

			this.src && this.load();

		},

		onSize: function(size){
			if(!this.image || !this.image.w){
				timer(this, function(){
					this.onSize(size);
				}, 100);
				return;
			}
			dom.style(this.domNode, {
				width:size.w+'px',
				height:size.h+'px'
			});

			this.canvas.width = size.w;
			this.canvas.height = size.h;

			this.width = size.w;
			this.height = size.h;

			this.prepareSlices();
		},

		load: function(path){
			dom.show(this.preloader);
			if(path) this.src = path;
			log('load:', this.src.substring(0,50)+'...');
			this.img.src = this.src;
		},

		adjustY: function(){
			if(this.y > 0){
				this.y = 0;
			}else{
				var ph = this.slices[Math.floor(this.slices.length/2)].dh*this.zoomed - this.height;
				if(this.y < -ph){
					this.y = -ph;
				}
			}
		},

		tilt: function(amt){
			if(this.zoomed === 1) return;
			this.y += amt;
			this.adjustY();
			//log("tilt", this.y)
			this.draw();
		},

		move: function(amt, isAni){
			if(!amt) return;
			!isAni && this.stop();
			this.x -= amt;
			if(this.x < 0) this.x += this.image.w;
			this.draw();
		},

		push: function(amount){

			if(amount == "reset"){
				this.speed = 0;
			}else{
				this.speed += (amount*.1);
				if(this.speed < -this.maxspeed) this.speed = -this.maxspeed;
				if(this.speed > this.maxspeed) this.speed = this.maxspeed;
			}
			this.play();
			//log("push:", amount, this.speed, this.x)
		},

		zoom: function(adj){
			adj = adj || 0;
			this.zoomed += adj;
			this.zoomed = lang.minMax(this.zoomed, 1, 3);
			this.ctrX = (this.width - this.zoomed*this.width)/2;
			//console.log("zooom", this.zoomed, "adj:", adj)
			this.adjustY();
			this.draw(this.x);
		},

		zoomTo: function(amount){
			this.zoomed = amount;
			this.zoom();
		},



		scale: function(){
			var e, es, dh, h = this.height;
			for(var i=1, half=this.slices.length/2; i<=this.slices.length;i++){
				var s = this.slices[i-1];
				if(i <= half){
					e = this.easeOut(i/(half));
					es = (this.scaled-this.magnify)*(1-e) + this.exscale;
				}else{
					e = this.easeIn((i-half)/(half));
					es = (this.scaled-this.magnify)*e + this.exscale;
				}
				dh = h * es;

				s.dy = (dh - h) / -2;
				s.dh = dh;
			}
		},

		play: function(){
			log('play index:', this.index);
			if(this.playing) return;
			this.playing = 1;
			if(!this.speed) this.speed = this.initSpeed;
			this.ani.resume();
		},

		stop: function(){
			log('stop! index:', this.index, 'playing:', this.playing);
			if(!this.playing) return;
			this.playing = 0;
			this.ani.pause();
		},

		prepare: function(){
			log('prepare', this.img);
			this.reduceImageSize();
			this.prepareSlices();

			if(this.autoplay) timer(this, 'play', 500);//this.play();
		},

		prepareSlices: function(){
			var amount = this.width / this.segment;
			var seg = this.width / amount / 1; // width of each slice.
			this.slices = [];
			var x = 0, h = this.height, iw = this.image.w;
			var e, es, dh;

			for(var i=1, half = amount/2; i<=amount; i++){

				var s ={
					x:x,
					y:0,
					w:seg,
					h:this.image.h,

					dx: x,
					dw: seg
				};

				(function(){
					var _x = x;
					s.fx = function(offset){
						return (_x + offset)%iw;
					}
				})();

				this.slices.push(s);
				x += seg;
			}

			this.zoom();
			this.scale();
			this.draw();
		},

		show: function(){
			if(this.showing) return;
			this.showing = 1;
			dom.show(this.domNode);
			this.wasPlaying && this.play();
		},

		hide: function(){
			if(!this.showing) return;
			this.showing = 0;
			this.wasPlaying = this.playing;
			this.stop();
			dom.hide(this.domNode);
		}
	});

});

}}});

require(["dojo/i18n"], function(i18n){
i18n._preloadLocalizations("dx-media/nls/layer", []);
});
define("dx-media/layer", [], 1);
