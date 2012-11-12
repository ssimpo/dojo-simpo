// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/query",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-attr"
], function(declare, _widget, _templated, win, domConstruct, query, lang, array, domAtt) {
    
    var construct = declare("simpo.facebook.loader",[_widget,_templated],{
		templateString:'<div id="fb-root" data-dojo-attach-point="fbroot"></div>',
		
		scriptId:'facebook-jssdk',
		appId:0,
		channelUrl:'',
		status:true,
		cookie:true,
		xfbml:true,
		
		_loaderFunctions:[],
		
		postCreate: function() {
			this.inherited(arguments);
			
			domAtt.set(this.fbroot,'id','fb-root')
			this._addMainFacebookInit();
			this._setFacebookInit();
			this._placeFacebookLoader(this.fbroot);
		},
		
		_setFacebookInit: function() {
			var loaders = this._loaderFunctions;
			window.fbAsyncInit = lang.hitch(window,function() {
				array.forEach(loaders,function(loader) {
					lang.hitch(this,loader());
				},this);
			});
		},
		
		_addMainFacebookInit: function() {
			var self = this;
			var init = lang.hitch(window.fbAsyncInit, function() {
				FB.init({
					appId:self.appId,
					channelURL:self.channelId,
					status:self.status,
					cookie:self.cookie,
					xfbml:self.xfbml
				});
			});
		},
		
		_placeFacebookLoader: function(refNode) {
			var id = this.scriptId;
			
			var fbLoader = function() {
				var elements = query('#'+id);
				if (elements.length > 0) { return; }
				
				var script = domConstruct.create(
					'script',{
						'id':id,
						'src':'//connect.facebook.net/en_US/all.js',
						'async':true
					},refNode,"after"
				);
            };
            fbLoader = lang.hitch(win.doc,fbLoader);
            fbLoader();
		}
	});
    
    return construct;
});