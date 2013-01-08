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
	"dojo/i18n!./nls/displayer",
	"dojo/text!./views/displayer.html",
	"dojo/request",
	"lib/md5",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojox/layout/ContentPane",
	
	"dijit/layout/BorderContainer",
	"dijit/layout/StackContainer"
], function(
	declare, _widget, _templated, _wTemplate, i18n, strings, template,
	request, md5, lang, array, ContentPane
) {
	"use strict";
	
	var construct = declare([_widget, _templated, _wTemplate], {
		// i18n: object
		//		The internationalisation text-strings for current browser language.
		"i18n": strings,
		
		// templateString: string
		//		The loaded template string containing the HTML formatted template for this widget.
		"templateString": template,
		
		"src": "",
		
		"xhrAttempts": 3,
		"xhrTimeout": 8*1000,
		"_xhrAttempts": {},
		
		
		postCreate: function(){
			this._init();
		},
		
		_init: function(){
			//this._loadContent();
		},
		
		_loadContent: function(){
			this._xhrCall(
				this.src,
				lang.hitch(this, this._contentLoaded),
				"Failed to load content"
			);
		},
		
		_contentLoaded: function(data){
			array.forEach(data, function(item){
				var pane = this._createPane(item);
				this.stackWidget.addChild(pane);
				
			}, this);
			
			this.stackWidget.startup();
		},
		
		_createPane: function(itemData){
			var pane = new ContentPane({
				"href": itemData.href,
				"title": itemData.title
			});
			pane.startup();
			return pane;
		},
		
		_xhrCall: function(url, success, errorMsg){
			try{
				request(
					url, {
						"handleAs": "json",
						"preventCache": true,
						"timeout": this.xhrTimeout
					}
				).then(
					success,
					lang.hitch(this, this._xhrError, url, success, errorMsg)
				);
			}catch(e){
				console.info(errorMsg);
			}
		},
		
		_xhrError: function(url, success, errorMsg, e){
			// summary:
			//		Fallback when XHR request fails.
			// description:
			//		Fallback for XHR on failure, will retry a few
			//		times before a total fail.
			
			var hash = md5(url);
			if(!this._hasProperty(this._xhrAttempts, hash)){
				this._xhrAttempts[hash] = this.xhrAttempts;
			}
			
			if(this._xhrAttempts[hash] > 0){
				this._xhrAttempts[hash]--;
				this.addIntervalCommand(lang.hitch(this, function(){
					this._xhrCall(url, success, errorMsg);
				}));
			}else{
				console.info("Failed to load: " + url);
				console.info(errorMsg);
			}
		}
	});
	
	return construct;
});