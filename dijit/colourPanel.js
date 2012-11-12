// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"simpo/colour",
	"dojo/dom-style",
	"dojo/dom-attr",
    "dojo/on",
    "dojo/_base/lang"
], function(
    declare, _widget, _templated, colour, domStyle, domAttr, on, lang
) {
    
    var construct = declare("simpo.dijit.colourPanel",[_widget,_templated],{
		templateString:'<div class="dojoSimpoDijitColourPanel" data-dojo-attach-point="container" data-dojo-attach-event="onclick:select"></div>',
		colour:{},
		borderColour:{},
		name:'',
		
		postMixInProperties: function () {
			this.inherited(arguments);
			if (typeof this.colour == 'string') {
				this.colour = new colour(this.colour);
			} else {
				this.colour = new colour(this);
			}
            
            on(this.colour,"change",lang.hitch(this,this._changeColour));
			
			this.borderColour = new colour(this.colour.toHex());
			this.borderColour.spin(180);
		},
		
		buildRendering: function() {
			this.inherited(arguments);
			domStyle.set(this.container,{
				'backgroundColor':this.colour.toHex(),
				'borderColor':this.colour.toHex(),
			});
			if (this.name != '') {
				domAttr.set(this.container,'title',this.name);
			}
		},
		
		select: function(event){
			domStyle.set(this.container,{
				'borderColor':this.borderColour.toHex(),
			});
		},
		
		unselect: function() {
			domStyle.set(this.container,{
				'borderColor':this.colour.toHex(),
			});
		},
        
        _changeColour: function(event) {
            domStyle.set(this.container,{
				'backgroundColor':this.colour.toHex(),
                'borderColor':this.colour.toHex()
			});
        }
		
	});
    
    return construct;
});