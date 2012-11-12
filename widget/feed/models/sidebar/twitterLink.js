// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/sidebar/twitterLink.html",
	"dijit/Tooltip"
], function(
	declare, _base, tooltip
) {
	"use strict";
    
    var construct = declare([_base],{
		"label":"",
		"tooltip":{},
		
		postCreate: function() {
			this.tooltip = new tooltip({
				"label":this._getTooltipHtml(this.config)
			});
		},
		
		addTarget: function(target) {
			this.tooltip.addTarget(target);
		},
		
		_getTooltipHtml: function(data) {
			var html = '';
			
			if (data.title) {
				html += '<h4>'+data.title+'</h4>';
			}
			if (data.description) {
				html += '<p>'+data.description+'</p>';
			}
			if (html) {
				html += '<p>'+data.unshortenedUrl+'</p>';
			}
			
			return ((html!='')?html:false);
		}
	});
    
    return construct;
});