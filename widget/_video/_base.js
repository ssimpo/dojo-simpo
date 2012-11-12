// summary:
//      
// description:
//      
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
// todo:
//      

define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/Evented",
	"require",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/has",
	"simpo/has/flash",
	"simpo/has/video"
], function (declare, _widget, evented, require, on, lang, has, hasFlash, hasVideo){
	
    "use strict";
	var construct = declare("simpo.widget._video._base", [_widget, evented], {
		
		'vid': 0,
		'node': {},
		
		'onReady': null,
		'onFailCompatibility': null,
		'onPlay': null,
		'onPause': null,
		'onCued': null,
		'onBuffering': null,
		'onEnd': null,
		'onError': null,
		
		'_playerReady': false,
		
		postMixInProperties: function (){
			this._bindMixinEvents();
		},
		
		_bindMixinEvents: function (){
			if(lang.isFunction(this.onReady)){
				on(this, "playerReady", this.onReady);
			}
			if(lang.isFunction(this.onFailCompatibility)){
				on(this, "failCompatibility", this.onFailCompatibility);
			}
			if(lang.isFunction(this.onPlay)){
				on(this, "play", this.onPlay);
			}
			if(lang.isFunction(this.onPause)){
				on(this, "pause", this.onPause);
			}
			if(lang.isFunction(this.onBuffering)){
				on(this, "buffering", this.onBuffering);
			}
			if(lang.isFunction(this.onCued)){
				on(this, "cued", this.onCued);
			}
			if(lang.isFunction(this.onEnd)){
				on(this, "end", this.onEnd);
			}
			if(lang.isFunction(this.onError)){
				on(this, "error", this.onError);
			}
		},
		
		buildRendering: function (){
			if(this._testCompatibility()){
				this._loadApi();
			}else{
				var eventObj = {'bubbles': false, 'cancelable': false};
				this.emit("failCompatibility", eventObj);
			}
		},
		
		_loadApi: function (){
			
		},
		
		_testCompatibility: function (){
			// summary:
			//      Test whether current browser is capable of displaying
			//      the video.
			// todo:
			//      Move this into it's own dojo.has style class.
			
			return (has('flash') || has('video-h264-baseline') || has('video-webm'));
		},
		
		_require: function (packages, func){
			lang.hitch(this, require(packages, lang.hitch(this, func)));
		}
	});
	
	return construct;
});