// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/date/locale"
], function(
	declare, request, lang, array, locale
) {
	"use strict";
    
    var construct = declare(null,{
		"config":{},
		"application":{},
		
		constructor: function(config){
			console.log("FACEBOOK IS HERE!",config);
			this._init(config);
		},
		
		_init: function(config) {
			this.config = config;
			this.application = config.application;
			
			request(ajaxurl,{
				"handleAs": "json",
				"query": {
					'action':'wpTweetingMarvalousFacebook',
					'id':'christiancentre'
				},
			}).then(
				lang.hitch(this,this._dataLoaded),
				function(error) {
					console.error(error);
				}
			);
		},
		
		_dataLoaded: function(data) {
			console.log(data);
			var parsedData = new Array();
			
			var userLookup = {};
			var users = new Array();
			array.forEach(data.data,function(statusObj) {
				var parsedStatusObj = this._parseStatusObj(statusObj);
				if (!userLookup.hasOwnProperty(statusObj.from.id)) {
					users.push(statusObj.from.data);
					userLookup[statusObj.from.id] = true;
				}
				parsedData.push(parsedStatusObj);
			}, this);
			
			var parsedUsers = this._parseUsers(users);
			this.config.onsuccess(parsedData);
			this.config.onmeta(parsedUsers);
		},
		
		_parseStatusObj: function(statusObj) {
			var parsedData = {
				"id":"fb"+statusObj.type+"_"+statusObj.id,
				"facebookId":statusObj.id,
				"type":"fb"+statusObj.type,
				"text":statusObj.message,
				"userId":statusObj.from.id,
				"date":locale.parse(statusObj.updated_time,{
					"datePattern": "yyyy-MM-ddTHH:mm:ssZZZZ",
					"selector": "date"
				})
			};
			
			if (statusObj.comments.count > 0) {
				parsedData.comments = this._getCommentData(statusObj.comments.data);
			} else {
				parsedData.comments = new Array();
			}
			
			console.log(statusObj.comments.count,parsedData,statusObj);
			return parsedData;
		},
		
		_getCommentData: function(comments) {
			var parsedComments = new Array();
			array.forEach(comments, function(comment) {
				parsedComments.push({
					"id": comment.id,
					"message": comment.message,
					"userId": comment.from.id
					/*"date":locale.parse(statusObj.updated_time,{
						"datePattern": "yyyy-MM-ddTHH:mm:ssZZZZ",
						"selector": "date"
					})*/
				})
			}, this);
			
			return parsedComments;
		},
		
		_parseUsers: function(fbUsers) {
			var users = new Array();
			array.forEach(fbUsers,function(userObj){
				users.push({
					"id":"facebook_user_"+userObj.id,
					"type":"facebookUser",
					"userId":userObj.id,
					"username":userObj.username,
					"name":userObj.name,
					"description":((userObj.hasOwnProperty("description"))?userObj.description:userObj.bio),
					"location":userObj.location,
					"imageSrc":userObj.picture,
					"website":userObj.website,
					"profile":userObj.link
				});
			}, this);
			
			return users;
		}
	});
    
    return construct;
});