// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-geometry",
    "dojo/_base/lang",
    "dojo/_base/array",
    "simpo/colour",
    "lib/pnglib",
    "simpo/dijit/colourPanelEditor"
], function(
	declare, _widget, on, domConstruct, domClass, domStyle, domAttr,
    domGeom, lang, array, colour, pnglib, colourPanel
) {
    
    var construct = declare("simpo.image.editor2",[_widget],{
        width:32,
        height:32,
        pixelSize:10,
        pixelGap:1,
        id:'',
        palette:[
            '#000000','#ffffff',
            '#ff0000','#00ff00','#0000ff',
            '#ffff00','#00ffff','#ff00ff'
        ],
        colorId:1,
        
        _editorDiv:{},
        _thumbnail:{},
        _hightlightedPixel:false,
        _matrix:[],
        _png:{},
        _pngPalette:[],
        
        postMixInProperties: function() {
			this.inherited(arguments);
            this.id = this._rndId('simpoImagePixelEditor');
            this._createPng();
            this._initDefaultColours();
        },
        
        _initDefaultColours: function() {
            array.forEach(this.palette,function(colourHex,n){
                if (!(colourHex instanceof colour)) {
                    this.palette[n] = new colour(colourHex);
                    
                    this._pngPalette[n] = this._png.color(
                        this.palette[n].r,
                        this.palette[n].g,
                        this.palette[n].b,
                        255
                    );
                }
            },this);
        },
        
        buildRendering: function() {
			this.inherited(arguments);
            this._editorDiv = this._intEditorBox();
            this._thumbnail = this._initThumbNail();
            this._setDomNodeWidth()
            this._updateThumbnail(this._thumbnail);
            this._initPaletteBox();
		},
        
        _setDomNodeWidth: function() {
            var eMargins = domGeom.getMarginBox(this._editorDiv);
            var tMargins = domGeom.getMarginBox(this._thumbnail);
            
            domStyle.set(
                this.domNode,
                'width',
                eMargins.w + tMargins.w + 10 + 'px'
            );
        },
        
        _initThumbNail: function() {
            var div = domConstruct.create('div',{
                'style':{
                    'float':'left',
                    'width':(this.width+10)+'px',
                    'height':(this.height+10)+'px',
                    'borderWidth':'1px',
                    'borderStyle':'solid',
                    'borderColor':'#000000',
                    'clear':'right'
                }
            },this.domNode);
            var img = domConstruct.create('img',{
                'width':this.width+'px',
                'height':this.height+'px',
                'style':{'margin':'5px'},
                'src':'',
                'alt':'thumbnail'
            },div);
            
            return img;
        },
        
        _initPaletteBox: function() {
            var div = domConstruct.create('div',{
                'style':{
                    'width':(this.width+26)+'px',
                    'float':'left',
                    'marginTop':'50px'
                }
            },this.domNode);
            
            array.forEach(this.palette,function(colourObj,n){
                var pdiv = domConstruct.create('div',{
                    'style':{
                        'width':'28px',
                        'height':'28px',
                        'float':'left',
                        'borderWidth':'1px',
                        'borderColor':'#000000',
                        'borderStyle':'solid',
                        'padding':'2px',
                        'margin':'1px'
                    }
                },div);
                
                var panel = new colourPanel({'colour':colourObj});
                on(panel,'select',lang.hitch(this,this._selectColour));
                on(panel,'change',lang.hitch(this,this._changeColour));
                domConstruct.place(panel.domNode,pdiv);
                if (n == 1) {
                    this._currentPanelNode = panel.domNode;
                    domStyle.set(this._currentPanelNode.parentNode,'backgroundColor','#aaaaaa');
                }
            },this);
        },
        
        _currentPanelNode:false,
        
        _selectColour: function(event) {
            var cId = -1;
            array.forEach(this.palette,function(palColour,n){
                if (event.dijit.colour == palColour) {
                    cId = n;
                }
            },this);
            
            if (cId > 0) {
                this.colorId = cId;
            } else {
                this.palette.push(event.dijit.colour);
                this.colorId = this.palette.length-1;
                this._pngPalette[this.colorId] = this._png.color(
                    this.palette[this.colorId].r,
                    this.palette[this.colorId].g,
                    this.palette[this.colorId].b,
                    255
                );
            }
            
            domStyle.set(this._currentPanelNode.parentNode,'backgroundColor','#ffffff');
            domStyle.set(event.target.parentNode,'backgroundColor','#aaaaaa');
            this._currentPanelNode = event.target;
        },
        
        _changeColour: function(event) {
            this._selectColour(event);
        },
        
        _createPng: function() {
            this._png = new pnglib({
				'height':this.height,'width':this.width,'depth':256
			});
        },
        
        _intEditorBox: function() {
            var height = ((this.pixelSize+this.pixelGap)*this.height);
            var width = (((this.pixelSize+this.pixelGap)*this.width)+10);
            
            var editor = domConstruct.create('div',{
                'style':{
                    'float':'left',
                    'width':width+'px',
                    'height':height+'px'
                }
            },this.domNode);
            this._populateEditor(editor);
            on(editor,"click",lang.hitch(this,this._click));
            on(editor,"mouseover",lang.hitch(this,this._mouseover));
            
            return editor;
        },
        
        _populateEditor: function(node) {
            for (var y=0; y<this.height; y++) {
                for (var x=0; x<this.width; x++) {
                   var pixel = this._createPixel(x,y);
                   domConstruct.place(pixel,node);
                }
            } 
        },
        
        _createPixel: function(x,y) {
            var pixel = domConstruct.create('div',{
                'style':{
                    'position':'absolute',
                    'width':this.pixelSize+'px',
                    'height':this.pixelSize+'px',
                    'left':(((x+1)*(this.pixelSize+this.pixelGap))+0)+'px',
                    'top':(((y+1)*(this.pixelSize+this.pixelGap))+0)+'px',
                    'backgroundColor':this.palette[0].toHex(),
                    'zIndex':1
                },
                'class':'dojoSimpoImageEditorPixel',
                'id':this.id+'-pixel-'+x.toString()+'x'+y.toString()
            });
            
            return pixel;
        },
        
        _click: function(event) {
            var node = event.target;
            
            if (domClass.contains(node,'dojoSimpoImageEditorPixel')) {
                var coords = this._getCoordsFromNode(node);
                domStyle.set(
                    node,
                    'backgroundColor',
                    this.palette[this.colorId].toHex()
                )
                
                this._png.edit(
                    coords.x,coords.y,
                    this._pngPalette[this.colorId]
                );
                
                this._updateThumbnail(this._thumbnail);
            }
        },
        
        _updateThumbnail: function(node) {
            domAttr.set(
                node,
                'src',
                'data:image/png;base64,'+this._png.getBase64()
            );
        },
        
        _mouseover: function(event) {
            var node = event.target;
            
            if (
                (domClass.contains(node,'dojoSimpoImageEditorPixel'))
                &&
                (this._hightlightedPixel != node)
            ) {
                
                if (this._hightlightedPixel != false) {
                    this._unhightlightPixel(this._hightlightedPixel);
                }
                
                domStyle.set(node,{
                    'borderColor':'#ff0000',
                    'borderWidth':'1px',
                    'borderStyle':'solid',
                    'zIndex':'2'
                });
                this._hightlightedPixel = node;
            }
        },
        
        _unhightlightPixel: function(node) {
            domStyle.set(node,{
                'borderStyle':'none',
                'zIndex':'1'
            });
        },
        
        _getCoordsFromNode: function(node) {
            var parts = node.id.split('-');
            var coords = parts[parts.length-1].split('x');
            
            return {
                'x':parseInt(coords[0],10),
                'y':parseInt(coords[1],10)
            }
        },
        
        _rndId: function(prefix) {
            return prefix+'-'+this._randomInt(0,1000000000000);
        },
        
        _randomInt: function(from, to){
            return Math.floor(Math.random() * (to - from + 1) + from);
        }
    });
    
    return construct;
});