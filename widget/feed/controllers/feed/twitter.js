// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/request/script",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/date/locale",
	"dojox/encoding/digests/MD5"
], function(
	declare, request, requestJson, lang, array, locale, MD5
) {
	"use strict";
    
    var construct = declare(null,{
		"statusesUrl":"https://api.twitter.com/1/statuses/user_timeline.json",
		"usersUrl":"https://api.twitter.com/1/users/lookup.json",
		"config":{},
		"userLog":{},
		"_linkLog":{},
		"mentions":[],
		"_links":[],
		
		constructor: function(config){
			console.log("TWITTER IS HERE!",config);
			this._init(config);
		},
		
		_init: function(config) {
			this.config = config;
			
			requestJson(ajaxurl, {
				"handleAs": "json",
				"method": "post",
				"preventCache": true,
				"data": {
					"action": "wpTweetingMarvalousTwitterProxy"
				}
			}).then(
				lang.hitch(this, this._dataLoaded),
				this.config.onerror
			);
		},
		
		_dataLoaded: function(data) {
			console.log("DATA", data);
			var parsedData = new Array();
			var userData = new Array();
			
			array.forEach(data,function(tweetObj) {
				var parsedTweetObj = this._parseTweetObj(tweetObj);
				parsedData.push(parsedTweetObj);
				this._handleUsers(tweetObj, userData);
				this._handleMentions(parsedTweetObj);
				this._handleLinks(parsedTweetObj);
			},this);
			
			this.config.onsuccess(parsedData);
			this.config.onmeta(userData);
			
			this._lookupMentionUsers();
			this._unshorten();
		},
		
		_handleUsers: function(tweetObj, userData) {
			var tweetObjUsers = this._getUserDataFromTweetObj(tweetObj);
			var users = this._parseUsers(tweetObjUsers);
			
			array.forEach(users,function(user) {
				if (!this.userLog.hasOwnProperty(user.username)) {
					userData.push(user);
					this.userLog[user.username] = true;
				}
			}, this);
		},
		
		_handleMentions: function(parsedTweetObj) {
			array.forEach(parsedTweetObj.mentions,function(mention) {
				this.mentions.push(mention.screen_name);
			}, this);
		},
		
		_handleLinks:function(parsedTweetObj) {
			array.forEach(parsedTweetObj.urls,function(urls) {
				var unid = MD5(urls.expanded_url, 1);
				if (!this._linkLog.hasOwnProperty(unid)) {
					this._links.push(urls.expanded_url);
					this._linkLog[unid] = true;
				}
			}, this);
		},
		
		_lookupMentionUsers: function() {
			var users = '';
			array.forEach(this.mentions,function(mention) {
				if (!this.userLog.hasOwnProperty(mention)) {
					if (users!='') {
						users += ',';
					}
					users += mention;
					this.userLog[mention] = true;
				}
			},this);
			
			request(this.usersUrl,{
				"jsonp": "callback",
				"query": {"screen_name":users}
			}).then(
				lang.hitch(this,this._userDataLoaded),
				this.config.onerror
			);
		},
		
		_unshorten: function() {
			array.forEach(this._links,function(url) {
				requestJson(ajaxurl,{
					"handleAs": "json",
					"query": {
						"action": "wpTweetingMarvalousUnshortenUrl",
						"url": url,
					}
				}).then(
					lang.hitch(this,this._unshortLoaded),
					this.config.onerror
				);
			},this);
		},
		
		_userDataLoaded: function(data) {
			var users = this._parseUsers(data);
			this.config.onmeta(users);
		},
		
		_unshortLoaded: function(data) {
			var linkObj = {
				"id":"link_"+MD5(data.originalUrl, 1),
				"type":"twitterLink",
				"orginalUrl":data.originalUrl,
				"unshortenedUrl":data.url,
				"title":this._getMetaTitle(data.meta),
				"description":this._getMetaDescription(data.meta)
			};
			this.config.onmeta([linkObj]);
		},
		
		_getMetaTitle: function(meta) {
			var title = '';
			
			if (meta.title) {
				if (typeof meta.title !== 'string') {
					meta.title = meta.title[0];
				}
				title = meta.title.replace(/[\n\r\f\t ]+/g,' ');
			}
			
			return title;
		},
		
		_getMetaDescription: function(meta) {
			var description = "";
			
			if (meta.og_description) {
				if (typeof meta.og_description !== 'string') {
					description = meta.og_description[0];
				} else {
					description = meta.og_description;
				}
			} else if (meta.description) {
				if (typeof meta.description !== 'string') {
					description = meta.description[meta.description.length-1];
				} else {
					description = meta.description;
				}
			}
			
			return description;
		},
		
		_parseTweetObj: function(tweetObj) {
			if (tweetObj.retweeted_status) {
				tweetObj = tweetObj.retweeted_status;
			}
			
			var parsedData = {
				"id":"tweet_"+tweetObj.id,
				"tweetId":tweetObj.id,
				"type":"tweet",
				"text":tweetObj.text,
				"hashtags":tweetObj.entities.hashtags,
				"urls":tweetObj.entities.urls,
				"mentions":tweetObj.entities.user_mentions,
				"userId":tweetObj.user.id,
				"date":locale.parse(tweetObj.created_at,{
					"datePattern": "EEE MMM dd HH:mm:ss ZZZZ yyyy",
					"selector": "date"
				})
			};
			
			//console.log(parsedData.urls);
			return parsedData;
		},
		
		_parseUsers: function(tweetUsers) {
			var users = new Array();
			array.forEach(tweetUsers,function(userObj){
				users.push({
					"id":"twitter_user_"+userObj.id,
					"type":"twitterUser",
					"userId":userObj.id,
					"username":userObj.screen_name,
					"name":userObj.name,
					"description":userObj.description,
					"following":userObj.followers_count,
					"followers":userObj.friends_count,
					"location":userObj.location,
					"imageSrc":userObj.profile_image_url,
					"website":userObj.url,
					"profile":"http://twitter.com/"+userObj.screen_name
				});
			},this);
			
			return users;
		},
		
		_getUserDataFromTweetObj: function(tweetObj) {
			var tweetUsers = new Array(tweetObj.user);
			if (tweetObj.retweeted_status) {
				tweetUsers.push(tweetObj.retweeted_status.user);
			}
			return tweetUsers;
		},
	});
    
    return construct;
});