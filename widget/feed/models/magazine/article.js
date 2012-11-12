// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/magazine/article.html",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/_base/array",
	"dojo/dom-geometry",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/dom-style",
	"dojo/_base/lang",
	"lib/pnglib",
	"simpo/dom-tools"
], function(
	declare, _base, domAttr, domConstr, array, domGeom, $,
	nodeList, domStyle, lang, pnglib, domTools
){
	"use strict";
	
	var construct = declare([_base], {
		"_images": [],
		"imagePosition": 0.25,
		
		"_imageInserted": false,
		"_hiddenNode": {},
		"padding": 20,
		"_thumbWidth": 0,
		"_thumbHeight": 0,
		
		"thumbWidthFactor": 0.4,
		"thumbHeightFactor": 0.3,
		
		"ready": false,
		"_readyFuncs": [],
		
		postCreate: function(){
			this._init();
		},
		
		_init: function(){
			if(this.hasOwnProperty("displayer")){
				domStyle.set(this.container, {
					"height":this.displayer.boxHeight+"px",
					"width":this.displayer.boxWidth+"px",
                    "minHeight":this.displayer.boxHeight+"px",
					"minWidth":this.displayer.boxWidth+"px",
                    "maxHeight":this.displayer.boxHeight+"px",
					"maxWidth":this.displayer.boxWidth+"px"
				});
			}
			
			domConstr.place(this.domNode,domTools.hiddenNode);
			
			this._thumbWidth = Math.round(
				this.thumbWidthFactor*this.displayer.boxHeight
			);
			this._thumbHeight = Math.round(
				this.thumbHeightFactor*this.displayer.boxWidth
			);
			
			this._getImages(lang.hitch(this, this._build));
		},
		
		_build: function(){
			this._initContent();
			this._scaleImageAndText(this.articleContentNode, this.description);
			this.ready = true;
			this._runReadyFuncs();
		},
		
		redraw: function(){
			if(this.ready){
				domAttr.set(
					this.articleContentNode, "innerHTML", this.description
				);
				this._scaleImageAndText(this.articleContentNode, this.description);
			}
		},
		
		_initContent: function(){
			// summary:
			//		Ininitiate the article content.
			// tags:
			//		private
			
			domAttr.set(this.titleNode, "innerHTML", this.category[0].value);
			domAttr.set(this.contentTitleNode, "innerHTML", this.title);
			domAttr.set(this.readMoreNode, "href", this.link);
			domAttr.set(this.articleContentNode, "innerHTML", this.description);
		},
		
		addOnReady: function(func){
			this._readyFuncs.push(func);
			if(this.ready){
				this._runReadyFuncs();
			}
		},
		
		_runReadyFuncs: function(){
			array.forEach(this._readyFuncs, function(func){
				func();
			}, this);
		},
		
		_setTransparentBackground: function(){
            var node = this.contentBoxNode;
			var comStyle = domStyle.getComputedStyle(node);
			if(comStyle.opacity != 1){
				var alpha = ((comStyle.opacity * 100) * (255/100));
				var color = this._getRGB(comStyle.backgroundColor);
				domStyle.set(node,"opacity",1);
				
				var png = new pnglib({'width':1, 'height':1, 'depth':1});
				png.color(color.r,color.g,color.b,alpha);
				//domStyle.set(
					//node, {
                    //"background":'url(data:image/png;base64,'+png.getBase64()+')'
                //});
                
                console.log('url(data:image/png;base64,'+png.getBase64()+')');
			}
		},
		
		_getRGB: function(colorTxt){
			// summary:
			//		Get an rgb array from css text.
			// description:
			//		Take input text akin to "rgb(r,g,b)" and convert into an
			//		array with 3 numeric values equal to [r,g,b]
			// tags:
			//		private
			// colorTxt: string
			//		The color value to convert.
			// returns: array
			
			colorTxt = colorTxt.replace(/\(|\)|rgb| /g,"");
			var color = colorTxt.split(",");
			
			return {
				"r": color[0],
				"g": color[1],
				"b": color[2]
			}
		},
		
		_scaleImageAndText: function(node, text){
			// summary:
			//		Resize the text and images so the fit correctly on-screen.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to scale text within.
			// text: string
			//		Text to place in the node.
			
			this._resizeText(node, text);
			if(this._images.length > 0){
				this._insertImage(node);
				this._imageInserted = true;
			}
			this._resizeText(node, text);
		},
		
		_resizeText: function(node, text){
			// summary:
			//		Resize the text content with a node.
			// description:
			//		Truncate the text with a node if necessary so if fits
			//		on-screen.  Node takes account of the next sibling node
			//		in the calculation and any images within the node.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to scale text within.
			// text: string
			//		Text to place in the node.
			
			var refNode = this._getNextSibling(node);
			var boxDi = domTools.getNodeBoxDimensions(this.domNode);
			var refNodeDi = domTools.getNodeBoxDimensions(refNode);
			var words = text.split(' ');
			var refY = boxDi.margin.y2; // - 37;
		
			while((refNodeDi.margin.y2 > refY) && (words.length > 0)){
				words.pop();
				domAttr.set(node, 'innerHTML', words.join(' ') + '...');
				
				if(this._imageInserted){
					this._insertImage(node);
				}
				refNodeDi = domTools.getNodeBoxDimensions(refNode);
			}
            
            var contentDi = domTools.getNodeBoxDimensions(this.contentBoxNode);
            while(contentDi.margin.y2 < boxDi.border.y2){
                domStyle.set(this.contentBoxNode, {
                    "height": (contentDi.content.h + 1) + "px"
                });
                contentDi = domTools.getNodeBoxDimensions(this.contentBoxNode);
           }
		},
		
		_insertImage: function(node){
			// summary:
			//		Inside the thumnail image in the article at globally
			//		designated proportion within the article text.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to scale text within.
			
			domTools.insertNodeAtProportion(
				this._images[0], node, this.imagePosition
			);
		},
		
		_getImages: function(callback){
			// summary:
			//		Get a scale the images for this article.
			// description:
			//		Gets the images, calculates dimensions and scales the
			//		image to fit global thumnail size.  Once done a callback
			//		function is executed. Must use callback as image make take
			//		time to load.  Callback is only fired after all images are
			//		loaded and scaled.
			// tags:
			//		private
			// callback: function
			//		Function to call once all loading and scaling is done.
			//		One parametre is passed, an array of scaled image nodes.
			
			var images = new Array();
			
			if(this.hasOwnProperty("thumbnails")){
				if(this.thumbnails.length > 0){
					var count = this.thumbnails.length;
					
					var imageLoaded = function(size){
						images.push(this._scaleImage(size.node));
						if(--count <= 0){
							this._images = images;
							callback();
						}
					};
					
					array.forEach(this.thumbnails, function(thumb){
						domTools.getImageDimensions(
							thumb.url,
							lang.hitch(this, imageLoaded)
						);
					}, this);
					
				}
			}
		},
		
		_scaleImage: function(image){
			// summary:
			//		Scale an image within global thumnail size already set.
			// tags:
			//		private
			// image: object XMLNode
			//		The image node to scale.
			// returns: object XMLNode
			//		Reference to the scaled image.
			
			var resize = domTools.scaleNode(
				image, this._thumbWidth, this._thumbHeight
			);
			domAttr.set(image, "height", resize.contentHeight);
			domAttr.set(image,"width",resize.contentWidth);
			
			return image;
		},
		
		_getNextSibling: function(node){
			// summary:
			//		Get next sibling for a given node.
			// tags:
			//		private
			// node: object XMLNode
			//		The node to find the next sibling of.
			// returns: object XMLnode
			
			var siblings = this._getNodeSiblings(node);
			var next = false;
			
			var test = false;
			array.every(siblings, function(sibling){
				if(sibling == node){
					test = true;
				}else if(test){
					next = sibling;
					return false;
				}
				return true;
			}, this);
			
			return next;
		},
		
		_getNodeSiblings: function(node){
			// summary:
			//		Get nodeList object of all the sibling nodes of
			//		a given node.
			// tags:
			//		private
			// node: object XMLNode
			//		The node to find the siblings of.
			// returns: array nodeList
			
			var parent = this._getParentNode(node);
			var decendants = $("*", parent);
			var nodeList = new $.NodeList();
			
			array.forEach(decendants, function(decendant){
				if(this._getParentNode(decendant) == parent){
					nodeList.push(decendant);
				}
			}, this);
			
			return nodeList;
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
	});
	
	return construct;
});