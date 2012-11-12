// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"./_displayer!../../views/sidebar/sidebar.html",
	"dojo/dom-construct"
], function(
	declare, _displayer, domConstr
) {
	"use strict";
    
    var construct = declare([_displayer],{
		update: function(object, pos) {
			if (object.hasOwnProperty("widget")) {
				var widgetNode = object.widget.domNode;
				domConstr.place(object.widget.domNode, this.domNode);
			}
		}
	});
    
    return construct;
});