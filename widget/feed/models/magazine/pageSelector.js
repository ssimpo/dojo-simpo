// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!../../views/magazine/pageSelector.html",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/query",
	"dijit/registry",
	"dojo/_base/array"
], function(
	declare, _widget, _templated, template, domConstr, domClass, $, registry,
	array
){
	"use strict";
	
	var construct = declare([_widget, _templated],{
		"templateString":template,
		
		"_items": [],
		"_selected": 0,
		
		add: function(stack, pane){
			// summary:
			//		Add a new selector for a given pane.
			// tags:
			//		public
			// stack: array
			//		Array of pane objects.
			// pane: object XMLNode
			//		Pane object to add selector for.
			
			var cNum = this._items.length+1;
			var self = this;
			
			var func = function(event){
				stack.selectChild(pane);
				
				var articleNodes = $(".dojoSimpoWidgetFeedArticle", pane.domNode);
				array.forEach(articleNodes, function(articleNode){
					var article = registry.byNode(articleNode);
					article.redraw();
				}, this);
				
				
				self._select(cNum-1);
			}
			
			var item = this._createSelector(cNum, func);
			if(this._items.length == 0){
				domClass.add(
					item,
					"simpoWidgetMagazinePageSelectorItemHighlight"
				);
			}
			if(this._items.length == 1){
				domConstr.place(this._items[0],this.container);
			}
			if(this._items.length > 0){
				domConstr.place(item,this.container);
			}
			
			this._items.push(item);
		},
		
		_createSelector: function(cNum, func){
			// summary:
			//		Create a selector node.
			// tags:
			//		private
			// todo:
			//		Added keyboard navigation?
			// cNum: integer
			//		The number to display on the selector.
			// func: function
			//		The function to fire when clicked.
			// returns: object XMLNode
			
			return domConstr.create("li",{
				"class": "simpoWidgetMagazinePageSelectorItem",
				"innerHTML": cNum.toString(),
				"onclick": func
			});
		},
		
		_select: function(cNum){
			// summary:
			//		Select a given selector.
			// description:
			//		Graphically selector a selector but do not call the
			//		onclick function.
			// cNum: integer
			//		The selector to select.
			
			if(cNum != this._selected){
				domClass.remove(
					this._items[this._selected],
					"simpoWidgetMagazinePageSelectorItemHighlight"
				);
				
				domClass.add(
					this._items[cNum],
					"simpoWidgetMagazinePageSelectorItemHighlight"
				);
				
				this._selected = cNum;
			}
			
		}
	});
	
	return construct;
});