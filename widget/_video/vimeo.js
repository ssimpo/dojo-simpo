/*global define */

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
	"./_base",
	"dojo/dom-construct",
	"dojo/_base/lang",
	"dojo/_base/json"
], function (declare, _videoBase, domConstruct, lang, JSON){
    
    "use strict";
	var construct = declare("simpo.widget._video.vimeo",[_videoBase],{
		
		'height':0,
		'width':0,
		
		'_apiUrl':'http://a.vimeocdn.com/js/froogaloop2.min.js',
		'_iframe':{},
		'_origin':'http://player.vimeo.com',
		'_readyDone':false,
		'_videoUrl':'',
		
		_loadApi: function(){
			//this._require([this._apiUrl],this._apiLoaded);
			this._iframe = this._createVimeoIframe(this.node);
			window.addEventListener(
				"message",
				lang.hitch(this,this._handleIframeMessage),
				false
			);
			
			this._apiLoaded();
		},
		
		_handleIframeMessage: function(event){
			if((event.source == this._iframe.contentWindow) && (event.origin == this._origin)){
				console.log(event,event.data);
				
				var data = JSON.fromJson(event.data);
				if((data.event == 'ready') && (!this._readyDone)){
					this._ready(event);
				}
				
				if(data.event){
					this._handleEvent(data);
				}else if(data.method){
					this._handleMethod(data);
				}
			}
		},
		
		_handleMethod: function(data){
			if(data.method == 'getVideoUrl'){
				this._videoUrl = data.value;
			}
		},
		
		_handleEvent: function(event){
			var eventObj = {
				'bubbles': false,
				'cancelable':false,
				'target':this._iframe,
				'currentTarget':this._iframe,
				'originalTarget':this._iframe,
				'explicitOriginalTarget':this._iframe,
				'srcElement':this._iframe,
				'timeStamp':new Date().getTime(),
				//'player':event.target,
				'eventPhase':2,
				'type':event.event,
				'src':this._videoUrl
			};
					
			switch(event.event){
				case 'ready':
					this.emit("ready",eventObj); break;
				case 'play':
					this.emit("play",eventObj); break;
				case 'pause':
					this.emit("pause",eventObj); break;
				case 'finish':
					this.emit("end",eventObj); break;
			}
		},
		
		_ready: function(event){
			this._readyDone = true;
			this._iframe.contentWindow.postMessage(
				JSON.toJson({
					'method':'addEventListener',
					'value':'play'
				}),this._origin
			);
			this._iframe.contentWindow.postMessage(
				JSON.toJson({
					'method':'addEventListener',
					'value':'pause'
				}),this._origin
			);
			this._iframe.contentWindow.postMessage(
				JSON.toJson({
					'method':'addEventListener',
					'value':'finish'
				}),this._origin
			);
			this._iframe.contentWindow.postMessage(
				JSON.toJson({
					'method':'getVideoUrl'
				}),this._origin
			);
		},
		
		_apiLoaded: function(){
			this._playerReady = true;
			domConstruct.place(this._iframe,this.node);
			var eventObj = {
				'bubbles': false,
				'cancelable':false,
				'target':this._iframe
			};
			this.emit("playerReady",eventObj);
		},
		
		_createVimeoIframe: function(refNode){
			var src = 'http://player.vimeo.com/video/'+this.vid+'?api=1&player_id=player1';
			
			var iframe = domConstruct.create("iframe",{
				'src':src,
				'allowFullScreen':true,
				'webkitAllowFullScreen':true,
				'mozallowfullscreen':true,
				'width':'1',
				'height':'1',
				'id':'player1'
			},refNode);
			
			return iframe;
		}
		
	});
	
	return construct;
});