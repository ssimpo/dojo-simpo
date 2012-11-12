if (!simpo) var simpo = {};
if (!simpo.objects) simpo.objects = new Array();

define([
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/io-query"
], function(declare, dom, domConstruct, query, lang, ioQuery){
    
    var construct = declare("simpo.io.script",null,{
        url:'',
        content:{},
        callbackParamName:'callback',
        id:0,
        load:{},
        error:{},
        _apiCallback:'',
        _scriptId:'',
        
        constructor: function(args) {
            if (args.url) {
                this._scriptId = 's'+this._rndId(args.url);
                if (!args.content) args.content = {};
                if (args.callbackParamName) this.callbackParamName = args.callbackParamName;
                if (args.load) this.load = args.load;
                
                var script = dom.byId('#'+this._scriptId);
                if (!script) {
                    simpo.objects.push(this);
                    this.id = (simpo.objects.length-1);
                    
                    this._apiCallback = 'f'+this._rndId();
                    args.content[this.callbackParamName] = this._apiCallback;
                    this.url = this._appendQueryString(args.url,args.content);
                    
                    var head = query("head")[0];
                    script = domConstruct.create('script',{'type':'text/javascript'},head);
                    script.text = 'function '+this._apiCallback+'(data){ simpo.objects['+this.id+']._load(); }';
                    
                    domConstruct.create('script',{
                        'type':'text/javascript',
                        'id':this._scriptId,
                        'src':this.url,
                        'async':true
                    },head);
                } else {
                    this._load();
                }
            }
        },
        
        _rndId: function() {
            return this._randomInt(0,1000000000000);
        },
        
        _randomInt: function(from, to){
            return Math.floor(Math.random() * (to - from + 1) + from);
        },
        
        _load: function(data) {
            if (lang.isFunction(this.load)) {
                this.load(data);
            }
        },
        
        _error: function(e) {
            if (lang.isFunction(this.error)) {
                this.error(data);
            }
        },
        
        _appendQueryString: function (url,key,value) {
            // todo:
            //	This will not work when there is a hash in the url and a query.
            if (this._contains(url,'?')) {
                var parts = url.split('?');
                var query = ioQuery.queryToObject(parts[1]);
                if (value == undefined) {
                    if (lang.isObject(key)) {
                        query = lang.mixin(query,key);
                    } else {
                        query = lang.mixin(query,ioQuery.queryToObject(key));
                    }
                } else {
                    query[key] = value;
                }
                if (this._objectIsEmpty(query)) {
                    return parts[0];
                } else {
                    return parts[0]+'?'+ioQuery.objectToQuery(query);
                }
            } else {
                if (value == undefined) {
                    query = {}
                    if (lang.isObject(key)) {
                        query = key;
                    } else {
					query = ioQuery.queryToObject(key);
                    }
                    if (this._objectIsEmpty(query)) {
                        return url;
                    } else {
                        return url+'?'+ioQuery.objectToQuery(query);
                    }
                } else {
                    return url+'?'+escape(key)+'='+escape(value);
                }
            }
        },
        
        _objectIsEmpty: function(object) {
			// summary:
			//	Test whether a given object is empty or not.
			// object: Object
			//	The object to test.  Does it have any properties?
			// returns: Boolean
	    
			var i = 0;
			if (lang.isObject(object)) {
				try {
					for (var prop in object) { i++; }
				} catch(e) { //Assume an ActiveX Object and that it must have properties
					return false;
				}
			}
			return ( (i==0) ? true:false );
		},
        
        _contains: function(text,test) {
            // summary:
            //	Test whether one string is contained within an other.
            // text: String
            //	String to test (test subject).
            // test: String
            //	String to test for.
            // return: Boolean
	
            return ((text.toLowerCase().indexOf(test.toLowerCase()) == -1) ? false:true);
        }
	});
    
    return construct;
});