// summary:
//		Class to create a tab-styled box on the screen with content in it.
// description:
//		Class to create a tab-styled box on the screen with content in it.  The
//		tab contents is resized (inc. text and image) to fit in the tab.
//		Colours are calculated to contrast with each other.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./tab.html",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/dom-geometry",
	"dojo/query",
	"lib/pnglib",
	"simpo/colour",
	"dojo/_base/lang"
], function(
	declare, _widget, _templated, template,
	domStyle, domConstruct, domAttr, domGeom,
	$, pnglib, colorObj, lang
){
	
	"use strict";
	
	var colorProfile = function(constObj){
		// summary:
		//		Class to calculate colours for tab contents.
		
		var construct = {
			'main':'',
			'foreground':'',
			'background':'',
			'contrastForeground':'',
			'contrastBackground':'',
			
			constructor: function(constObj){
				this._thisMixin(constObj);
				
				this.main = this._getHexColor(
					(this.main == '')?
					constObj:
					this.main
				);
				this.background = (
					(this.background == '')?
					this._getBackgoundColor(this.main):
					this._getHexColor(this.background)
				);
				this.foreground = (
					(this.foreground == '')?
					this._getContrastTextColor(this.background):
					this._getHexColor(this.foreground)
				);
				this.contrastBackground = (
					(this.contrastBackground == '')?
					this._getContrastingColor(this.main):
					this._getHexColor(this.contrastBackground)
				);
				this.contrastForeground = (
					(this.contrastForeground == '')?
					this._getContrastTextColor(this.contrastBackground):
					this._getHexColor(this.contrastForeground)
				);
			},
			
			_thisMixin: function(constObj){
				// summary:
				//      Mix the supplied object into the current context.
				// constObj: object
				//      Object to mixin
				// todo:
				//      Test on old browser, not sure of this[key] methodology in old IE
			
				for(var key in constObj){
					this[key] = constObj[key];
				}
			},
			
			_getBackgoundColor: function(color){
				// summary:
				//		Get a contrasting shade of supplied colour
				//		for the background.
				// colour: string|object
				//		The colour to get a background shade for.
				// returns: string
				//		Hex-string of calculated shade.
				
				return this._getContrastingShade(color,25);
			},
			
			_getContrastTextColor: function(color){
				// summary:
				//		Get a contrasting text colour
				//		(ie. so it can be read on specified background).
				// colour: string|object
				//		The colour to get a foreground colour for.
				// returns: string
				//		Hex-string of calculated colour.
				
				var colorCon = new colorObj(color);
				return ((colorCon.brightness() > 127)?'#000000':'#FFFFFF');
			},
			
			_getContrastingShade: function(color, contrast){
				// summary:
				//		Get a contrasting shade, according specified contrast.
				// colour: string|object
				//		The colour to get a contrast for.
				// contrast: integer
				//		The contrast factor.
				// returns: string
				//		Hex-string of calculated colour.
				
				var tColor = this._getClonedColorInstance(color);
				var cColor = this._getClonedColorInstance(color);
			
				var breakout = 100;
				while(this._calcColorContrast(cColor,tColor) < contrast){
					if(tColor.brightness() > 127){
						cColor.desaturate(0.75).darken(1);
					}else{
						cColor.saturate(0.75).lighten(1);
					}
					
					if(breakout-- < 0){ break; }
				}
			
				if(color instanceof colorObj){
					return cColor;
				}
				return cColor.toHex();
			},
			
			_calcColorContrast: function(color1, color2){
				// summary:
				//		Calculate the contrast factor between two colours.
				// color1: object simpo.colour
				//		The 1st colour.
				// color2: object simpo.colour
				//		The 2nd colour.
				// returns: integer
				//		Contrast factor (min:1, max:100).
				
				return ((Math.abs(Math.abs(color1.brightness()) - Math.abs(color2.brightness()))/255)*100);
			},
		
			_getClonedColorInstance: function(color){
				// summary:
				//		Clone a colour object instance (or create a new one).
				// color: object simpo.colour
				//		Instance to clone.
				// returns: object simpo.colour
				
				if(color instanceof colorObj){
					return new colorObj(color.toHex());
				}
				return new colorObj(color);
			},
			
			_getContrastingColor: function(color){
				// summary:
				//		Get a contrasting colour of supplied colour.
				// description:
				//		Get a contrasting colour of supplied colour (ie.
				//		120º on the colour-wheel).
				// colour: string|object
				//		The colour to get a contrasting colour for.
				// returns: string
				//		Hex-string of calculated colour.
				
				var cColor = this._getClonedColorInstance(color);
				if(color instanceof colorObj){
					return cColor.spin(-120);
				}else{
					return cColor.spin(-120).toHex();
				}
			},
			
			_getHexColor: function(color){
				// summary:
				//		Get a hex colour string for the supplied colour.
				// colour: string|object
				//		String or object parable with simpo.colour.
				// returns: string
				
				var colorInstance = color;
				if(!(colorInstance instanceof colorObj)){
					colorInstance = new colorObj(colorInstance);
				}
				return colorInstance.toHex();
			}
		};
		
		construct.constructor(constObj);
		return construct;
	};
	
	
	var construct = declare("simpo.widget.magazine.tab", [_widget, _templated], {
		
		'-chains-': {'postMixInProperties':'after'},
		
		'templateString':template,
		
		'height': 0,
		'width': 0,
		'content': '',
		'headline': '',
		'title': '',
		'padding': 20,
		//'imageSrc': 'http://www.redcar-cleveland.gov.uk/tunedin.nsf/fb-150x150.jpg',
		//'imageSrc': 'http://www.redcar-cleveland.gov.uk/long.jpg',
		'imageSrc': 'http://www.redcar-cleveland.gov.uk/REDCAR.JPG',
		'href':'',
		'alpha': 0.5,
		'imageSpace':0.35,
		'color':'',
		'imagePosition':0.25,
		
		'_bkPngDataUrl': null,
		'_imageInserted': false,
		
		postMixInProperties: function(){
			this.height = (this.height - 56 - (this.padding*2));
			this.color = new colorProfile(this.color);
		},
		
		postCreate: function(){
			domStyle.set(this.domNode,'width',this.width+'px');
			domStyle.set(this._hiddenNode,{
				'width':(this.width - (this.padding*2))+'px',
				'height':(this.height - (this.padding*2))+'px'
			});
			domAttr.set(this._imageNode, 'src', this.imageSrc);
			
			this._appyStyles();
			this._insertContent();
		},
		
		_appyStyles: function(){
			// summary:
			//		Apply styling to all the template components.
			
			this._styleTitleBox(this._titleNode);
			this._styleContentBox(this._contentNode);
			this._styleHeadlineBox(this._headlineNode);
			this._styleContentTextBox(this.containerNode);
			this._styleReadMoreBox(this._readMoreNode,this._readMoreAnchorNode);
		},
		
		_styleTitleBox: function(node){
			// summary:
			//		Style the title.
			// node: object XMLNode
			//		Node to style.
			
			domAttr.set(node,{
				'innerHTML':this.title,
				'style':{
					'borderBottomColor':this.color.main,
					'color':this.color.contrastForeground,
					'textShadowColor':this.color.contrastForeground
				}
			});
		},
		
		_styleContentBox: function(node){
			// summary:
			//		Style the content area.
			// node: object XMLNode
			//		Node to style.
			
			domStyle.set(node,{
				'height':this.height+'px',
				'borderColor':this.color.main,
				'color':this.color.foreground
			});
			
			if(this._bkPngDataUrl == null){
				this._bkPngDataUrl = this._getPngPixelImage(this.color.background, this.alpha);
			}
			
			domStyle.set(node,{
				"backgroundImage":this._bkPngDataUrl,
				"backgroundRepeat":"repeat"
			});
		},
		
		_styleHeadlineBox: function(node){
			// summary:
			//		Style the headline.
			// node: object XMLNode
			//		Node to style.
			
			domAttr.set(node,{
				'innerHTML':this.headline,
				'style':{
					'backgroundColor':this.color.contrastBackground,
					'color':this.color.contrastForeground
				}
			});
		},
		
		_styleContentTextBox: function(node){
			// summary:
			//		Style the text paragraph (inc. adding content).
			// node: object XMLNode
			//		Node to style.
			
			domAttr.set(this.containerNode,'innerHTML',this.content);
		},
		
		_styleReadMoreBox: function(node, nodeA){
			// summary:
			//		Style the read more link paragraph.
			// node: object XMLNode
			//		Node to style.
			// nodeA: object XMLNode
			//		Anchor node.
			
			domAttr.set(node,{
				'href':this.href,
				'style':{'color':this.color.foreground}
			});
			domStyle.set(nodeA, 'color', this.color.foreground);
		},
		
		_insertContent: function(){
			// summary:
			//		Inserts the active content onto the screen.
			
			this._resizeText();
			this._resizeNode(
				this._imageNode, this.containerNode, this.imageSpace
			);
			this._insertNodeAtProportion(
				this._imageNode, this.containerNode, this.imagePosition
			);
			this._imageInserted = true;
			domAttr.set(this._imageNode, {'alt':'Image'});
			this._resizeText();
			domConstruct.place(this._contentNode,this.domNode,'last');
			//this._resizeText();
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
            if ((dimensions.h == 0) && (dimensions.w == 0)) {
                dimensions = {'h':node.height,'w':node.width};
            }
            
			return {'height':dimensions.h,'width':dimensions.w};
		},
		
		_resizeText: function(){
			// summary:
			//		Specialist function to reduce text content till
			//		it fits on screen
			
			var boxDi = domGeom.position(this._contentNode);
			var readmoreDi = domGeom.position(this._readMoreNode);
			var words = this.content.split(' ');
			
			while(((readmoreDi.y+readmoreDi.h+this.padding) > (boxDi.y+boxDi.h)) && (words.length > 0)){
				words.pop();
				domAttr.set(
					this.containerNode,
					'innerHTML',
					words.join(' ') + '...'
				);
				if(this._imageInserted){
					this._insertNodeAtProportion(
						this._imageNode, this.containerNode, this.imagePosition
					);
				}
				readmoreDi = domGeom.position(this._readMoreNode);
			}
		},
		
		_resizeNode: function(node, container, scale){
			// summary:
			//		Resize an node within the bounds of another node.
			// description:
			//		Resize a node within the bounds of another node's visible
			//		screen area, according to scaling factor (default: 1).
			// node: object XMLNode
			//		Node to resize.
			// container: XMLNode
			//		Node to use as a reference.
			// scale: float
			//		The scaling factor.
			
			var size = this._resizeInBox(
				this._getDimensions(node),
				this._getDimensions(container),
				scale
			);
			
			this._setImageDimensions(node,size.width,size.height);
		},
		
		_insertNodeAtProportion: function(node, container, proportion){
			// summary:
			//		Insert a node within another node at the specified position
			//		from the node start.
			// node: object XMLNode
			//		Node to insert.
			// container: object XMLNode
			//		Node to insert into.
			// proportion: float
			//		The proportion through the text-node to insert at.
			//		(default: 0.5).
			
			proportion = ((proportion == undefined)?0.5:proportion);
			var at = this._calcNodeInsertPoint(container, proportion);
			
			domConstruct.place(
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
			// node: object XMLNode
			//		The text-node to calculate the insertion point of.
			// proportion: float
			//		The proportion through the text-node to insert at.
			//		(default: 0.5).
			// returns: integer
			//		The insert point.
			
			proportion = ((proportion == undefined)?0.5:proportion);
			var text = this._getNodeText(node);
			var at = Math.round(text.length * proportion);
			
			var character = ''
			while((character != ' ') && (at > 0)){
				character = text.substr(at,1);
				at--;
			}
			
			return at;
		},
		
		_getPngPixelImage: function(color, alpha){
			// summary:
			//		Get a data-url for a single-pixel png according to the
			//		supplied parameters.
			// color: object|string
			//		Colour object or string that is acceptable for parsing by
			//		simpo/colour. Colour is applied to the pixel.
			// alpha: float
			//		Alpha value for pixel (value is a percentage)
			// returns: string
			//		Data URL for created pixel image.
			
			color = new colorObj(color);
			alpha = (
				(alpha == undefined)?
				color.a:
				((alpha*100) * (255/100))
			);
			
			var png = new pnglib({'width': 1, 'height': 1, 'depth': 1});
			png.edit(0,0,png.color(color.r,color.g,color.b,alpha));
			
			return 'url(data:image/png;base64,'+png.getBase64()+')';
		},
		
		_resizeInBox: function(itemDimensions, boxDimensions, scale){
			// summary:
			//		Get new dimensions for a node dimensions when resized
			//		within the dimensions another node.
			// description:
			//		Get new dimensions for a node dimensions when resized
			//		within the dimensions another node. Sized node is scaled
			//		within other node according to the factor set in scale.
			// itemDimensions: object
			//		The dimensions to resize
			//		(object format: {width:<WIDTH>,height:<HEIGHT>})
			// boxDimensions: object
			//		The dimensions to resize within
			//		(object format: {width:<WIDTH>,height:<HEIGHT>})
			// scale: float
			//		The scaling factor (default: 1 - ie. no scaling).
			// returns: object
			//		(object format: {width:<WIDTH>,height:<HEIGHT>})
			// todo:
			//		Could still place overflowing image if it is placed too
			//		far down in parent paragraph, needs fixing (or another
			//		resizer writting to combat this).
			
			scale = ((scale == undefined)?1:scale);
			var size = {'width':1, 'height':1};
			var proportion = (itemDimensions.width/itemDimensions.height);
			
			var calcProportion = function(size, container){
				return (
					(size.width*size.height)/(container.width*container.height)
				);
			};
			
			var test1 = function(size, boxDimensions, scale, breakout){
				return (
					(calcProportion(size, boxDimensions) < scale)
					&&
					(breakout-- > 0)
					&&
					(size.height < boxDimensions.height)
					&&
					(size.width < boxDimensions.width)
				);
			};
			
			var test2 = function(size, boxDimensions, scale, breakout){
				return (
					(breakout-- > 0)
					&&
					(
						(size.height > boxDimensions.height)
						||
						(size.width > boxDimensions.width)
						||
						(calcProportion(size,boxDimensions) > scale)
					)
				);
			};
			
			var breakout = 500;
			while(test1(size, boxDimensions, scale, breakout--)){
				size.width += (proportion*10); size.height += 10;
			}
			
			breakout = 500;
			while(test2(size, boxDimensions, scale, breakout--)){
				size.width -= proportion; size.height -= 1;
			}
			
			return {
                'width':parseInt(size.width,10),
                'height':parseInt(size.height,10)
            }
		},
		
		_setImageDimensions: function(image, width, height){
			// summary:
			//      Set the size of an image.
			// image: object XMLNode
			//      The image XML node.
			// width: integer
			//      The image width to set to.
			// height: integer:
			//      The image height to set to.
			
			domAttr.set(image, {'height':height, 'width':width});
			domGeom.setContentSize(image,{'h': height, 'w': width});
		},
		
		_getNodeText: function(node){
			// summary:
			//	Get the text content of a node (regardless of browser).
			// node: Object XML
			//	The XML element node you want the text content of.
			// returns: String
	
			if(node.textContent){
				return node.textContent;
			}else if(node.text){
				return node.text;
			}else if(node.innerText){
				return node.innerText;
			}else{
				return '';
			}
		}
	});
	
	return construct;
});