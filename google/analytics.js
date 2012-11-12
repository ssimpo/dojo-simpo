define([
    "dojo/_base/declare",
    "dojo/has",
    "lib/flashDetect",
    "dojo/dom-attr",
    "dojo/_base/lang",
    "dojo/io-query",
    "dojo/dom-construct",
    "dojo/_base/window"
], function(
    declare, has, fd, domAttr, lang, ioQuery, domConstruct, win
) {
    
    var construct = declare("simpo.google.analytics",null,{
        cookies:true,
        account:0,
        domainHash:0,
        
        _isIE: false,
        _bowserSniffed:false,
	_gaImageBase:'http://www.google-analytics.com/__utm.gif',
        _gaVersionNo:'5.3.0',
        
        constructor: function() {
            this._init(arguments);
            this.load(this.cookies,this.account,this.domainHash,false);
        },
        
        _init: function(args) {
            // summary:
            //      Set object properties from supplied parameters.
            // args: array
            //      Array in format [object].
            
            var options = {
                'cookies':this.cookies,
                'account':this.account,
                'domainHash':this.domainHash
            };
            
            if (arguments.length == 1) {
                options = ((dojo.isArray(options)) ? args[0]:args);
            } else if (arguments.length == 2) {
                options = {
                    'cookies':arguments[0],
                    'account':arguments[1],
                    'domainHash':this.domainHash
                };
            } else if (arguments.length == 3) {
                options = {
                    'cookies':arguments[0],
                    'account':arguments[1],
                    'domainHash':arguments[2]
                };
                
            } 
            
            if (options.hasOwnProperty('cookies')) {
                this.cookies = options.cookies;
            } else if (dojoConfig.hasOwnProperty('googleAnalyticsCookies')) {
                this.cookies = dojoConfig.googleAnalyticsCookies;
            }
            
            if (options.hasOwnProperty('account')) {
                this.account = options.account;
            } else if (dojoConfig.hasOwnProperty('googleAnalyticsAccount')) {
                this.account = dojoConfig.googleAnalyticsAccount;
            }
            
            if (options.hasOwnProperty('domainHash')) {
                this.domainHash = options.domainHash;
            } else if (dojoConfig.hasOwnProperty('googleAnalyticsDomainHash')) {
                this.domainHash = dojoConfig.googleAnalyticsDomainHash;
            }
        },
        
        load: function(cookies,account,domainHash,reset) {
            // summary:
            //      Load Google Analytics either with or without cookies
            // cookies: boolean
            //      Use cookies or not?
            // account: string
            //      Google Analytics account ID
            // domainHash: integer
            //      The unique site id.
            // reset: boolean (optional)
            //      Whether to reset the cookie|account properties of the this object.
            
            reset = ((reset==undefined)?true:reset);
            reset = ((domainHash==undefined)?true:reset);
            domainHash = ((domainHash==undefined)?this.domainHash:domainHash);
            if (reset) {
                this._init(cookies,account,domainHash);
            }
            
            if (cookies) {
                this._loadWithCookies(account);
            } else {
                this._loadWithoutCookies(account);
            }
        },
        
        _loadWithCookies: function(account) {
            // summary:
            //      Load Google Analytics.
            // account: string
            //      The account number to use.
            
            window._gaq = window._gaq || [];
            window._gaq.push(['_setAccount', account]);
            window._gaq.push(['_trackPageview']);
                
            url = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            
            this._insertScriptIntoHead(url,function(){});
        },
        
        _loadWithoutCookies: function(account) {
            // summary:
            //      Load Google Analytics without cookies.
            // description:
            //      This is a no-cookies work-around for Google Analytics. The
            //      GA gif image is created manually.
            // account: string
            //      The account number to use
            
            var gaQuery = {
                'utmwv':this._gaVersionNo,
                'utms':1,
                'utmn':this._getRndomNo(1,10000000000),
                'utmhn':this._getHostName(),
                'utmcs':this._getCharacterCoding(),
                'utmsr':this._getDisplaySize(),
                'utmvp':this._getBrowserSize(),
                'utmsc':this._getColourDepth(),
                'utmul':this._getLanguage(),
                'utmje':this._getJavaEnabled(),
                'utmfl':this._getFlashVersion(),
                'utmdt':this._getPageTitle(),
                'utmr':this._getReferer(),
                'utmp':this._getPath(),
                'utmac':this.account,
                'utmcc':this._getCookieData(),
                'utmu':'q~'
            };
            
            var image = domConstruct.create('img',{
                'src':this._gaImageBase+'?'+ioQuery.objectToQuery(gaQuery),
                'height':1, 'width':1
            },win.body());
        },
        
        _getRndomNo: function(from,to) {
            // summary:
			//      Get a random number (integer) between two numbers.
			// from: integer
			//      Start for range of possibilities for random numbers.
			// to: integer
			//      End for range of possibilities for random numbers.
            // returns: integer
            
            return Math.floor(Math.random() * (to - from + 1) + from);
        },
        
        _getHostName: function() {
			// summary:
			//		Get the current hostname.
			// returns: string
		
            var host = '';
            
            if (location.hostname) {
                host = location.hostname;
            } else if (location.host) {
                host = location.host;
            }
            
            return host;
        },
        
        _getCharacterCoding: function() {
			// summary:
			//		Get the character encoding
			// returns: string
			//		The character encoding, defaults to 'utf-8'
			
            var charset = 'utf-8';
            
            var metaCharset = dojo.query("meta[charset]");
            if (metaCharset.length > 0) {
                var meta = metaCharset[metaCharset.length-1];
                charset =  domAttr.get(meta, 'charset');
            } else {
                var metaCharset = dojo.query("meta[http-equiv]");
                if (metaCharset.length > 0) {
                    dojo.forEach(metaCharset,function(meta) {
                        var content = domAttr.get(meta, 'content');
                        content = this._splitMetaContent(content);
                    
                        dojo.forEach(content,function(data) {
                            if (this._isEqual('charset',data.name)) {
                                charset =  lang.trim(data.value.toLowerCase());
                            }
                        },this);
                    
                    },this);
                } else if (document.characterSet) {
                    charset =  document.characterSet.toLowerCase();
                } else if (document.inputEncoding) {
                    charset =  document.inputEncoding.toLowerCase();
                }
            } 
            
            return lang.trim(charset.toLowerCase());
        },
        
        _getDisplaySize: function() {
			// summary:
			//		Get the display dimensions
			// returns: string
			//		Display dimensions as width x height
			
            return window.screen.width+'x'+window.screen.height;
        },
        
        _getBrowserSize: function() {
			// summary:
			//		Get the browser window dimensions
			// returns: string
			//		Browser window dimensions as width x height
			
            var winW = 630;
            var winH = 460;
            
            if (document.body && document.body.offsetWidth) {
                winW = document.body.offsetWidth;
                winH = document.body.offsetHeight;
            }
        
            if (document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.offsetWidth ) {
                winW = document.documentElement.offsetWidth;
                winH = document.documentElement.offsetHeight;
            }
            
            if (window.innerWidth && window.innerHeight) {
                winW = window.innerWidth;
                winH = window.innerHeight;
            }

            return winW+'x'+winH;
        },
        
        _getColourDepth: function() {
			// summary:
			//		Get the colour depth
			// returns: string
			//		The colour depth as. 'depth'-bit. Defaults to '16-bit'.
			
            var colourDepth = 16;
            
            if (navigator.colorDepth) {
                colourDepth = navigator.colorDepth;
            } else if (screen.colorDepth) {
                colourDepth = screen.colorDepth;
            }
            return colourDepth+'-bit';
        },
        
        _getLanguage: function() {
			// summary:
			//		Get the browser language.
			// returns: string
			//		The browser language, defaults to en-us.
			
            var language = 'en-us';
            if (navigator.language) {
                language = navigator.language;
            }
            return language;
        },
        
        _getJavaEnabled: function() {
			// summary:
			//		Is java enabled?
			// returns: boolean
			
            return navigator.javaEnabled();
        },
        
        _getFlashVersion: function() {
			// summary:
			//		Get the installed flash version.
			// returns: string
			//		The flash version string as '<major>.<minor> rev<revision>'.
			//		eg. '11.7 rev567'.  Defaults to blank-string = no flash.
			
            var flashDetect = new fd();
            var version = flashDetect.major+'.'+flashDetect.minor+' '+flashDetect.revisionStr;
            return version;
        },
        
        _getPageTitle: function() {
			// summary:
			//		Get the page title.
			// returns: string
			
            var title = '';
            
            var titles = dojo.query("title");
            if (titles.length > 0) {
                title = this._getNodeText(titles[titles.length-1]);
            }
            
            return title;
        },
        
        _getReferer: function() {
			// summary:
			//		Get the referer.
			// returns: string
			
            var referer = '';
            if (document.referer) {
                referer = document.referer;
            }
            return referer;
        },
        
        _getPath: function() {
			// summary:
			//		Get the path.
			// returns: string
			
            var path = '/';
            
            if (location.pathname) {
                path = location.pathname;
            }
            
            return path;
        },
        
        _getCookieData: function() {
			// summary:
			//		Get the cookie data.
			// note:
			//		The cookie data generated here is just defaults and will
			//		make non-sense of any session or users data.  The idea is
			//		to remove need for actual cookies, the trade-off is
			//		meaningful user/session data.
			// returns: string
			
            var cookie = '';
            var cDate = new Date();
            
            cookie += this.domainHash;  // DOMAINHASH
            cookie += '.'+this._getRndomNo(1,10000000000);  // RANDOMNUM
            cookie += '.'+cDate.getTime();  // TIMEFIRSTVISIT
            cookie += '.'+cDate.getTime();  // TIMEPREVIOUSVISIT
            cookie += '.'+cDate.getTime();  // CURRENTTIME
            cookie += '.1';  // NUMBEROFSESSIONS
            cookie += '.1';  // NUMBEROFSOURCES
            
            return cookie;
        },
        
        _appendScript: function(node,src,onload,onerror) {
            // summary:
            //      Insert a script into the DOM at a given point.
            // description:
            //      Load scripts asynchronously cross-browser.  Will insert
            //      a script tag for the given URL at the specified position
            //      in the DOM.  When script is loaded, fire the onload event.
            // node: object XMLNode
            //      The XML node to insert the script tag into.
            // src: string
            //      The URL to load the script from
            // onload: function
            //      The callback function to fire when script has loaded.
            // returns: XMLNode
            //      The script node being used as a loader.
            
            var done = false;
    
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.async = true;
            
            var boundOnload = onload.bind(this);
            var func = function() {
                if ( !done && (!script.readyState || script.readyState == "loaded" || script.readyState == "complete") ) {
                    done = true;
                    boundOnload();
                }
            };
            
            if (this._ieVersion()) {
                script.onreadystatechange = func.bind(this);
            } else {
                script.onload = func.bind(this);
            }
            
            if (onerror != undefined) {
                script.onerror = onerror.bind(this);
            }
            
            node.appendChild(script)
            return script;
        },
        
        _insertScriptIntoHead: function(src,onload,onerror) {
            // summary:
            //      Insert a script tag into the page <head>.
            // description:
            //      Insert a script into the page <head> and fire a callback
            //      event once it is loaded.  Used for asynchronous
            //      script loading.
            // src: string
            //      The URL to load the script from
            // onload: function
            //      The callback function to fire when script has loaded.
            // returns: XMLNode
            //      The script node being used as a loader.
            
            var head = document.getElementsByTagName("head")[0];
            return this._appendScript(head, src, onload, onerror);
        },
        
        _ieVersion: function() {
            // summary:
            //      Get the Internet Explorer version (or false if other browser).
            // note:
            //      Code largely taken from dojo._base.sniff.
            // returns: integer
            //      Version number
            // todo:
            //      If Google fails it'll try local but could add another CDN in order
            
            if (this._bowserSniffed) { return this.isIE; }
            
            var webkit = parseFloat(navigator.userAgent.split("WebKit/")[1]) || undefined;
            if (!webkit) {
                if (navigator.userAgent.indexOf("Opera") == -1) {
                    if(document.all) {
                        this.isIE = parseFloat(navigator.appVersion.split("MSIE ")[1]) || undefined;
			var mode = document.documentMode;
			if(mode && mode != 5 && Math.floor(this.isIE) != mode){
			    this.isIE = mode;
			}
                    }
                }
            }
            
            this.isIE = (((this.isIE == undefined) || (this.isIE == 0)) ? false : this.isIE);
            
            return this.isIE;
        },
        
        _splitMetaContent: function(content) {
			// summary:
			//		Split meta content data into it's parts.
			// description:
			//		The content attribute of meta tags are often written as a
			//		series of items in the format: <itemname>:<itemvalue>;
			//		<itemname>:<itemvalue>;...etc.  This function will split
			//		those items and convert them into an array of
			//		item/value objects.
			// returns: object
			
            content = (((content==null)||(content==undefined)) ? '':content);
            var splitContent = new Array();
            var parts = content.split(';');
            dojo.forEach(parts,function(part,n) {
                var parts2 = part.split('=');
                var name = parts2[0];
                var value = '';
                
                if (parts2.length == 2) {
                    value = parts[1];
                }
                
                if (!this._isEqual(name,'')) {
                    splitContent[n] = {'name':name,'value':value};
                }
            },this);
            
            return splitContent;
        },
        
        _getNodeText: function(node) {
			// summary:
			//      Get the text content of a node (regardless of browser).
			// node: Object XML
			//      The XML element node you want the text content of.
			// returns: String
            
			if (node.textContent) {
				return node.textContent;
			} else if (node.text) {
				return node.text;
            } else if (node.innerText) {
				return node.innerText;
			} else {
				return '';
			}
        },
        
        _isEqual: function(text1,text2) {
			// summary:
			//      Test if two pieces of text are equal.  Test is
            //      non-case-sensative and trims both text strings first.
			// text1: string
			//      First string to test
			// text2: string
			//      Second string to test
			// returns: boolean
	
			if (text1 == undefined) { text1 =''; }
			if (text2 == undefined) { text2 =''; }
	
			var ctext1 = lang.trim(text1.toString().toLowerCase());
			var ctext2 = lang.trim(text2.toString().toLowerCase());
	
			return ( (ctext1 == ctext2) ? true:false );
        }
    });
    
    return construct;
});