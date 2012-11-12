/*global define */

// summary:
//      Class to display a you tube video.
// description:
//      Class to display a YouTube video using the YouTube API.  Will take-care
//      of the API downloading and compatibility testing. Makes display easy
//      by providing dojo style tag tags requiring no javascript.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
// todo:
//      Change to generic video class, which cam display YouTube/Vimeo/Local

define([
    "dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
    "dojo/Evented",
    "./_loadingDiv",
    "./_messageDiv",
    "require",
    "dojo/on",
    "dojo/_base/lang",
    "dojo/dom-style"
], function(
    declare, _widget, _templated, Evented, loadingDiv, messageDiv,
    require, on, lang, domStyle
){
    
    "use strict";
	var construct = declare("simpo.widget.video",[
        _widget,_templated,Evented,loadingDiv,messageDiv
    ],{
        'templateString': '<div data-dojo-attach-point="container" style="float:left">&nbsp;</div>',
        'vid':'',
        'width':0,
        'height':0,
        'useGoogleAnalytics':true,
        'type':'youtube',
        
        postMixInProperties: function() {
            on(this, "error",lang.hitch(this,this._logError));
            this.type = lang.trim(this.type.toLowerCase());
            this._addLoadingErrorCaputure();
            
            // For testing of Vimeo
            //this.vid = '21294655';
            //this.type = 'vimeo';
        },
        
        postCreate: function() {
            domStyle.set(this.domNode,{
                'height':this.height+'px',
                'width':this.width+'px'
            });
            
            this._toggleLoading();
            this._require(['./_video/'+this.type],this._playerLoaded);
            //this._showErrorDiv();
        },
        
        _playerLoaded: function(playerObj) {
            var player = new playerObj({
                'vid':this.vid,
                'onReady':lang.hitch(this,this._displayPlayer),
                'onFailCompatibility':lang.hitch(this,this._compatibilityFail),
                'node':this._hiddenDiv
            });
            
            if (this.useGoogleAnalytics) {
                on(player, "play",lang.hitch(this,this._logPlay));
                on(player, "end",lang.hitch(this,this._logEnd));
            }
        },
        
        _displayPlayer: function(event) {
            this._toggleLoading();
            domStyle.set(event.target,{
                'height':this.height+'px',
                'width':this.width+'px',
                'visibility':'visible'
            });
        },
        
        _compatibilityFail: function() {
            this._showPleaseInstallDiv();
        },
        
        _require: function(packages,func) {
            lang.hitch(this,require(packages,lang.hitch(this,func)));
        },
        
        _addLoadingErrorCaputure: function() {
            var func = function(event) {
                function _getEventTarget(event) {
                    if (event.target) { return event.target; }
                    if (event.orginalTarget) { return event.orginalTarget; }
                    if (event.srcElement) { return event.srcElement; }
                    if (event.currentTarget) { return event.currentTarget; }
                
                    return event;
                }
                
                function _getNodeURI(node) {
                    if (node.src) { return node.src; }
                    if (node.href) { return node.href; }
                    if (node.source) { return node.source; }
                    if (node.action) { return node.action; }
                    return '';
                }
                
                var target = _getEventTarget(event);
                var url = _getNodeURI(target);
                
                if (
                    (url == this._youtubeApiUrl)
                    ||
                    (url == this._vimeoApiUrl)
                ) {
                    var eventObj = {
                        'bubbles': false,
                        'cancelable':false,
                        'target':target,
                        'description':'Could not load YouTube API',
                        'code':1,
                        'src':url
                    };
                    
                    this.emit("error",eventObj);
                }
            }
            
            func = lang.hitch(this,func);
            try {
                document.addEventListener('error',func,true);
            } catch(e) {
                if (window.addEventListener) {  
                    window.addEventListener('error',func, true);   
                } else if (window.attachEvent)  {  
                    window.attachEvent('onerror',func);  
                }  
            }
        },
        
        _showPleaseInstallDiv: function() {
            var template = '<p>The Adobe Flash Player or an HTML5 supported browser is required for video playback.</p><ul><li><a href="http://get.adobe.com/flashplayer/">Get the latest Flash Player</a></li><li><a href="http://www.youtube.com/html5">Learn more about upgrading to an HTML5 browser</a></li></ul>';
            if (this._standbyOn) { this._standbyOn = false; }
            this._showMessage(template);
        },
        
        _showErrorDiv: function() {
            var template = '<p>There was an error in loading this video.  It may be due to network errors.  Please refresh the page; if that does not work, please try again later.</p>';
            if (this._standbyOn) { this._standbyOn = false; }
            this._showMessage(template);
        },
        
        _logGoogleAnalyticsEvent: function(event) {
            // summary:
            //      Log an event to Google Analytics if analytics logging
            //      is set to true.
            // event: object
            //      The event to log in the form:
            //          event.action: The action to log (eg. Play).
            //          event.url: The url to log against.
            //          event.data: Any other data (eg. An error number).
            
            if (this.useGoogleAnalytics) {
                window._gaq = window._gaq || [];
                if (event.description) {
                    _gaq.push(['_trackEvent','Videos',event.type,event.src,event.data]);
                } else {
                    _gaq.push(['_trackEvent','Videos',event.type,'',event.src]);
                }
            }
        },
        
        _logPlay: function(event) {
            this._logGoogleAnalyticsEvent(event);
        },
        
        _logEnd: function(event) {
            this._logGoogleAnalyticsEvent(event);
        },
        
        _logError: function(event) {
            this._showErrorDiv();
            this._logGoogleAnalyticsEvent(event); 
        }
    });
    
    return construct;
});