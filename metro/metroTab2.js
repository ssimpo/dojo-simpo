// summary:
//
// description:
//
// author:
//		Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/i18n",
	"dojo/i18n!./nls/metroTab",
	"dojo/text!./views/metroTab.html",
	"dojo/dom-style",
	"simpo/colour",
	"simpo/typeTest",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom-attr"
], function(
	declare, _widget, _templated, _wTemplate, i18n, strings, template,
	domStyle, Colour, typeTest, on, lang, domAttr
) {
	"use strict";
	
	var construct = declare([_widget, _templated, _wTemplate], {
		// i18n: object
		//		The internationalisation text-strings for current browser language.
		"i18n": strings,
		
		// templateString: string
		//		The loaded template string containing the HTML formatted template for this widget.
		"templateString": template,
		
		"height": 50,
		"width": 50,
		"icon": "refresh",
		"colour": "orange",
		"heightMultiplier": 1,
		"widthMultiplier": 1,
		"highlightValue": 20,
		
		postCreate: function(){
			this._init();
		},
		
		_init: function(){
			on(this.domNode, "mouseover", lang.hitch(this, this._highlight));
			on(this.domNode, "mouseout", lang.hitch(this, this._unhighlight));
		},
		
		_setIconAttr: function(value){
			this.icon = value;
			domAttr.set(this.iconNode, "src", this.icon);
		},
		
		_setLabelAttr: function(value){
			this.label = value;
			domAttr.set(this.labelNode, "innerHTML", this.label);
		},
		
		_setHrefAttr: function(value){
			this.href = value;
			domAttr.set(this.anchorNode, "href", this.href);
		},
		
		_highlight: function(evt){
			this.highlight();
		},
		
		highlight: function(evt){
			var hColour = lang.clone(this.get("colour"));
			hColour.lighten(this.highlightValue);
			
			domStyle.set(
				this.domNode,
				"backgroundColor",
				"rgba("+hColour.toRgba().join(",")+")"
			);
		},
		
		_unhighlight: function(evt){
			var node = evt.toElement || evt.relatedTarget;
			
			if(!this._isInsideNode(node, this.domNode)){
				this.unhighlight();
			}
		},
		
		unhighlight: function(){
			domStyle.set(
				this.domNode,
				"backgroundColor",
				"rgba("+this.get("colour").toRgba().join(",")+")"
			);
		},
		
		_setHeightAttr: function(value){
			value = this._getPxValue(value);
			this.height = value;
			var multi = this.get("heightMultiplier");
			value *= multi;
			
			if(multi > 1){
				var margin = this._getPxValue(
					domStyle.get(this.domNode, "marginBottom")
				);
				value += (margin * ((multi-1)*2));
			}
			
			domStyle.set(this.domNode, "height", value + "px");
		},
		
		_setWidthAttr: function(value){
			value = this._getPxValue(value);
			this.width = value;
			var multi = this.get("widthMultiplier");
			value *= multi;
			
			if(multi > 1){
				var margin = this._getPxValue(
					domStyle.get(this.domNode, "marginRight")
				);
				value += (margin * ((multi-1)*2));
			}
			
			domStyle.set(this.domNode, "width", value + "px");
		},
		
		_isColourObj: function(obj){
			if(typeTest.isObject(obj)){
				return typeTest.isProperty(obj, ["r","g","b", "toRgb"]);
			}

			return false;
		},
		
		_getColourObject: function(value){
			if(!this._isColourObj(value)){
				return new Colour(value);
			}
			
			return value;
		},
		
		_setColourAttr: function(value){
			value = this._getColourObject(value);
			this.colour = value;
			this.unhighlight();
		},
		
		_getPxValue: function(txt){
			try{
				return parseInt(txt.toString().replace("px",""), 10);
			}catch(e){
				return 0;
			}
		},
		
		_isInsideNode: function(node, targetNode){
            var cNode = node;
            while((cNode != document.body) && (cNode != undefined) && (cNode != document)){
                if(cNode == targetNode){
                    return true;
                }
                cNode = cNode.parentNode;
            }
            
            return false;
        }
	});
	
	return construct;
});