// summary:
//		A collection of methods for sizing, resizing and positioning dom nodes.
// description:
//		A collection of methods used to size/resize dom nodes off-screen so that
//		dimensions can be calculated and tweaked.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/query",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom-geometry"
], function(
	domConstr, domStyle, domAttr, $, on, lang, domGeom
){
	"use strict";
	
	
	var construct = {
		"hiddenNode": false,
		
		_createHiddenNode: function(){
			var body = $("body");
			var node = domConstr.create("div",{
				"style":{
					"visibility":"hidden",
					"overflow":"hidden",
					"position":"absolute",
					"left":"0px",
					"top":"0px",
					"height":"1000px",
					"width":"1000px"
				}
			},body[0]);
			
			return node;
		},
		
		getImageDimensions: function(src, callback, errorCallback){
			// summary:
			//		Calculate the dimensions of an image.
			// description:
			//		Calculate the dimensions of an image by supplying the
			//		url of the image.  Since the image has to load first a
			//		callback function is provided.
			// tags:
			//		public
			// src: string
			//		The url to load the image from (relative urls are normally
			//		allowed dependant on browser).
			// callback: function
			//		The callback function for height & width.  Function supplies
			//		one parametre as an object,
			//		object.width integer
			//			The image width.
			//		object.height integer
			//			The image height.
			//		object.node object XMLNode
			//			The image node
			// errorCallback: function|undefined
			//		Optional function called when image cannot be loaded.  The
			//		error object is passed to the function.
			
			var image = new Image();
			
			on(image, "load", function(id){
				callback({
					"node": image,
					"width": image.width,
					"height": image.height
				});
			});
			
			if(errorCallback != undefined){
				on(image, "error", function(error){
					errorCallback(error);
				});
			}
			
			image.src = src;
		},
		
		scaleNode: function(node, width, height, scaleUp, boxType){
			// summary:
			//		Calculated node scaling to fit it within a box size
			//		without distorting.
			// description:
			//		Calculate the width and height scaling for a node to fit
			//		it within a box-size without distorting the aspect-ratio.
			//		Will not scale the node values up unless scaleUp is set to
			//		true. Useful for scaling images without distortion.
			// tags:
			//		public
			// node: object XMLNode
			//		The node to calculate scaling on.
			// width: integer|object
			//		The width to scale to.  If object, assume
			//		object.width|object.w integer
			//			The width to scale to.
			//		object.height|object.h integer
			//			The height to scale to.
			// height: integer|undefined
			//		The height to scale to.
			// scaleUp: boolean|undefined
			//		Defaults to false meaning nodes are only scaled down
			//		and not up.
			// boxType: string|undefined
			//		Defaults to content.  Which box are we resizing (content|
			//		padding|border|margin).
			// returns: object
			//		object.width integer
			//		object.height integer
			
			var resizeDi = {};
			if(typeof width === "object"){
				resizeDi = width;
				boxType = ((scaleUp == undefined) ? "content" : scaleUp);
				scaleUp = ((height == undefined) ? false : height);
				if(typeof scaleUp === "string"){
					boxType = scaleUp;
					scaleUp = false;
				}
				
				if(resizeDi.hasOwnProperty("width")) {
					resizeDi.w = resizeDi.width;
				}
				if(resizeDi.hasOwnProperty("height")) {
					resizeDi.h = resizeDi.height;
				}
			}else{
				resizeDi.w = width;
				resizeDi.h = height;
				
				boxType = ((boxType == undefined) ? "content" : boxType);
				if(typeof scaleUp === "string"){
					boxType = scaleUp;
					scaleUp = false;
				}else{
					scaleUp = ((scaleUp == undefined) ? false : scaleUp);
				}
			}
			
			var nodeDi = construct.getNodeBoxDimensions(node);
			
			return construct._scaleNode(
				nodeDi, resizeDi, scaleUp, boxType
			);
		},
		
		_scaleNode: function(nodeDi, resizeDi, scaleUp, boxType){
			// summary:
			//		Calculated node scaling to fit it within a box size
			//		without distorting.
			// description:
			//		Calculate the width and height scaling for a node to fit
			//		it within a box-size without distorting the aspect-ratio.
			//		Will not scale the node values up unless scaleUp is set to
			//		true. This is the internal private represenation of the
			//		scaleNode method.  This method is strict in parametres it
			//		will allow, whereas scaleNode is more flexible.  scaleNode
			//		will calculate parametres and pass to this private function
			//		for calculation.
			// tags:
			//		private
			// nodeDi: object
			//		The dimensions of the node to scale in format,
			//		object.width integer
			//		object.height integer
			// resizeDi: object
			//		The dimensions to scale node within, in format,
			//		object.width integer
			//		object.height integer
			// scaleUp: boolean
			//		Allow upscaling of image?
			// returns: object
			//		object.width integer
			//		object.height integer
			
			var box = nodeDi;
			nodeDi = nodeDi[boxType];
			var aspect = (nodeDi.w/nodeDi.h);
			var height = resizeDi.h;
			var width = resizeDi.w;
			
			if((resizeDi.w > nodeDi.w) && (resizeDi.h > nodeDi.h) && (!scaleUp)){
				width = nodeDi.w;
				height = nodeDi.h;
			}else if(nodeDi.w > nodeDi.h){
				height = resizeDi.w / aspect;
			}else if(nodeDi.w < nodeDi.h){
				width = resizeDi.h * aspect;
			}else if(nodeDi.w == nodeDi.h){
				if(resizeDi.h > resizeDi.w){
					height = resizeDi.w;
				}else if(resizeDi.h < resizeDi.w){
					width = resizeDi.h;
				}
			}
			
			var contentWidth = width;
			var contentHeight = height;
			if(boxType == "margin"){
				contentWidth -= (box.margin.l+box.margin.r+box.border.l+box.border.r+box.padding.l+box.padding.r);
				contentHeight -= (box.margin.t+box.margin.b+box.border.t+box.border.b+box.padding.t+box.padding.b);
			}else if(boxType == "border"){
				contentWidth -= (box.border.l+box.border.r+box.padding.l+box.padding.r);
				contentHeight -= (box.border.t+box.border.b+box.padding.t+box.padding.b);
			}else if(boxType == "padding"){
				contentWidth -= (box.padding.l+box.padding.r);
				contentHeight -= (box.padding.t+box.padding.b);
			}
			
			return {
				"width": width,
				"height": height,
				"contentWidth": contentWidth,
				"contentHeight": contentHeight
			};
		},
		
		getNodeDimensions: function(node){
			// summary:
			//		Get the dimensions of a node.
			// description:
			//		Get the dimensions of a node.  Works more consistantly with
			//		images as there is no reliance on getComputedStyle, which
			//		can give different results on different browsers.  Also,
			//		getComputedStyle is known to be slow, hence getting an image
			//		size is also quicker.
			// tags:
			//		public
			// todo:
			//		Make work with dijits (using dijit.domNode?)
			// node: object XMLNode|dijit/_WidgetBase
			//		The node to get the dimensions of (will also accept a
			//		widget and try to find the container node).
			// returns: object
			//		object.width integer
			//		object.height integer
			
			var di = construct.getNodeBoxDimensions(node);
			return {"width": di.margin.w, "height": di.margin.h};
		},
		
		_getNodeFromObject: function(node) {
			if(!node.tagName){
				if(node.hasOwnProperty("domNode")){
					node = node.domNode;
				}
			}
			
			return node;
		},
		
		insertNodeAtProportion: function(node, container, proportion){
			// summary:
			//		Insert a node within another node at the specified position
			//		from the node start.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to insert.
			// container: object XMLNode
			//		Node to insert into.
			// proportion: float
			//		The proportion through the text-node to insert at.
			//		(default: 0.5).
			
			if((node == null) || (container == null)){
				return false;
			}
			
			proportion = ((proportion == undefined) ? 0.5 : proportion);
			var at = this._calcNodeInsertPoint(container, proportion);
			
			domConstr.place(
				node, container.childNodes[0].splitText(at), 'before'
			)
		},
		
		_calcNodeInsertPoint: function(node, proportion){
			// summary:
			//		Calculate the insert point for an node within a text-node.
			// description:
			//		Calculate where to insert a node within a text-node so
			//		that it appears a specified point within the text (default
			//		is 0.25).  Usually used for inserting images
			//		in a paragraph.
			// tags:
			//		private
			// node: object XMLNode
			//		The text-node to calculate the insertion point of.
			// proportion: float
			//		The proportion through the text-node to insert at.
			//		(default: 0.5).
			// returns: integer
			//		The insert point.
			
			proportion = ((proportion == undefined) ? 0.5 : proportion);
			var text = this._getNodeText(node);
			var at = Math.round(text.length * proportion);
			
			var character = ''
			while((character != ' ') && (at > 0)){
				character = text.substr(at,1);
				at--;
			}
			
			return at;
		},
		
		_getNodeText: function(node){
			// summary:
			//		Get the text content of a node (regardless of browser).
			// tags:
			//		private
			// node: Object XML
			//		The XML element node you want the text content of.
			// returns: String
			
			if((node == null) || (node == undefined)){
				return ""
			}else if(node.textContent){
				return node.textContent;
			}else if(node.text){
				return node.text;
			}else if(node.innerText){
				return node.innerText;
			}else{
				return "";
			}
		},
		
		getNodeBoxDimensions: function(node, comStyle){
			node = construct._getNodeFromObject(node);
			
			if(this._getParentNode(node) === null){
				return this._getNodeBoxDimensions2(node);
			}else{
				comStyle = ((comStyle == undefined) ? domStyle.getComputedStyle(node) : comStyle);
				return this._getNodeBoxDimensions1(node, comStyle);
			}
		},
		
		_getNodeBoxDimensions1: function(node, comStyle){
			var position = domGeom.position(node, true);
			var paddingDi = domGeom.getPadExtents(node, comStyle);
			var borderDi = domGeom.getBorderExtents(node, comStyle);
			var marginDi = domGeom.getMarginExtents(node, comStyle);
			
			var box = {
				"margin": lang.mixin(marginDi, {
					"x1": (position.x-marginDi.l),
					"x2": (position.x+position.w+marginDi.r),
					"y1": (position.y-marginDi.t),
					"y2": (position.y+position.h+marginDi.b),
					"w": (position.w+marginDi.l+marginDi.r),
					"h": (position.h+marginDi.t+marginDi.b)
				}),
				"padding": lang.mixin(paddingDi, {
					"x1": (position.x+borderDi.l),
					"x2": (position.x+position.w-borderDi.r),
					"y1": (position.y+borderDi.t),
					"y2": (position.y+position.h-borderDi.b),
					"w": (position.w-borderDi.l-borderDi.r),
					"h": (position.h-borderDi.t-borderDi.b)
				}),
				"border": lang.mixin(borderDi, {
					"x1": position.x,
					"x2": (position.x+position.w),
					"y1": position.y,
					"y2": (position.y+position.h),
					"w": position.w,
					"h": position.h
				}),
				"content": {
					"x1": (position.x+borderDi.l+paddingDi.l),
					"x2": (position.x+position.w-borderDi.r-paddingDi.r),
					"y1": (position.y+borderDi.t+paddingDi.t),
					"y2": (position.y+position.h-borderDi.b-paddingDi.b),
					"w": (position.w-borderDi.l-borderDi.r-paddingDi.l-paddingDi.r),
					"h": (position.h-borderDi.t-borderDi.b-paddingDi.t-paddingDi.t)
				}
			};
			
			return box;
		},
		
		_getNodeBoxDimensions2: function(node){
			var sizeTemplate = {
				"x1": 0, "x2": 0, "y1": 0, "y2": 0,
				"h": 0, "w": 0,
				"l": 0, "r": 0, "b": 0, "t":0
			}
			
			if(node.width || node.height){
				sizeTemplate.w = node.width;
				sizeTemplate.h = node.height;
			}
			
			return {
				"margin": lang.clone(sizeTemplate),
				"padding": lang.clone(sizeTemplate),
				"border": lang.clone(sizeTemplate),
				"content": lang.clone(sizeTemplate)
			}
		},
		
		resizeText: function(node){
			
		},
		
		_getParentNode: function(node){
			// summary:
			//		Get the node parent, no-matter, which browser is being used.
			// tags:
			//		private
			// node: Object XMLNode
			//		Node to get parent of.
			// returns: Object
			
			try{
				return node.parentNode;
			}catch(e){
				try{
					return node.parentElement;
				}catch(e){
					return null;
				}
			}
		}
	};
	
	if(!construct.hiddenNode){
		construct.hiddenNode = construct._createHiddenNode();
	}
	
	return construct;
});