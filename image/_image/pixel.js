// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
    "dojo/Evented",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-class",
    "simpo/colour",
    "dojo/_base/lang",
    "dojo/on"
], function(
	declare, _widget, evented, domStyle, domConstruct, domClass, colour,
    lang, on
) {
    
    var construct = declare("simpo.image._image._pixel",[_widget,evented],{
        width:8,
        height:8,
        colour:{},
        background:{},
        
        postMixInProperties: function() {
			this.inherited(arguments);
		},
        
        postCreate: function() {
			this.inherited(arguments);
            this._createElement();
            this._initStyle();
		},
        
        _createElement: function() {
            domClass.add(this.domNode,'dojoSimpoImageEditorPixel');
            on(this.domNode,"click",lang.hitch(this,this._click));
        },
        
        _initStyle: function() {
            domStyle.set(this.domNode,{
                'position':'absolute',
                'height':this.height+'px',
                'width':this.width+'px',
                'left':'0px',
                'top':'0px'
            });
            this._updateScreen();
        },
        
        _changeColour: function(event) {
            this._updateScreen();
        },
        
        _updateScreen: function() {
            domStyle.set(this.domNode,'backgroundColor',this._getPixelHexColour());
            this.emit("change",this._createStandardEventObject('change'));
        },
        
        _getPixelHexColour: function() {
            if (!(this.colour instanceof colour)) {
                this.colour = new colour(this.colour);
                on(this.colour,"change",lang.hitch(this,this._changeColour));
            }
            return this.colour.toHex();
        },
        
        _createStandardEventObject: function(type) {
            var eventObj = {
				'type':type,
                'bubbles': false,
                'cancelable':false,
                'target':this.domNode,
                'currentTarget':this.domNode,
                'originalTarget':this.domNode,
                'explicitOriginalTarget':this.domNode,
                'srcElement':this.domNode,
                'dijit':this,
                'timeStamp':new Date().getTime(),
                'eventPhase':2
            };
            
            return eventObj;
        },
        
        _click: function(event) {
			this.emit("click",this._createStandardEventObject('click'));
        }
    });
    
    return construct;
});