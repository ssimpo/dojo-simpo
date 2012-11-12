// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/on",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/_base/array"
], function(
	declare, _widget, domConstruct, domAttr, domStyle, domGeom, on, lang,
    win
){
	
	"use strict";
    var construct = declare("simpo.widget.magazine.image", [_widget], {
		
		'-chains-': {'postMixInProperties':'after'},
        
        'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/4BF0A3FD044CFC6980257A02004F456F/$File/UJ%20Wellies.jpg',
        //'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/75A0DFC3BA19C09480257899004DF4EF/$File/myplace%23.png',
        //'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/60EBFD07835DFD1E802579820055548F/$File/NCS%20Box.JPG',
        //'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/95C4579E692547F98025799F00393E75/$File/Consultation.jpg',
        //'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/D27EFA7986AD4A168025793400508D49/$File/box%20-%20process.jpg',
        //'src':'http://www.redcar-cleveland.gov.uk/tunedin.nsf/F675F005AA602D558025791B004EF5A8/$File/ECT%20for%20box.bmp',
        
        '_imageNode':{},
        '_imagData':{},
        '_canvasNode':{},
        '_data':{},
        
        postCreate: function(){
            this._drawImage();
        },
        
        _drawImage: function(){
            this._canvasNode = domConstruct.create('canvas',{},win.body());
            on(this._canvasNode, "mousemove", lang.hitch(this, this._mouseOver));
            this._imageNode = domConstruct.create('img',{'src':this.src});
            on(this._imageNode, "load", lang.hitch(this, this._imageLoaded));
        },
        
        _mouseOver: function(e) {
            var box = domGeom.position(e.target);
            var x = e.clientX - box.x;
            var y = e.clientY - box.y;
            var pixel = this._getPixel(x,y);
            
            //console.log(x,y,pixel); 
        }, 
        
        _imageLoaded: function(e){
            var scaled = this._resizeInBox(
                this._getDimensions(this._imageNode),
                {'width':50,height:50}
            );
            this._setImageDimensions(
                this._imageNode, scaled.width, scaled.height
            );
            domAttr.set(this._canvasNode,{
                'width':scaled.width, 'height':scaled.height
            });
            
            var context = this._canvasNode.getContext('2d');
            context.drawImage(this._imageNode, 0, 0, scaled.width, scaled.height);
            var dimensions = this._getDimensions(this._imageNode);
                
            this._imagedata = context.getImageData(
                0, 0, dimensions.width, dimensions.height
            );
            
            this._data = this._imagedata.data;
            this._mapColours();
        },
		
		_vibrancy: function(color){
			var dimensions = this._getDimensions(this._imageNode);
			var cover = (color.count/(dimensions.height*dimensions.width))*100;
			var brightness = (((color.r*0.299) + (color.g*0.587) + (color.b*0.114))/255);
			
			if ((cover < 10) && (cover > 0.1)) {
				return (Math.pow(color.y,2) * Math.sqrt(color.s));
			}
			
			return 0;
			
		},
        
        _colours:{},
        _mapColours: function(){
            var result = this._storeColours(5);
            var total = result.total;
            var colors = result.colors;
            colors = this._reduceColors(total);
            
            for (var colorId1 in this._colours) {
				var s = (Math.round(this._colours[colorId1].s*100)/100);
				var l = (Math.round(this._colours[colorId1].l*100)/100);
				var b = (Math.round((((this._colours[colorId1].r*0.299) + (this._colours[colorId1].g*0.587) + (this._colours[colorId1].b*0.114))/255)*100)/100);
				var v = this._vibrancy(this._colours[colorId1])
				
                domConstruct.create('div',{
                    'innerHTML':colorId1+': '+ this._colours[colorId1].count.toString() + ' ('+Math.round(this._colours[colorId1].y.toString()*100)+', '+l.toString()+', '+b.toString()+'): ['+v.toString()+']',
                    'style':{
                        'backgroundColor':'#'+this._colours[colorId1].hex
                    }
                },win.body());
				
				//console.log(this._colours[colorId1]);
            }
            
            
            //console.log('DONE: ',colors);
            //console.log(this._colours);
        },
        
        _reduceColors: function(total){
            var colors = 1;
            colors = this._reduceColors2(5);
            colors = this._reduceColors2(50);
            colors = this._reduceColors3(7);
            
            return colors;
        },
        
        _reduceColors3: function(size) {
            function mostDifferent(palette,self) {
                var maxDiff = 0;
                var maxDiffId = '';
                
                for(var colorId in self._colours) {
                    for(var i=0; i<palette.length; i++) {
                        if (!isIn(colorId,palette)) {
                            var color1 = self._colours[colorId];
                            var difference = 1;
                            if (palette[i]) {
                                difference = self._getColorDifference(
                                    color1, palette[i]
                                );
                            }
                            var vib = color1.h * color1.s;
                            
                            if (vib > maxDiff) {
                                maxDiff = vib;
                                maxDiffId = colorId;
                            }
                        }
                    }
                }
                
                return self._colours[maxDiffId];
            }
            
            function isIn(id, ary) {
                for(var i=0; i<palette.length; i++) {
                    if (palette[i]) {
                        if (palette[i].hex == id) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            var vibMax = 0;
            var maxId = '';
            var palette = [];
            
            for (var i=0; i<size; i++) {
                //console.log(i);
                palette.push(mostDifferent(palette,this));
            }
            
            this._colours = {};
            for (var i=0; i<palette.length; i++) {
                if (palette[i]) {
                    this._colours[palette[i].hex] = palette[i];
                }
            }
            
            return palette.length;
        },
        
        _reduceColors2: function(tolerance) {
            for(var colorId1 in this._colours) {
                for(var colorId2 in this._colours) {
                    if (colorId1 != colorId2) {
                        var color1 = this._colours[colorId1];
                        var color2 = this._colours[colorId2];
                        var difference = this._getColorDifference(color1, color2);
                        
                        if (difference < tolerance) {
                            if (color1.count > color2.count) {
                                this._colours[colorId1].count +=
                                    this._colours[colorId2].count;
                                delete this._colours[colorId2];
                            } else {
                                this._colours[colorId2].count +=
                                    this._colours[colorId1].count;
                                delete this._colours[colorId1];
                            }
                            
                            break;
                        }
                    }
                }
            }
            
            var colors = 0;
            for(var colorId1 in this._colours) {
                colors++;
            }
            
            return colors;
        },
        
        _storeColours: function(tolerance){
            var dimensions = this._getDimensions(this._imageNode);
            var colors = 0;
            var total = 0;
            
            for(var x = 0; x < dimensions.width; x++){
                for (var y = 0; y < dimensions.height; y++) {
                    var pixel = this._getPixel(x,y);
                    var hex = this._getPixelHex(pixel);
                    
                    if (hex) {
                        if (this._colours[hex]) {
                            this._colours[hex].count++;
                        } else {
                            this._colours[hex] = pixel;
                            this._colours[hex].count = 1;
                            this._colours[hex].hex = hex;
                            colors++;
                        }
                        total++;
                    }
                }
            }
            
            return {
                'colors':colors, 'total':total
            }
        },
        
        _getPixel: function(x, y){
            var dimensions = this._getDimensions(this._imageNode);
            var pos = 4*((y*dimensions.width) + x)
            
            var data = lang.mixin({
                'r':this._imagedata.data[pos],
                'g':this._imagedata.data[pos+1],
                'b':this._imagedata.data[pos+2],
                'a':this._imagedata.data[pos+3]
            },this._getHSLfromRGB(
                this._imagedata.data[pos],
                this._imagedata.data[pos+1],
                this._imagedata.data[pos+2]
            ),this._getYUVfromRGB(
                this._imagedata.data[pos],
                this._imagedata.data[pos+1],
                this._imagedata.data[pos+2]
            ));
            
            return data;
        },
        
        _getPixelHex: function(pixel){
            if ((pixel.r == undefined) || (pixel.g == undefined) || (pixel.b == undefined)) {
                return false;
            }
            
            var bin = pixel.r << 16 | pixel.g << 8 | pixel.b;
            
            return (function(h){
                return new Array(7-h.length).join("0")+h
            })(bin.toString(16).toUpperCase());
        },
        
        _getColorDifference: function(color1,color2){
            return Math.sqrt(Math.pow((color1.r-color2.r),2) + Math.pow((color1.g-color2.g),2) + Math.pow((color1.b-color2.b),2));
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
        
        _getHSLfromRGB: function(r,g,b){
			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;
			
			if(max == min){
				h = s = 0; // achromatic
			}else{
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				
				switch(max){
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}
            
            return {'h':h,'s':s,'l':l};
		},
		
		_getYUVfromRGB: function(r, g, b){
			r = (r/255);
			g = (g/255);
			b = (b/255);
			
			var WR = 0.299;
			var WB = 0.114;
			var WG = 1 - WR - WB;
			var UM = 0.436;
			var VM = 0.615;
			
			var y = ((WR*r + WG*g + WB*b));
			var u = (UM*((b-y)/(1-WB)));
			var v = (VM*((r-y)/(1-WR)));
			
			return {'y':y,'u':u,'v':v};
		},
		
		_clamp: function(val){
			return Math.min(1, Math.max(0, val));
		},
		_clamp2: function(val,min,max){
			return Math.min(max, Math.max(min, val));
		}
    });
	
	return construct;
});