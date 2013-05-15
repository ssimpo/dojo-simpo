define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./views/_Node.html",
	"dojo/_base/lang"
], function (
	declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
	template, lang
) {
	
	var _Node = declare ([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		"templateString" : template,
        "_childNodes" : [],
		"_blankGif": "/BlueHills.jpg",

        constructor: function (params, srcNodeRef) {
			console.log("constructor");
            lang.mixin(this, params);   
            this.inherited(arguments);
        },

        buildRendering: function (){
            this.inherited(arguments);
			console.log("buildRendering");
            // Execution leaves this function but never launches postCreate()
            // buildRendering is not actually there in my code, I just have it here for 
            // debugging this particular problem.
        },

        postCreate: function() {
			console.log("postCreate");
            // Execution never reaches this point in IE8 (probably 7 and 9 as well)
            var newParams = {
                "Para1": "Value1",
                "Para2": "Value2"
            }
            //var newNode = new Node(newParams, this.containerNode);
            //this._childNodes.push(newNode);
        },
		
		_onClick: function(e){
			
		}
    });

    return _Node;

});