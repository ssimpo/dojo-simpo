// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"simpo/colour",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/dom-construct",
	"dojox/timing",
	"dojo/_base/lang",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/_base/array"
], function(declare, _widget, _templated, colour, domStyle, domGeo,domConstruct, timer, lang, fx, coreFx, array) {
    
    var construct = declare("simpo.widget.slideShow",[_widget,_templated],{
		templateString:'<div class="dojoSimpoWidgetSlideshow" data-dojo-attach-point="container"></div>',
		height:0,
		width:0,
		images:['images/slideshow/1.jpg','images/slideshow/2.jpg','images/slideshow/3.jpg','images/slideshow/4.jpg'],
		
		_img:{},
		_currentImage:0,
		_timer:{},
		_imageNodes:[],
		
		buildRendering: function() {
			this.inherited(arguments);
			
			this._hiddenDiv = domConstruct.create("div",{'style':{'visibility':'hidden','width':'0px','height':'0px','overflow':'hidden'}});
			
			var marginBox = domGeo.getMarginBox(this.container);
			array.forEach(this.images,function(src,n){
				this._imageNodes[n] = domConstruct.create("img",{
					'src':src,
					'width':'960px',
					'height':'650px',
					'alt':'Ignite Images'
				});
			},this);
			
			domConstruct.place(this._imageNodes[this._currentImage],this.container);
			this._timer = new timer.Timer(5000);
			this._timer.onTick = lang.hitch(this,this.next);
			this._timer.start();
			
			domConstruct.create("img",{
				'src':'images/fulllogo.png',
				'width':'400px',
				'alt':'Ignite Logo',
				'style':{'position':'absolute','top':'50px','left':'500px','opacity':'0.9'}
			},this.container);
			
			domConstruct.create("div",{
				'style':{'position':'absolute','top':'100px','left':'500px','opacity':'0.9','color':'#7799ff','innerHTML':'Saturday 16 May 2012 - 7:30pm','fontSize':'3em'}
			},this.container);
		},
		
		next: function() {
			domConstruct.place(this._imageNodes[this._currentImage],this._hiddenDiv);
			this._currentImage++;
			if (this._currentImage >= this.images.length) {
				this._currentImage = 0;
			}
			domConstruct.place(this._imageNodes[this._currentImage],this.container);
		}
	});
    
    return construct;
});