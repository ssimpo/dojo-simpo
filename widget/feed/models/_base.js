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
	"dojo/_base/lang"
], function(
	declare, _widget, _templated, lang
){
	"use strict";
    
	var construct = {
		"-chains-":{
			"constructor":"before"
		},
		
		"application": {},
		"config": {},
		"displayer":{},
		
		constructor: function(config){
			lang.mixin(this,config.config);
			this.application = config.application;
			this.displayer = config.displayer;
		}
	};
	
	return{
		load: function(id, require, callback){
			var templateUrl = require.toUrl(id);
			
			var text = require.getText(templateUrl);
			construct.templateString = text;
			var classObj = declare([_widget, _templated], construct);
			callback(classObj);
		}
	};
});