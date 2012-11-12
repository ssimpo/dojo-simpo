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
	"dojo/_base/lang",
	"dojo/dom-construct"
], function(declare, _videoBase, lang, domConstruct){
    
    "use strict";
	var construct = declare("simpo.widget._video.youtube",[_videoBase],{
		
		'height':0,
		'width':0,
		
		'_apiUrl':'http://www.youtube.com/player_api',
		
		_loadApi: function(){
			window.onYouTubePlayerAPIReady = lang.hitch(this,this._ready);
			require([this._apiUrl],function(){});
		},
		
		_ready: function(){
			// summary:
			//      Called when the YouTube API is downloaded and ready.
			
			if(window.YT){
				this._youtube = window.YT;
			}else if(typeof YT !== "undefined"){
				this._youtube = YT;
			}
			
			this._player = new this._youtube.Player(
				this.node,{
				'height':this.height,
				'width':this.width,
				'videoId':this.vid,
				'events':{
					'onReady':lang.hitch(this,this._onPlayerReady),
					'onStateChange':lang.hitch(this,this._onStateChange),
					'onError':lang.hitch(this,this._onErrorPlayer)
				}
			});
		},
		
		_onPlayerReady: function(event){
			if(!this._playerReady){
				this._playerReady = true;
				domConstruct.place(event.target.getIframe(),this.node);
				var eventObj = {
					'bubbles': false,
					'cancelable':false,
					'target':event.target.getIframe(),
					'currentTarget':event.target.getIframe(),
					'originalTarget':event.target.getIframe(),
					'explicitOriginalTarget':event.target.getIframe(),
					'srcElement':event.target.getIframe(),
					'src':event.target.getVideoUrl(),
					'timeStamp':new Date().getTime(),
					'player':event.target,
					'type':'ready',
					'eventPhase':2
				};
				this.emit("playerReady",eventObj);
			}
		},
		
		_onStateChange: function(event){
			var eventObj = {
				'bubbles': false,
				'cancelable':false,
				'target':event.target.getIframe(),
				'currentTarget':event.target.getIframe(),
				'originalTarget':event.target.getIframe(),
				'explicitOriginalTarget':event.target.getIframe(),
				'srcElement':event.target.getIframe(),
				'timeStamp':new Date().getTime(),
				'player':event.target,
				'eventPhase':2
			};
			
			switch(event.data){
				case -1:
					eventObj = lang.mixin(eventObj,{
						'type':'ready'
					});
					this.emit("ready",eventObj);
					break;
				case this._youtube.PlayerState.ENDED:
					eventObj = lang.mixin(eventObj,{
						'type':'end',
						'src':event.target.getVideoUrl()
					});
					this.emit("end",eventObj);
					break;
				case this._youtube.PlayerState.PLAYING:
					eventObj = lang.mixin(eventObj,{
						'type':'play',
						'src':event.target.getVideoUrl()
					});
					this.emit("play",eventObj);
					break;
				case this._youtube.PlayerState.PAUSED:
					eventObj = lang.mixin(eventObj,{
						'type':'pause',
						'src':event.target.getVideoUrl()
					});
					this.emit("pause",eventObj);
					break;
				case this._youtube.PlayerState.BUFFERING:
					eventObj = lang.mixin(eventObj,{
						'type':'buffering',
						'src':event.target.getVideoUrl()
					});
					this.emit("buffering",eventObj);
					break;
				case this._youtube.PlayerState.CUED:
					eventObj = lang.mixin(eventObj,{
						'type':'cued',
						'src':event.target.getVideoUrl()
					});
					this.emit("cued",eventObj);
					break;
			}
		},
		
		_onErrorPlayer: function(event){
			// summary:
			//      Called when there is an error from the player.
			// event: object
			//      The YouTube event object
			
			var errorString = '';
			switch(event.data){
				case 2:
					errorString = 'Invalid parameter in the request URL.';
					break;
				case 100:
					errorString = 'Video not found.';
					break;
				case 101: case 150:
					errorString = 'The video owner does not allow playback in embedded players.';
					break;
			}
			
			var eventObj = {
				'bubbles': false,
				'cancelable':false,
				'target':event.target.getIframe(),
				'currentTarget':event.target.getIframe(),
				'description':errorString,
				'code':event.data,
				'src':event.target.getVideoUrl(),
				'timeStamp':new Date().getTime(),
				'player':event.target
			};
			this.emit("error",eventObj);
		}
		
	});
	
		return construct;
});