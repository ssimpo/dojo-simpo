// summary:
//
// description:
//
// author:
//		Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/i18n",
	"dojo/i18n!./nls/metroMenu",
	"simpop/expandingDiv",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/_base/array",
	"./metroTab2",
	"dojo/dom-construct",
	"simpo/typeTest"
], function(
	declare, i18n, strings, expandingDiv, request, lang, array, metroTab,
	domComstr, typeTest
) {
	"use strict";
	
	var construct = declare([expandingDiv], {
		// i18n: object
		//		The internationalisation text-strings for current browser language.
		"i18n": strings,
		"src": "",
		"tabWidth": "85px",
		"tabHeight": "85px",
		
		"maxHeight": 500,
        "minHeight": 200,
		
		"wordpressAction": null,
		
		_setTabWidthAttr: function(value){
			this.tabWidth = this._getPxValue(value);
		},
		
		_setTabHeightAttr: function(value){
			this.tabHeight = this._getPxValue(value);
		},
		
		_setSrcAttr: function(value){
			if(value !== "" && value !== undefined && value !== null){
				this.src = value;
				this._getMenuSource();
			}
		},
		
		_setWordpressActionAttr: function(value){
			if(value !== "" && value !== undefined && value !== null){
				this.wordpressAction = value;
				this.set("src", ajaxurl);
			}
		},
		
		_getPxValue: function(txt){
			try{
				return parseInt(txt.toString().replace("px",""), 10);
			}catch(e){
				return 0;
			}
		},
		
		_getMenuSource: function(){
			var construct = {
				"handleAs": "json",
				"preventCache": true,
				"method": "get"
			};
			
			if(this.wordpressAction !== "" && this.wordpressAction !== undefined && this.wordpressAction !== null){
				construct.method = "post";
				construct.data = {"action": this.wordpressAction};
			}
			
			request(this.src, construct).then(
				lang.hitch(this, this._handleSource),
				lang.hitch(this, this._handleSourceError)
			);
		},
		
		_getDefaultTabConstruct: function(){
			return {
				"height": this.tabHeight,
				"width": this.tabWidth,
				"icon":"refresh",
				"colour":"orange",
				"heightMultiplier": 1,
				"widthMultiplier": 1
			}
		},
		
		_handleSource: function(data){
			array.forEach(data, function(tabConstruct){
				var construct = lang.mixin(
					this._getDefaultTabConstruct(),
					tabConstruct
				);
				
				var tab = new metroTab(construct);
				
				domComstr.place(tab.domNode, this.domNode);
				this.hideShow();
				
			}, this);
		},
		
		_handleSourceError: function(err){
			console.error(err);
		}
	});
	
	return construct;
});