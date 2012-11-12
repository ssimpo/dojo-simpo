define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dojo/dom-style",
    "dojox/gfx",
    "dojo/dom-geometry",
    "dojo/dom-class"
], function(
    declare, _Widget, domStyle, gfx, domGeom, domClass
){
    var construct = declare("simpo.svg.circularDiv",[_Widget],{
        radius:0,
        width:0,
        height:0,
        text:'',
        gap:6,
        edgeGap:30,
        
        _canvas:{},
        _circle:{},
        _textBoxes:[],
        _span:{},
        _words:[],
        _pos:0,
        _textGroup:{},
        
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        buildRendering: function() {
            this.inherited(arguments);
            this._setText();
            this._setWords();
        },
        
        _setText: function() {
            // summary:
            //      Get the text from the containing div and parse it.
            // description:
            //      Get the text from the containing div and parse it. Parse
            //      for whitespaces and some HTML.
            
            var text = this.domNode.innerHTML;
            var text = text.replace(/<p>/i,''); // get rid of any opening <p>
            var text = text.replace(/<\/p>/gi,'');
            var text = text.replace(/[\r\n\t\f ]+/gi,' ');
            var text = text.replace(/<p>/gi,' #NEWPARA# ');
            var text = text.replace(/<br>|<br \/><br\/>/gi,' #NEWLINE# ');
            this.text = text;
            this.domNode.innerHTML = '';
        },
        
        postCreate: function() {
            this.inherited(arguments);
            this._init();
        },
        
        _init: function() {
            // summary:
            //      Initilazition
            
            this._setDimensions();
            this._addSpan();
            this._createCanvas();
            this._createCircle();
            this._addTextBox();
            this._writeText();
        },
        
        _getWordScreenSpace: function(word) {
            // summary:
            //      Find the dimensions of a word when rendered on the screen.
            // word: string
            //      The word to get dimensions of.
            
            this._span.innerHTML = word;
            var dimensions = domGeom.getMarginBox(this._span);
            this._span.innerHTML = '';
            return dimensions;
        },
        
        _setWords: function() {
            // summary:
            //      Grab text words from the containing div.
            
            this._words = this.text.split(' ');  
        },
        
        _addSpan: function() {
            // summary:
            //      Hidden span used to calculate word pixel length.
            
            this._span = dojo.create('span',{
                'style':{'visibility':'hidden'},
                'innerHTML':''
            },this.domNode);
        },
        
        _writeText: function() {
            // summary:
            //      Write the text to the circle.
            // description:
            //      Write text to the circle word-wrapping where necessary.
            //      Add newlines and paragraphs where specified in the orginal
            //      div text.
            
            var cBoxNo = 0;
            var cl = 0;
            var cBox = this._textBoxes[cBoxNo];
            
            dojo.forEach(this._words, function(word) {
                if (word == '#NEWPARA#') {
                    cBoxNo+=2;
                    cl = 0;
                    if (cBoxNo < this._textBoxes.length) {
                        cBox = this._textBoxes[cBoxNo];
                    }
                    return;
                }
                
                if (word == '#NEWLINE#') {
                    cBoxNo++;
                    cl = 0;
                    if (cBoxNo < this._textBoxes.length) {
                        cBox = this._textBoxes[cBoxNo];
                    }
                    return;
                }
                
                if (cBoxNo < this._textBoxes.length) {
                    var wordDim = this._getWordScreenSpace(word+'&nbsp;');
                    var wordWidth = wordDim.w;
                
                    if ((cBox.w-cl-wordWidth) < 0) {
                        cBoxNo++;
                        if (cBoxNo < this._textBoxes.length) {
                            cBox = this._textBoxes[cBoxNo];
                            cl = wordWidth;
                        } else {
                            return;
                        }
                    } else {
                        cl += wordWidth;
                    }
                
                    var cText = cBox.o.rawNode.textContent;
                    cBox.o.rawNode.textContent = cText + word+' ';
                }
            },this);
        },
        
        _writeBoxes: function(height) {
            // summary:
            //      Create the text zones within the circle.
            // description:
            //      Create a series text areas within the bounds of the circle
            //      to contain the text.
            // height: integer
            //      The height (in px) a text zone.
            
            this._textGroup = this._canvas.createGroup();
            
            var boxArea = parseInt(height+this.gap);
            var rows = parseInt((this.height-(this.edgeGap*2)) / boxArea);
            
            for (var n=0; n<rows; n++) {
                var y = ((n*boxArea) + this.edgeGap);
                this._textBoxes.push(
                   this._writeBox(height,y)
                );
            }
        },
        
        _writeBox: function(height,y) {
            // summary:
            //      Create a single text zone within the circle area.
            // description:
            //      Create a single text zone within the circle area.  Using
            //      basic Pythagoras to calculate the zone length and position.
            //      Text is styled according to the text style of the
            //      containing div.
            // height: integer
            //      The height of the text zone.
            // y: interger
            //      The y-axis position of the text zone.
            
            var a = parseInt(y-(this.height/2));
            a = (( a < 0 ) ? a : ((a*-1)-height));
            
            var length = parseInt(2* (Math.sqrt(Math.pow(this.radius,2) - Math.pow(a,2)))) - (this.gap*2);
            var x = parseInt((this.width-length)/2);
            
            /* Test-only code to show boxes where the text zones are
              console.log('x:'+x,',','y:'+y,',','width:'+length,',','height:'+height);
              var box = this._canvas.createRect({'x':x,'y':y,'width':length,'height':height});
              box.setFill("yellow");
            */
            
            var textBox = this._canvas.createText({
                'x':x, 'y':y+height, 'text':'', align:'start'
            });
            
            var colour = domStyle.get(this.domNode,'color');
            textBox.setFill(colour);
            this._textGroup.add(textBox);
            
            return {'o':textBox,'x':x,'y':y,'h':height,'w':length};
        },
        
        _addTextBox: function() {
            // summary:
            //      Create a text area.
            // description:
            //      Create a text area with rows the correct height for the
            //      supplied text and font dimensions.
            
            var dimensions = this._getWordScreenSpace(this._words[0]+'&nbsp;');
            var height = dimensions.h;
            this._writeBoxes(height);
        },
        
        _createCircle: function() {
            // summary:
            //      Create the circle used to contain the text.
            // description:
            //      Create a circle to contain the text.  USe the colour and
            //      opacity of the containing div to style the circle.
            
            var cx = parseInt(this.width/2);
            var cy = parseInt(this.height/2);
            
            this._circle = this._canvas.createCircle({
                'cx':cx, 'cy':cy, r:this.radius 
            });
            
            var colour = domStyle.get(this.domNode,'backgroundColor');
            var opacity = domStyle.get(this.domNode,'opacity');
            this._circle.setFill(colour+'cc');
            domStyle.set(this._circle.rawNode,'fill-opacity',opacity);
            domStyle.set(this.domNode,'backgroundColor','transparent');
        },
        
        _setDimensions: function() {
            // summary:
            //      Set the gfx-surface and circle dimensions
            // description:
            //      Set the gfx-surface and circle dimensions using the
            //      height and width of the containing div.
            
            this.height = domStyle.get(this.domNode,'height');
            this.width = domStyle.get(this.domNode,'width');
            this._setRadius();
        },
        
        _setRadius: function() {
            // summary:
            //      Set the radius of the circle.
            // description:
            //      Set the circle radius using the height and width of the
            //      div container.
            
            this.radius = this.width;
            if (this.width > this.height) {
                this.radius = this.height;
            }
            this.radius = parseInt(this.radius/2);
        },
        
        _createCanvas: function() {
            this._canvas = gfx.createSurface(this.domNode,this.width,this.height);
        },
    });
    
    return construct;
});