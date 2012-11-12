define([
    "dojo/_base/declare",
	"dijit/_Widget",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/_base/lang",
	"dojo/_base/xhr",
	"dojo/dom-style",
	"dojo/_base/array",
	"dojo/dom-construct",
    "dojo/dom-class",
	"dojo/_base/connect",
	"dojo/dom-geometry",
	"dojox/timing",
	"dojox/layout/ContentPane"
], function(
    declare, _widget, fx, coreFx, lang, xhr,
	domStyle, array, domConstruct, domClass, connect, domGeo,
    timer, contentPane
){
    
    "use strict";
	var construct = declare("simpo.widget.scroller",[_widget],{
		'-chains-': {'buildRendering':'after'},
        
		'src':'',
		'period':0,
		'duration':0,
		'slidewidth':0,
		'slideheight':0,
		'showslides':0,
		'width':0,
		'height':0,
		'gap':5,
		'direction':'random',
		
		'_slides':[],
		'_current_scroll':{},
		'_current_side_no':0,
		'_slide_html':[],
		
		postMixInProperties: function() {
			this._initInts();
			this._initDimensions();
			this._initDirection();
		},
        
        buildRendering: function() {
            domClass.add(this.domNode,'dojoxrcbcscroller');
			this._styleSchollerContainer();
			this._loadFeedContents();
		},
		
		_initInts: function() {
			this.period = parseInt(this.period,10);
			this.duration = parseInt(this.duration,10);
			this.slideheight = parseInt(this.slideheight,10);
			this.slidewidth = parseInt(this.slidewidth,10);
			this.showslides = parseInt(this.showslides,10);
			this.gap = parseInt(this.gap,10);
		},
		
		_initDimensions: function() {
			this.height = this.slideheight;
			this.width = ((this.slidewidth*this.showslides)+(this.gap*this.showslides));
		},
		
		_initDirection: function() {
			this.direction = lang.trim(this.direction.toLowerCase());
			this.direction = ((this.direction=='')?'right':this.direction);
			this.direction = ((this.direction=='random')?this._pickRandomItem(['left','right']):this.direction);
			this.direction = ((this.direction=='left')?'left':'right');
		},
		
		_styleSchollerContainer: function() {
			domStyle.set(this.domNode,{
				'height':this.height+'px',
				'width':this.width+'px',
				'position':'relative',
				'overflow':'hidden'
			});
		},
		
		_loadFeedContents: function() {
			xhr.get({
				"url": this.src,
				handleAs: "json",
				preventCache: true,
				load: lang.hitch(this,this._feedLoaded)
			});
		},
		
		_feedLoaded: function(data) {
			this._createSlides(data);
			this._setScrollTimer();
		},
		
		_createSlides: function(data) {
			array.forEach(data,function(item,index) {
				var slide = this._createSlideContainer(index);
				slide.set('href',item);
				this._slides[index] = slide;
				this._current_side_no = index;
			},this);
		},
		
		_createSlideContainer: function(index) {
			var slide = new contentPane({'class':'dojoxrcbcscrollerslide'});
			slide.placeAt(this.domNode,'last');
			this._styleSlideContainer(slide.domNode,index);
			return slide;
		},
		
		_styleSlideContainer: function(node,index) {
			domStyle.set(node,{
				'position':'absolute',
				'width':this.slidewidth+'px',
				'height':this.slideheight+'px',
				'left':((this.slidewidth*index)+((index+1)*this.gap))+'px',
				'top':'0px',
				'overflow':'hidden'
			});
			
			return node;
		},
		
		_setScrollTimer: function() {
			this._current_scroll = new timer.Timer(this.period);
			this._current_scroll.onTick = lang.hitch(this,this._slide);
			this._current_scroll.start();
		},
		
		_slide: function () {
			if (this.direction=='right') {
				this._moveNextSlideToBeginning();
			}
			this._advanceSlideCounter();

			var animation = new Array();
			array.forEach(this._slides,function(slide) {
				animation.push(this._createSlideAnimation(slide));
			},this);
			
			var ani = coreFx.combine(animation);
			if (this.direction=='left') {
				ani.onEnd = lang.hitch(this,this._moveLastSlideToEnd);
			}
			ani.play();
		},
		
		_moveNextSlideToBeginning: function() {
			domStyle.set(
				this._slides[this._current_side_no].domNode,
				{left:'-'+this.slidewidth+'px'}
			);
		},
		
		_moveLastSlideToEnd: function() {
			domStyle.set(
				this._slides[this._current_side_no].domNode,
				{left:(((this.slidewidth+this.gap)*(this._slides.length-1))+this.gap)+'px'}
			);
		},
		
		_advanceSlideCounter: function() {
			if (this.direction=='right') {
				this._current_side_no--;
			} else if (this.direction=='left') {
				this._current_side_no++;
			}
			
			if (this._current_side_no < 0) {
				this._current_side_no = (this._slides.length-1);
			} else if (this._current_side_no >= this._slides.length) {
				this._current_side_no = 0;
			}
		},
		
		_createSlideAnimation: function(slide) {
			var coords = this._coords(slide.domNode);
			var start = coords.l;
			var end = this._calcAnimationLeftEnd(coords);
			
			var animation = fx.animateProperty({
				'node': slide.domNode,
				'duration': this.duration,
				'properties':{'left':{'start':start,'end':end}
				}
			});
			
			return animation;
		},
		
		_calcAnimationLeftEnd: function(coords) {
			var end = coords.l;
			
			if (this.direction=='right') {
				end = coords.w+coords.l;
			} else if (this.direction=='left') {
				end = coords.l-coords.w;
			}
			
			return end;
		},
		
		_coords: function(node) {
			return domGeo.getMarginBox(node);
		},
		
		_getRndomNo: function(from,to) {
            // summary:
			//      Get a random number (integer) between two numbers.
			// from: integer
			//      Start for range of possibilities for random numbers.
			// to: integer
			//      End for range of possibilities for random numbers.
            // returns: integer
            
            return Math.floor(Math.random() * (to - from + 1) + from);
        },
		
		_pickRandomItem: function(ary) {
			var n = this._getRndomNo(0,(ary.length-1));
			
			return ary[n];
		}
	});
    
    return construct;
});