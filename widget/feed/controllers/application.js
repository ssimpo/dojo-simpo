// summary:
//		Main application controller for the feed widget.
// description:
//		Controller manages the the flow of information between the application
//		componants, it's  database and views.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/Evented",
	"require",
	"dojo/request",
	"dojo/store/Memory",
	"./feed",
	"./widget",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/on"
], function(
	declare, evented, require, request, memory,
	feedController, widgetController,
	lang, array, on
){
	"use strict";
	
	var construct = declare([evented], {
		"src":"",
		
		"_appStore": {},
		"_metaStore": {},
		"_widgetController": {},
		"_domNode": {},
		"_displayer":{},
		
		constructor: function(config){
			this._init(config);
		},
		
		_init: function(config){
			// summary:
			//		Initialize object information.
			// config: object|string
			//		Either a settings object or location to load settings
			//		object from.
			// tags:
			//		private
			
			
			if(typeof config == "object"){
				if(config.hasOwnProperty("domNode")){
					this._domNode = config.domNode;
				}
				if(config.hasOwnProperty("src")){
					this.src = config.src;
					this._loadConfig();
				}else if((config.hasOwnProperty("type")) && (config.hasOwnProperty("feeds"))){
					this._configLoaded(config);
				}
			}else if(typeof config == "string"){
				this.src = config;
				this._loadConfig();
			}
		},
		
		_initDatabase: function(config){
			// summary:
			//		Initialize database.
			// description:
			//		creates two databases for general information and other
			//		connected meta data.  Stores are either provided via config
			//		or created within method.
			// tags:
			//		private
			// config: object
			//		config.appStore object [optional]
			//			reference to main database to use, if not supplied,
			//			method will create it's own.
			//		config.metaStore object [optional]
			//			reference to meta database to use, if not supplied,
			//			method will create it's own.
			
			if(typeof config == "object"){
				if(config.hasOwnProperty("appStore")){
					this._appStore = config.appStore;
				}
				if(config.hasOwnProperty("metaStore")){
					this._metaStore = config.metaStore;
				}
			}
			
			if(this._objectIsEmpty(this._appStore)){
				this._appStore = new memory({"idProperty": "id"});
			}
			if(this._objectIsEmpty(this._metaStore)){
				this._metaStore = new memory({"idProperty": "id"});
			}
		},
		
		_initDisplayer: function(displayerClass, config){
			// summary:
			//		Initialize the displayer.
			// description:
			//		Handle initialization of the displayer including it's
			//		config options and connecting to it's events.
			// tags:
			//		private
			// todo:
			//		1. Does this work if update/metaUpdate are not available?
			//		2. Can it be tweaked to handle multiple displayer classes
			//		for different feeds or feed data?
			// displayerClass: function
			//		Class for creation of a displayer instance.
			// config: object
			//		Application config options to pass directly to
			//		the displayer.
			
			this._displayer = new displayerClass({
				"config": config,
				"domNode": this._domNode,
				"application":this
			});
			
			if(typeof this._displayer.update === "function"){
				on(
					this, "update",
					lang.hitch(this._displayer, this._displayer.update)
				);
			}
			if(typeof this._displayer.updateMeta === "function"){
				on(
					this, "updateMeta",
					lang.hitch(this._displayer, this._displayer.updateMeta)
				);
			}
		},
		
		_initWidgetController: function(config){
			// summary:
			//		Initialize the widget controller.
			// description:
			//		Initialize the widget controller; used to handle individual
			//		feed items.
			// tags:
			//		private
			
			this._widgetController = new widgetController({
				"type": config.type,
				"application": this,
				"onsuccess": lang.hitch(
					this, this._widgetControllerLoaded, config
				),
				"onerror": lang.hitch(
					this, this._reportError, "Widget controller error"
				)
			});
		},
		
		_loadConfig: function(){
			// summary:
			//		Load the config file.
			// todo:
			//		Make generic so it is easier to test and can load any
			//		config file at any time (ie. on-the-fly not just
			//		at initialization).
			// tags:
			//		private
			
			request(this.src, {"handleAs": "json"}).then(
				lang.hitch(
					this, this._configLoaded
				),
				lang.hitch(
					this, this._reportError, "Load config error"
				)
			);
		},
		
		_configLoaded: function(config){
			// summary:
			//		Handle initialization based on config file.
			// description:
			//		Part of initialization, ran after the config file is
			//		loaded. Will initialize the databases, displayer and widget
			//		controller classes. Normally ran as a success-callback from
			//		a dojo/request.
			// tags:
			//		private
			// config: object
			//		Object is parsed content of a config file.
			
			this._require(["../models/displayers/"+config.type], function(displayerClass){
				this._initDatabase(config);
				this._initDisplayer(displayerClass,config);
				this._initWidgetController(config);
			});
		},
		
		getItem: function(id, field, getMeta, getMeta2){
			getMeta = ((getMeta == undefined)?false:getMeta);
			
			var lookup = {};
			lookup[field] = id;
			if(typeof getMeta !== "boolean"){
				lookup["type"] = getMeta;
				getMeta = ((getMeta2 == undefined)?false:getMeta2);
			}
			
			var store = ((getMeta)?this._metaStore:this._appStore);
			var results = store.query(lookup);
			if(results.length > 0){
				return results[0];
			}
			
			return false;
		},
		
		updateItem: function(object, type, updateMeta){
			type = ((type != undefined)?type:false);
			updateMeta = ((updateMeta != undefined)?updateMeta:false);
			
			if(typeof type === "boolean"){
				var temp = type;
				type = updateMeta;
				updateMeta = temp;
			}
			
			this._updateItem(object, type, updateMeta);
		},
		
		_updateItem: function(object, type, updateMeta){
			var store = ((updateMeta)?this._metaStore:this._appStore);
			var cObject = this.getItem(object.id, "id", updateMeta);
			
			if(cObject){
				if(!this._isEqual(cObject, object, {"widget":true})){
					this._putItem(store, object, type);
				}
			}else{
				this._addItem(store, object, type);
			}
		},
		
		_addItem: function(store, object, type){
			var eventPostfix = ((store == this._metaStore) ? "Meta" : "");
			store.add(object);
			var pos = this._getPositionInStore(store, object, type);
			this.emit("update" + eventPostfix, object, pos);
			this.emit("add" + eventPostfix, object, pos);
		},
		
		_putItem: function(store, object, type){
			var eventPostfix = ((store == this._metaStore) ? "Meta" : "");
			store.put(object, {"overwrite": true});
			pos = this._getPositionInStore(store, object, type);
			this.emit("update" + eventPostfix, object, pos);
		},
		
		_getPositionInStore: function(store, object, type){
			var results = this._queryInDateOrder(store, type);
			
			var pos = -1;
			array.every(results, function(item){
				pos++;
				if(item.id == object.id){
					return false;
				}
				return true;
			}, this);
			
			return pos;
		},
		
		_queryInDateOrder: function(store, type){
			var sort = {"sort":[{attribute:"date", descending: true}]};
			var query = (((type != undefined) || (type != false)) ? {"type":type} : {});
			
			return store.query(query, sort);
		},
		
		_widgetControllerLoaded: function(config){
			array.forEach(config.feeds,function(feed){
				new feedController({
					"application": this,
					"type": feed.type,
					"config": feed.settings,
					"src": feed.src,
					"onsuccess": lang.hitch(
						this, this._feedLoaded
					),
					"onerror": lang.hitch(
						this, this._reportError, "Feed controller error"
					),
					"onmeta": lang.hitch(
						this, this._feedMetaLoaded
					)
				});
			},this);
		},
		
		_feedLoaded: function(data){
			array.forEach(data,function(item){
				this._widgetController.createWidget({
					"displayer": this._displayer,
					"application": this,
					"config": item,
					"type": item.type,
					"onsuccess": lang.hitch(
						this, this._widgetLoaded
					),
					"onerror": lang.hitch(
						this, this._reportError, "Create Widget error"
					)
				});
			},this);
		},
		
		_feedMetaLoaded: function(data){
			array.forEach(data, function(item){
				this.updateItem(item,true);
				this._widgetController.createWidget({
					"displayer": this._displayer,
					"application": this,
					"config": item,
					"type": item.type,
					"onsuccess": lang.hitch(
						this, this._widgetMetaLoaded
					),
					"onerror": lang.hitch(
						this, this._reportError, "Create Meta Widget error"
					)
				});
			}, this);
		},
		
		_widgetLoaded: function(widget){
			var config = widget.config;
			config.widget = widget;
			this.updateItem(config);
		},
		
		_widgetMetaLoaded: function(widget){
			var config = widget.config;
			config.widget = widget;
			this.updateItem(config,true);
		},
		
		_reportError: function(notes, error){
			console.error(notes, error);
		},
		
		_require: function(classes, callback){
			lang.hitch(this, require(classes, lang.hitch(this,callback)));
		},
		
		_objectIsEmpty: function isEmpty(obj){
			for(var prop in obj){
				if(obj.hasOwnProperty(prop)){
					return false;
				}
			}
			return true;
		},
		
		_isEqual: function(obj1, obj2, exceptions){
			exceptions = ((exceptions == undefined) ? {} : exceptions);
			var props = this._appendProps(obj1, {}, exceptions);
			props = this._appendProps(obj2, props, exceptions);
			
			for(var prop in props){
				if((obj1.hasOwnProperty(prop)) && (obj2.hasOwnProperty(prop))){
					if((typeof obj1[prop] != "function") && (typeof obj2[prop] != "function")){
						if((typeof obj1[prop] == "object") && (typeof obj2[prop] == "object")){
							var test2 = this._isEqual(obj1[prop], obj2[prop]);
							if(!test2){
								return false;
							}
						}else{
							if(obj1[prop] != obj2[prop]){
								return false;
							}
						}
					}else{
						if(typeof obj1[prop] != typeof obj2[prop]){
							return false;
						}
					}
				}else{
					return false;
				}
			}
			
			return true;
		},
		
		_appendProps: function(obj, props, exceptions){
			props = ((props == undefined) ? {} : props);
			exceptions = ((exceptions == undefined) ? {} : exceptions);
			
			for(var prop in obj){
				if(!exceptions.hasOwnProperty(prop)){
					props[prop] = true;
				}
			}
			
			return props;
		}
	});
	
	return construct;
});