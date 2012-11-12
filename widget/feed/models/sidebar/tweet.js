// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/sidebar/tweet.html",
	"dojo/_base/array",
	"dojo/dom-attr",
	"dojo/_base/lang",
	"dojo/on",
	"dojox/encoding/digests/MD5"
], function(
	declare, _base, array, domAttr, lang, on, MD5
) {
	"use strict";
    
    var construct = declare([_base],{
		"openLinksInNewWindow":true,
		"mentionLinkIds":{},
		"linkIds":{},
		
		postCreate: function() {
			on(this.application, "updateMeta", lang.hitch(this, this.updateMeta));
			var user = this.application.getItem(this.userId,"userId",true);
			if (!user) {
				console.error("Bad user");
			}
			var html = this._getTweetHtml();
			domAttr.set(this.content,"innerHTML",html);
			domAttr.set(this.profileImage,"src",user.imageSrc);
			var id = 'tm'+this._rndId();
			domAttr.set(this.title,{
				"id":id,
				"href":user.profile,
				"innerHTML":"@"+user.username+":",
				"target":"_blank"
			});
			if (!this.mentionLinkIds[user.username]) {
				this.mentionLinkIds[user.username] = new Array();
			}
			this.mentionLinkIds[user.username].push(id);
		},
		
		_getTweetHtml: function() {
			var html = this.text;
			html = this._linkLinks(html);
			html = this._linkMentions(html);
			html = this._linkHashTags(html);
			return html;
		},
		
		_linkLinks: function(html) {
			var target = ((this.openLinksInNewWindow)?' target="_blank"':'');
			array.forEach(this.urls, function(link) {
				var id = 'tm'+this._rndId();
				html = html.replace(
					link.url,
					'<a id="'+id+'" href="'+link.url+'" class="tweetlink" title="'+link.url+'"'+target+'>'+link.display_url+'</a>'
				);
				
				var unid = MD5(link.expanded_url, 1);
				if (!this.linkIds[unid]) {
					this.linkIds[unid] = new Array();
				}
				this.linkIds[unid].push(id);
			},this);
			
			return html;
		},
		
		_linkMentions: function(html) {
			var target = ((this.openLinksInNewWindow)?' target="_blank"':'');
			array.forEach(this.mentions, function(mention) {
				
				var id = 'tm'+this._rndId();
				var re = new RegExp('@'+mention.screen_name,'i');
				html = html.replace(re, '<a id="'+id+'" href="http://twitter.com/'+mention.screen_name+'"'+target+'>@'+mention.screen_name+'</a>');
				
				if (!this.mentionLinkIds[mention.screen_name]) {
					this.mentionLinkIds[mention.screen_name] = new Array();
				}
				this.mentionLinkIds[mention.screen_name].push(id);
			},this);
			
			return html;
		},
		
		_linkHashTags: function(html) {
			var target = ((this.openLinksInNewWindow)?' target="_blank"':'');
			array.forEach(this.hashtags, function(tag) {
				html = html.replace(
					'#'+tag.text,
					'<a href="http://twitter.com/#!/search/realtime/%23'+tag.text+'"'+target+'>#'+tag.text+'</a>'
				);
			},this);
			
			return html;
		},
		
		updateMeta: function(object, pos) {
			if (object.hasOwnProperty("widget")) {
				if (object.type == "twitterUser") {
					if (this.mentionLinkIds.hasOwnProperty(object.username)) {
						array.forEach(
							this.mentionLinkIds[object.username],
							function(id) {
								object.widget.tooltip.addTarget(id);
						}, this);
					}
				} else if (object.type == "twitterLink") {
					var unid = MD5(object.orginalUrl, 1);
					if (this.linkIds.hasOwnProperty(unid)) {
						array.forEach(
							this.linkIds[unid],
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