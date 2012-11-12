define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-style",
    "simpo/colour",
    "dojo/_base/connect",
    "lib/pnglib"
], function(
    declare, _widget, _templated, domStyle, colour, connect, pnglib
){
    var construct = declare("simpo.metro.metroTab",[_widget, _templated],{
        templateString:'<div data-dojo-attach-point="container" class="dojoSimpoMetroTab"></div>',
        
        imageName:'',
        colour:'',
        label:'',
        
        _colours:{
            'blue':'#008dd2','green':'#b0cb1f','orange':'#ef7f1a','pink':'#ff2fff'
        },
        _borderColour:{},
        _backgroundColour:{},
        _backgroundColourH:{},
        
        postMixInProperties: function() {
        },
        
        buildRendering: function() {
            this.inherited(arguments);
            
            var hexColour = this._colours[this.colour];
            var backgroundColour = new colour(hexColour);
            var alpha = parseInt((0.60 * 100) * (255/100));
            this._borderColour = new colour(hexColour);
            this._borderColour.darken(25);
            
            domStyle.set(this.domNode,"backgroundColor",backgroundColour);
            domStyle.set(this.domNode,"borderColor",this._borderColour);
            
            var png = new pnglib({'width':1, 'height':1, 'depth':1});
            png.color(backgroundColour.r,backgroundColour.g,backgroundColour.b,alpha);
            this._backgroundColour = 'url(data:image/png;base64,'+png.getBase64()+')';
            
            domStyle.set(this.domNode,"opacity",1);
            domStyle.set(this.domNode,"backgroundColor","transparent");
            domStyle.set(this.domNode,"backgroundImage",this._backgroundColour);
            domStyle.set(this.domNode,"backgroundRepeat","repeat");
            
            var png = new pnglib({'width':1, 'height':1, 'depth':1});
            backgroundColour.lighten(10);
            png.color(backgroundColour.r,backgroundColour.g,backgroundColour.b,alpha);
            this._backgroundColourH = 'url(data:image/png;base64,'+png.getBase64()+')';
            
            dojo.create(
                'img',{
                    'class':'dojoSimpoMetroTabIcon',
                    'src':themePath+'/images/design/metro/'+this.imageName+'.png',
                    'width':'48',
                    'height':'48'
                },this.domNode
            );
            
            dojo.create('br',{},this.domNode);
            
            dojo.create(
                'div',{
                    'class':'dojoSimpoMetroTabLabel',
                    'innerHTML':this.label
                },this.domNode
            );
            
            connect.connect(this.domNode,"onmouseover",this,this._highlight);
            connect.connect(this.domNode,"onmouseout",this,this._unhighlight);
        },
        
        _highlight: function() {
            domStyle.set(this.domNode,"backgroundImage",this._backgroundColourH);
        },
        
        _unhighlight: function() {
            domStyle.set(this.domNode,"backgroundImage",this._backgroundColour);
        }
       
    });
    
    return construct;
});