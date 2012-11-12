// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"../_base!../../views/sidebar/fbCommentBox.html",
	"dijit/Dialog",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/_base/array",
	"dojo/dom-construct"
], function(
	declare, _base, dialog, lang, domAttr, array, domConstr
) {
	"use strict";
    
    var construct = declare([_base],{
		_dialog:{},
		
		postCreate: function() {
			this._dialog = new dialog({
				"title": "Facebook post",
				"class":this["class"],
				"content":this.domNode
			});
			
			this._initContent();
		},
		
		_initContent: function() {
			this._initPost();
			if (this.comments.length > 0) {
				this._initComments();
			}
		},
		
		_initPost: function() {
			var user = this.application.getItem(this.userId,"userId",true);
			if (user) {
				domAttr.set(this.profileImage,"src",user.imageSrc);
				var id = 'tm'+this._rndId();
				domAttr.set(this.title,{
					"id":id,
					"href":user.profile,
					"innerHTML":user.name+":",
					"target":"_blank"
				});
			}
			
			var html = this.text.replace(/\n/g,'<br />');
			domAttr.set(this.content,"innerHTML",html);
		},
		
		_initComments: function() {
			array.forEach(this.comments, function(comment){
				domConstr.place(
					this._createComment(comment),
					this.commentsBox,
					"last"
				);
			}, this);
		},
		
		_createComment: function(comment) {
			var div = domConstr.create("div");
			domConstr.create("p",{
				"innerHTML": comment.message
			}, div);
			var user = this.application.getItem(comment.userId,"userId",true);
			if (user) {
				var title = domConstr.create("p",{
					"class": "title",
					"innerHTML": ":"
				}, div, "first");
				domConstr.create("a",{
					"href": user.profile,
					"innerHTML": user.name
				}, title, "first");
				domConstr.create("img",{
					"class": "profileImage",
					"width": "48",
					"height": "48",
					"src": user.imageSrc
				}, div, "first");
			}
			return div;
		},
		
		show: function() {
			this._dialog.show();
		},
		
		hide: function() {
			this._dialog.hide();
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