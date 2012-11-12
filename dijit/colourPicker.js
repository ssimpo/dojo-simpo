// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"simpo/dijit/colourPanel",
	"dojo/_base/array",
	"dojo/dom-construct",
	"dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/dom-attr"
], function(
	declare, _widget, panel, array, domConstruct, connect, lang, $, domNodeList,
	domAttr
) {
    
    var construct = declare("simpo.dijit.colourPicker",[_widget],{
		templateString:'<div class="dojoSimpoDijitColourPicker" data-dojo-attach-point="container"><input type="hidden" value="" name="" data-dojo-attach-point="input" /></div>',
		
		colours:[],
		selected:0,
		panels:[],
		container:{},
		input:{},
		name:'',
		id:'',
		
		buildRendering: function() {
			this.inherited(arguments);
			this._construct_template();
			
			array.forEach(this.colours,function(colour) {
				var panelObj;
				if (typeof colour == 'string') {
					panelObj = new panel({'colour':colour});
				} else {
					panelObj = new panel(colour);
				}
				
				connect.connect(panelObj,'select',this,this.selector);
				this.panels.push(panelObj);
				domConstruct.place(panelObj.domNode,this.container);
			},this);
			
			this.panels[this.selected].select();
		},
		
		_construct_template: function() {
			this._set_colours();
			
			this.name = domAttr.get(this.domNode,'name');
			this.id = domAttr.get(this.domNode,'id');
			
			this.container = domConstruct.create('div',{
				'class':'dojoSimpoDijitColourPicker'
			});
			domConstruct.place(this.container,this.domNode,'replace');
		
			var inputContstr = {'type':'hidden','name':this.name,'value':this.selected};
			if (this.id != '') {
				inputContstr.id = this.id;
			}
			
			this.input = domConstruct.create('input',inputContstr,this.container);
		},
		
		_set_colours: function() {
			var options = $('option',this.domNode);
			if (options.length > 0) {
				this.colours = new Array();
				array.forEach(options,function(option,n) {
					var colour = domAttr.get(option,'value');
					var name = option.innerHTML;
					var selected = domAttr.get(option,'selected');
					if (selected) { this.selected = n; }
					this.colours.push({'name':name,'colour':colour});
				},this);
			}
		},
		
		selector: function(event) {
			if (event != undefined) {
				var node = this._getEventTarget(event);
				var parent = node.parentNode;
				var panelNodes = $('.dojoSimpoDijitColourPanel',parent);
			
				array.forEach(panelNodes,function(panelNode,n) {
					if (panelNode == node) {
						this.panels[this.selected].unselect();
						this.selected = n;
						this.input.value = this.colours[n].name;
					}
				},this);
			}
			
		},
		
		_getEventTarget: function(event) {
            if (event.currentTarget) { return event.currentTarget; }
            if (event.target) { return event.target; }
            if (event.orginalTarget) { return event.orginalTarget; }
            if (event.srcElement) { return event.srcElement; }
                
            return event;
        }
	});
    
    return construct;
});