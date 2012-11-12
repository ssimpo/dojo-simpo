// summary:
//		Feed widget for displaying any amount of data in any style.
// description:
//		Widget is designed to be a highly flexible internet feed consumer and
//		displayer.  It will consume any number of different feed types from
//		muliple sources and display them accoding to the chosen display
//		widget.  Items are ordered within the displayer according to date.  Each
//		displayer may contain any number of different widget types.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/text!./feed/views/feed.html",
	"./feed/controllers/application"
], function(
	declare, _widget, _templated, template, application
){
	"use strict";
	
	var construct = declare([_widget, _templated],{
		"templateString": template,
		
		"config":"",
		
		"_application":{},
		
		postCreate: function(){
			this._init();
		},
		
		_init: function(){
			
			this._application = new application({
				"src":this.config,
				"domNode":this.domNode
			});
		}
	});
	
	return construct;
});