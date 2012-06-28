define([
	"dojo/_base/declare",
	"dx-alias/Widget",
	"dx-alias/has",
	"dx-alias/dom",
	"dx-alias/lang",
	"dx-alias/log",
	"dx-timer/timer"
], function(declare, Widget, has, dom, lang, logger){

	var log = logger('TIP', 0);

	var isIE = has('ie') < 9;

	return declare('dx-media.controls.elements.Tooltip', [Widget], {

		templateString:  '<div class="dxTooltip"></div>',

		x:0,
		y:0,
		width:0,
		height:0,

		// child: Dijit constructor Class
		// 		A widget to be added to the tooltip
		Child:null,

		// child: Dijit constructor instance
		// 		The widget that has been added to the tooltip
		child:null,

		// positionNode:DomNode
		// 		The node the tooltip will be poiting to
		positionNode:null,

		// align: String
		// 		options: left, center, right
		// 		puts tip in position of align
		align:'left',

		text:"", // not implemented

		postMixInProperties: function(){
			this.tranform = has('transform');

			this.useCanvas = !isIE;

			log('this.tranform', this.tranform);

		},

		postCreate: function(){
			if(this.useCanvas){
				this.canvas = dom('canvas', {}, this.domNode);
			}else{
				this.node = dom('div', 'dxTooltipBubble', this.domNode);
				this.tip = dom('div', 'dxTooltipTip', this.node);
			}
			if(!this.domNode.parentNode) document.body.appendChild(this.domNode);
			this.render();
			if(this.Child){
				this.containerNode = dom('div', 'dxTooltipContainer', this.domNode);
				this.child = new this.Child();
				this.containerNode.appendChild(this.child.domNode);
			}
		},

		position: function(tipx, tipy){
			var x, y;
			if(this.positionNode){
				var pos = dom.pos(this.positionNode);
				x = pos.x + pos.w/2 - tipx;
				y = pos.y - 5 - tipy - this.height;
			}else{
				x = this.x;
				y = this.y;
			}

			dom.style(this.domNode, {
				top:y+'px',
				left:x+'px'
			});
		},

		setSize: function(marginLeft, marginBottom){
			this.canvas.width = this.width + 5 + (marginLeft || 0);
			this.canvas.height = this.height + (marginBottom || 0);
		},

		render: function(){
			if(!this.useCanvas) return this.renderDom();
			var ctx = this.canvas.getContext('2d');

			var x = 5, y = 0, r = 3, w = this.width, h = this.height;

			var shadow = 3;

			var tipg = 20, tipw = 20, tiph = 10, tipx = this.align == 'left' ? tipg : this.align == 'right' ? w - tipg - tipw : w/2 - tipw/2;

			this.setSize(shadow, shadow+tiph);

			//ctx.globalCompositeOperation = 'source-out'
			ctx.beginPath();

			ctx.shadowOffsetX = -shadow;
			ctx.shadowOffsetY = shadow;
			ctx.shadowBlur = shadow;
			ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

			ctx.strokeStyle = "rgba(255,255,255,1)";
			ctx.fillStyle = "rgba(0,0,0,0.5)";


			ctx.moveTo(x, y+h/2);

			ctx.arcTo(x, y+h, x+r, y+h, r);

			ctx.lineTo(x+tipx, y+h);
			ctx.lineTo(x+tipx+tipw/2, y+h+tiph);
			ctx.lineTo(x+tipx+tipw, y+h);

			ctx.arcTo(x+w, y+h, x+w, y+h-r, r);

			ctx.arcTo(x+w, y, x+w-r, y, r);


			//ctx.lineTo(x+w, y+h);
			//ctx.lineTo(x+w, y);
			//ctx.lineTo(x,y);

			ctx.lineTo(x+r,y);
			ctx.arcTo(x, y, x, y+r, r);

			ctx.lineTo(x, y+h/2);

			ctx.stroke();
			ctx.closePath();
			ctx.fill();

			this.position(tipx+tipw/2, tiph);

			return null;
		},

		renderDom: function(){
			var x = 20, y = 20, r = 3, w = this.width, h = this.height;
			var tipg = 20, tipw = 20, tiph = 10, tipx = this.align == 'left' ? tipg : this.align == 'right' ? w - tipg - tipw : w/2 - tipw/2;
			dom.style(this.node, {
				width:w+'px',
				height:h+'px'
			});
			dom.style(this.tip, {
				top:h+'px',
				left:tipx+'px'
			});

			this.position(tipx+tipw/2, tiph);
		}
	});
});
