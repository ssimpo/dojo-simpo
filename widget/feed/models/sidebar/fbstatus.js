// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/sidebar/fbstatus.html",
	"dojo/_base/array",
	"dojo/dom-attr",
	"dojo/_base/lang",
	"dojo/on",
	"dojox/encoding/digests/MD5",
	"./fbCommentBox",
	"dojo/query"
], function(
	declare, _base, array, domAttr, lang, on, MD5, fbCommentBox, $
) {
	"use strict";
    
    var construct = declare([_base],{
		"openLinksInNewWindow":true,
		"userIds":{},
		"moreDialog":{},
		
		postCreate: function() {
			on(this.application, "updateMeta", lang.hitch(this, this.updateMeta));
			var html = this._getStatusHtml();
			var user = this.application.getItem(this.userId,"userId",true);
			if (!user) {
				console.error("Bad user");
			}
			if (this.comments.length > 0) {
				html += '<br /><br /><span class="dojoSimpoWidgetFacebookMore">Comments</span>'
			}
			
			domAttr.set(this.content,"innerHTML",html);
			domAttr.set(this.profileImage,"src",user.imageSrc);
			var id = 'tm'+this._rndId();
			domAttr.set(this.title,{
				"id":id,
				"href":user.profile,
				"innerHTML":user.name+":",
				"target":"_blank"
			});
			
			this._createMoreDialog(user);
			this._addMoreLinks();
			
			if (!this.userIds[user.userId]) {
				this.userIds[user.userId] = new Array();
			}
			this.userIds[user.userId].push(id);
		},
		
		_addMoreLinks: function() {
			var moreLinks = $('.dojoSimpoWidgetFacebookMore',this.content);
			array.forEach(moreLinks, function(anchor){
				on(anchor, "click", lang.hitch(this, function() {
					this.moreDialog.show();
				}));
			}, this);
		},
		
		_getStatusHtml: function() {
			var html = '';
			var id = 'dg'+this._rndId();
			if (this.text.length > 200) {
				html += this.text.substr(0,199) + '... <span class="dojoSimpoWidgetFacebookMore">More</span>';
			} else {
				html += this.text;
			}
			html = html.replace(/\n/g,'<br />');
			return html;
		},
		
		_createMoreDialog: function(user) {
			this.moreDialog = new fbCommentBox(lang.mixin(
				this.config,
				{
					"class":"dojoSimpoWidgetFacebookMoreDialog",
					"id":"fbComments_"+this.facebookId,
					"displayer": this.displayer,
					"application": this.application
				}
			));
		},
		
		updateMeta: function(object, pos) {
			console.log("UPDATE META",object,pos);
			if (object.hasOwnProperty("widget")) {
				if (object.type == "facebookUser") {
					if (this.userIds.hasOwnProperty(object.userId)) {
						array.forEach(
							this.userIds[object.userId],
							function(id) {
								object.widget.tooltip.addTarget(id);
						}, this);
					}
				}
			}
		},
		
		_rndId: function() {
            return this._randomInt(0,1000000000000);
        },
        
        _randomInt: function(from, to){
            return Math.floor(Math.random() * (to - from + 1) + from);
        }
	});
    
    return construct;
});