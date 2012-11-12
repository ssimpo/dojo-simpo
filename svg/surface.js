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
    var construct = declare("simpo.svg.surface",[_Widget],{
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        buildRendering: function() {
            this.inherited(arguments);
        },
        
        postCreate: function() {
            this.inherited(arguments);
        },
        
        _getDivContents: function() {
            
        }
        
        
    });
    
    return construct;
});