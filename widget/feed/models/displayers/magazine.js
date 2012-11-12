// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"./_displayer!../../views/magazine/magazine.html",
	"dijit/layout/StackContainer",
	"dijit/layout/ContentPane",
	"../magazine/pageSelector",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/_base/lang"
], function(
	declare, _displayer, stack, pane, selector, domAttr, domConstr,
	domGeom, domStyle, domClass, lang
){
	"use strict";
	
	var construct = declare([_displayer], {
		"boxWidth": 0,
		"boxHeight": 0,
		
		"_stack": {},
		"_panes": [],
		"_selector": {},
		"_currentPane": -1,
		"_marginHorz": 20,
		"_marginVert": 20,
		"_articles": [],
		"_articlesPerPage": 0,
		"_widgetNumber": 0,
		
		constructor: function(config){
			this._init(config);
		},
		
		_init: function(config){
			this._initStyle();
			this._build();
		},
		
		_initStyle: function(){
			this._setBoxSizes();
			this._articlesPerPage = this.config.rows * this.config.cols;
		},
		
		_setBoxSizes: function(){
			var dimensions = this._getDimensions(this.domNode);
			
			this.boxWidth = parseInt(((dimensions.width - (this._marginHorz*(this.config.cols-1))) / this.config.cols),10);
			this.boxHeight = parseInt(((dimensions.height - (this._marginVert*this.config.rows) - 20) / this.config.rows),10);
		},
		
		_build: function(){
			this._stack = new stack({
				"class":"simpoWidgetMagazine"
			});
			domConstr.place(this._stack.domNode,this.domNode);
			this._selector = new selector({});
			domConstr.place(this._selector.domNode,this.domNode,"last");
			this._addPane(0);
		},
		
		_addPane: function(id){
			this._currentPane++;
			var paneObj = new pane({
				"class": "simpoWidgetMagazinePane"
			});
			
			this._stack.addChild(paneObj);
			this._panes.push(paneObj);
			this._selector.add(this._stack, paneObj);
		},
		
		_setMargins: function(widgetNode){
			if(!this._marginsCalculated){
				var marginBox = this._getMarginDimensions(widgetNode);
				var contentBox = this._getDimensions(widgetNode);
				
				this._marginHorz = parseInt(((marginBox.width - contentBox.width)/2),10);
				this._marginVert = parseInt(((marginBox.height - contentBox.height)/2),10);
				
				domStyle.set(widgetNode, {
					"height":this.boxHeight+"px",
					"width":this.boxWidth+"px"
				});
				
				this._marginsCalculated = true;
			}
		},
		
		update: function(object, pos){
			if(object.hasOwnProperty("widget")){
				//var readyFunc = function(){
					var widgetNode = object.widget.domNode;
					this._styleWidget(widgetNode);
				
					this._articles.push(widgetNode);
				
					var id = ((this._articles.length-1) % this._articlesPerPage);
					if((id == 0) && (this._articles.length != 1)){
						this._addPane(id);
					}
				
					this._placeWidget(widgetNode, object.widget, id);
					this._stack.selectChild(this._panes[this._panes.length-1]);
					this._stack.selectChild(this._panes[0]);
				//}
				
				//object.widget.addOnReady(lang.hitch(this, readyFunc));
			}
			
		},
		
		_placeWidget: function(widgetNode, widget, id){
			domClass.add(widgetNode,"dojoSimpoWidgetFeedArticleBox"+id);
			domConstr.place(
				widgetNode,
				this._panes[this._currentPane].domNode
			);
			widget._setTransparentBackground();
		},
		
		_styleWidget: function(widgetNode){
			var dimensions = domGeom.getMarginBox(widgetNode);
			
			domStyle.set(widgetNode,{
				"height":this.boxHeight+"px",
				"width":this.boxWidth+"px"
			});
		},
		
		_getDimensions: function(node){
			// summary:
			//		Get the dimensions of a node.
			// node: object XMLNode
			//		The node to get the dimensions of.
			// returns: object
			//		The dimension of the object, in the format:
			//		{width:<WIDTH>,height:<HEIGHT>}.
			
			var dimensions = domGeom.getContentBox(node);
			if((dimensions.h == 0) && (dimensions.w == 0)){
				dimensions = {'h':node.height,'w':node.width};
			}
			
			return {'height':dimensions.h,'width':dimensions.w};
		},
		
		_getMarginDimensions: function(node){
			// summary:
			//		Get the margin dimensions of a node.
			// node: object XMLNode
			//		The node to get the dimensions of.
			// returns: object
			//		The dimension of the object, in the format:
			//		{width:<WIDTH>,height:<HEIGHT>}.
			
			var dimensions = domGeom.getMarginBox(node);
			if((dimensions.h == 0) && (dimensions.w == 0)){
				dimensions = {'h':node.height,'w':node.width};
			}
			
			return {'height':dimensions.h,'width':dimensions.w};
		}
	});
	
	return construct;
});