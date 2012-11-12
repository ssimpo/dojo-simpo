// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/parser",
	"dojo/dom-attr"
], function(
	declare, parser, domAttr
) {
	"use strict";
	
	var construct = {
		"templateString": "",
		"domNode": {},
		"application": {},
		"config": {},
		
		constructor: function(config){
			this.domNode = config.domNode;
			this.application = config.application;
			this.config = config.config;
			domAttr.set(this.domNode, "innerHTML", this.templateString);
			parser.parse(this.domNode);
		}
	};
	
	return {
		load: function(id, require, callback){
			var templateUrl = require.toUrl(id);
			
			require(["dojo/text!"+templateUrl],function(text){
				construct.templateString = text;
				var classObj = declare(null, construct);
				callback(classObj);
			});
		}
	};
});