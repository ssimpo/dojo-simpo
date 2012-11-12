// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "./_image/pixel",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-attr",
    "lib/pnglib",
    "dojo/on",
    "dojo/_base/lang",
    "dojo/_base/array"
], function(
	declare, _widget, _templated, pixel, domConstruct, domStyle, domAttr,
    pnglib, on, lang, array
) {
    
    var construct = declare("simpo.image.editor",[_widget,_templated],{
        templateString:
            '<div class="dojoSimpoImageEditor" style="width:1000px;height:800px">'+
                '<div class="dojoSimpoImageEditorPanel" data-dojo-attach-point="container"></div>'+
                '<div class="dojoSimpoImageThumbnail">'+
                    '<img src="" data-dojo-attach-point="thumbnailDom" />'+
                '</div>'+
            '</div>',
        
        width:48,
        height:48,
        pixelSize:8,
        pixelGap:1,
        background:'#ffffff',
        foreground:'#000000',
        
        _pixelArray:[],
        _png:{},
        
        postMixInProperties: function() {
			this.inherited(arguments);
            this._buildPng();
            this._buildPixelArray();
		},
        
        buildRendering: function() {
			this.inherited(arguments);
            domStyle.set(this.container,{
                'width':(((this.pixelSize+this.pixelGap)*this.width)+10)+'px',
                'height':(((this.pixelSize+this.pixelGap)*this.height)+10)+'px',
                'float':'left'
            });
            domStyle.set(this.thumbnailDom.parentNode,{
                'width':(this.width+10)+'px',
                'height':(this.height+10)+'px',
                'float':'left'
            });
            domStyle.set(this.thumbnailDom,{
                'width':this.width+'px',
                'height':this.height+'px'
            });
            this._writePixelArray();
            this._updateThumbnail();
		},
        
        _buildPng: function() {
            this._png = new pnglib({
				'height':this.height,'width':this.width,'depth':256
			});
        },
        
        _buildPixelArray: function() {
            var pngBackground = this._png.color(0, 0, 0, 255);
            
            for (var rows=1; rows<=this.height; rows++) {
                for (var cols=1; cols<=this.width; cols++) {
                    var pix = this._createNewPixel();
                    this._pixelArray.push(pix);
                    this._png.edit(cols,rows,pngBackground);
                }
            } 
        },
        
        _writePixelArray: function() {
            for (var rows=1; rows<=this.height; rows++) {
                for (var cols=1; cols<=this.width; cols++) {
                    var pix = this._getPixel(cols,rows);
                    domConstruct.place(pix.domNode,this.container);
                    domStyle.set(pix.domNode,{
                        'left':((cols*(this.pixelSize+this.pixelGap))+0)+'px',
                        'top':((rows*(this.pixelSize+this.pixelGap))+0)+'px'
                    });
                    on(
                       pix,
                       "change",
                       lang.hitch(this,this._pixelChange)
                    );
                    on(
                       pix,
                       "click",
                       lang.hitch(this,this._pixelClick)
                    );
                }
            }
        },
        
        _editPixel: function(x,y,colour) {
            var pixel = this._getPixel(x,y);
            var pngColour = this._png.color(
                pixel.colour.r,pixel.colour.g,pixel.colour.b,255
            );
            
            pixel.colour.setColor(colour);
            this._png.edit(x-1,y-1,pngColour);
        },
        
        _getPixel: function(x,y) {
            var cellNo = ((y-1)*this.height) + x - 1;
            return this._pixelArray[cellNo];
        },
        
        _getCoords: function(pix) {
            var cCell = 0;
            array.forEach(this._pixelArray,function(cPix,n){
                if (cPix == pix) {
                    cCell = n;
                }
            },this);
            
            return {
				'y':parseInt(((cCell-(cCell%this.height))/this.height),10),
				'x':(cCell%this.height)
			};
        },
        
        _createNewPixel: function() {
            return new pixel({
                'height':this.pixelSize,
                'width':this.pixelSize,
                'colour':this.foreground
            });
            
        },
        
        _updateThumbnail: function() {
			domAttr.set(
				this.thumbnailDom,
				'src',
				'data:image/png;base64,'+this._png.getBase64()
			);
		},
        
        _pixelChange: function(event) {
            this._updateThumbnail();
        },
        
        _pixelClick: function(event) {
            var pix = event.dijit;
            
            if (pix.colour.toHex().toLowerCase() == this.background) {
                pix.colour.setColor(this.foreground);
            } else {
                pix.colour.setColor(this.background);
            }
            
            var coords = this._getCoords(pix);
            console.log(coords);
            var pngColour = this._png.color(
                pix.colour.r,pix.colour.g,pix.colour.b,255
            );
            this._png.edit(coords.x-1,coords.y-1,pngColour);
        }
    });
    
    return construct;
});