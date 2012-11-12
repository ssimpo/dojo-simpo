// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/sidebar/twitterUser.html",
	"dijit/Tooltip"
], function(
	declare, _base, tooltip
) {
	"use strict";
    
    var construct = declare([_base],{
		"label":"",
		"tooltip":{},
		
		postCreate: function() {
			//console.log(this._getTooltipHtml(this.config));
			this.tooltip = new tooltip({
				"label":this._getTooltipHtml(this.config)
			});
		},
		
		addTarget: function(target) {
			this.tooltip.addTarget(target);
		},
		
		_getTooltipHtml: function(user) {
			var html = '';
			html += '<h4>'+user.name+'</h4>';
			html += '<img src="'+user.imageSrc+'" alt="Profile image for: '+user.name+'" class="profileImage" />'
			if (user.description) {
				html += '<p>'+user.description+'</p><div style="clear:both;height:1px;">&nbsp;</div>';
			}
			
			html += '<p>';
			if (user.location) {
				html += '<b>Location:</b> '+user.location+'<br />';
			}
			if (user.website) {
				html += '<b>Website:</b> '+user.website+'<br />';
			}
			if (user.followers) {
				html += '<b>Followers:</b> '+user.followers+'<br />';
			}
			if (user.following) {
				html += '<b>Following:</b> '+user.following+'<br />';
			}
			html += '</p>';
			
			return ((html!='')?html:false);
		}
	});
    
    return construct;
});