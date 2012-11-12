// summary:
//		Widgets controller.
// description:
//		Widgets controller used to create widgets according to supplied config
//		and mapping document.  Changing the application config or the mapping
//		file allows for a highly-flexible widget.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"require",
	"dijit/registry",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/_base/array"
], function(
	declare, require, registry, request, lang, array
){
	"use strict";
	
	var construct = declare(null, {
		"type": "sidebar",
		"mappingUrl": "../models/mappings.json",
		"mapping": {},
		"application": {},
		
		constructor: function(config){
			this._init(config);
		},
		
		_init: function(config){
			// summary:
			//		Initialize object information.
			// tags:
			//		private
			// config: object
			//		Application settings
			
			if(this._hasPropertyValue(config, "type")){
				this.type = config.type;
			}
			if(this._hasPropertyValue(config, "application")){
				this.application = config.application;
			}
			
			this._initMappingData(config);
		},
		
		_initMappingData: function(config){
			// summary:
			//		Initialize widget mapping data.
			// description:
			//		Load the mapping data, which maps feed item types to the
			//		widgets used to display them.
			// tags:
			//		private
			// config: object
			//		config.mapping string [optional]
			//			Url to mapping file, if not present load default file.
			//		config.onsuccess function
			//			Callback function to run after mapping is successful.
			//		config.onerror function
			//			Callback function to run if mapping fails.
			
			if(config.hasOwnProperty("mapping")){
				this.mapping = config.mapping;
				
				if(typeof this.mapping == "string"){
					this._loadMappingFileData(this.mapping, config);
				}
			}else{
				this._loadMappingFileData(this.mappingUrl, config);
			}
		},
		
		_loadMappingFileData: function(src, config){
			// summary:
			//		Load widget mapping file(s).
			// tags:
			//		private
			// src: string|array
			//		The url of mapping file to load or an array of urls.  Will
			//		also accept a mapping object or array of urls and
			//		mapping objects.
			// config: object
			//		Config object for the widget controller.
			
			this._loadJsonFiles(
				src,
				lang.hitch(this,function(mapping){
					this.mapping = mapping;
					config.onsuccess();
				}),
				config.onerror
			);
		},
		
		_loadJsonFiles: function(srcAry, onsuccess, onerror){
			// summary:
			//		Load a series of JSON files and mix the results
			//		into an object.
			// tags:
			//		private
			// srcAry: string|array
			//		The url of json file to load or an array of urls.  Will
			//		also accept an object or array of urls and
			//		objects.
			// onsuccess: function
			//		Function to call on a successful loading of a json file.
			// onsuccess: function
			//		Function to call on an error while loading of a json file.
			
			srcAry = this._makeArray(srcAry);
			var objs = new Array();
			
			var successTest = this._loadJsonFilesSucessTestFunc(
				srcAry, objs, onsuccess
			);
			
			array.forEach(this._makeArray(srcAry), function(src, n){
				if(typeof src == "object"){
					objs[n] = src;
					successTest();
				}else{
					request(require.toUrl(src), {"handleAs": "json"}).then(
						function(data){
							objs[n] = data;
							successTest();
						},
						function(error){
							objs[n] = {};
							successTest();
							onerror(error);
						}
					);
				}
			});
		},
		
		_loadJsonFilesSucessTestFunc: function(srcAry, objs, onsuccess){
			// summary:
			//		Create a function that runs a callback after all items of
			//		an array of files have been loaded and mixed together.
			// tags:
			//		private
			// srcAry: array
			//		Array to count values of and set internal counter.
			// objs: array
			//		Array of objects to mix once all are loaded.
			// onsuccess: function
			//		Callback to run once function is done.
			// returns: function
			
			var count = srcAry.length;
			var successTest = function(){
				if(--count == 0){
					var obj = this._mixInOrder(objs);
					onsuccess(obj);
				}
			};
			
			return lang.hitch(this, successTest);
		},
		
		_makeArray: function(ary){
			// summary:
			//		Return an array from supplied parameter.
			// tags:
			//		private
			// ary: mixed
			//		Item to return/convert to array.
			// returns: array
			//		Either the original parameter or the parameter as the first
			//		item of an array with one item in it.
			
			if(Object.prototype.toString.call(ary) !== "[object Array]"){
				ary = [ary];
			}
			
			return ary;
		},
		
		_mixInOrder: function(obj, ary){
			// summary:
			//		Mix all the elements of an array into an object.
			// description:
			//		Take all the elements of an array and mix them into a
			//		supplied object in order.
			// tags:
			//		private
			// obj: object [optional]
			//		Object to mix into.
			// ary: array
			//		Array of objects to mix.
			// returns object
			//		The mixed object.
			
			if(ary === undefined){
				ary = obj;
				obj = {};
			}
			
			array.forEach(ary, function(cObj){
				obj = lang.mixin(obj, cObj);
			});
			
			return obj;
		},
		
		createWidget: function(data){
			// summary:
			//		Create a widget from given data.
			// description:
			//		Create a widget from given data using the internal mappings
			//		of this class (as already defined).
			// tags:
			//		public
			// data: object
			//		Data to supply to widget
			//
			//		data.type string
			//			Data type (used to select widget type to create).
			//		data.onsuccess function
			//			Callback to run once widget is created.
			//		data.onerror function
			//			Callback to run if an error occurs.
			
			if(!data.hasOwnProperty("application")){
				data.application = this.application;
			}
			var widgetName = this._getWidgetName(data);
			
			require(["../models/"+widgetName],function(widgetClass){
				try{
					if(registry.byId(data.config.id)){
						data.onerror("Item appears to be a duplicate of a previous item");
					}else{
						var widget = new widgetClass(data);
						data.onsuccess(widget);
					}
				}catch(e){
					data.onerror(e);
				}
			});
		},
		
		_getWidgetName: function(data){
			// summary:
			//		Given supplied data, return name of widget to use.
			// description:
			//		Given widget initialization data, return the name of the
			//		widget to use (according to internal mappings).
			// tags:
			//		private
			// returns: string
			
			var widgetName = data.type;
			if(this.mapping[this.type].hasOwnProperty(widgetName)){
				widgetName = this.mapping[this.type][widgetName];
			}
			
			return widgetName;
		},
		
		_hasPropertyValue: function(object, propName){
			// summary:
			//		Does an object have a specified property with
			//		real value assigned.
			// tags:
			//		private
			// object: object
			//		Object to test.
			// propName:
			//		Property to test for.
			// returns: boolean
			
			if(object.hasOwnProperty(propName)){
				if(typeof object[propName] == "string"){
					return ((object[propName] != "") && (object[propName] != null));
				}else if(typeof object[propName] == "boolean"){
					return object[propName];
				}else{
					return ((object[propName] != undefined) && (object[propName] != null));
				}
			}
			
			return false;
		}
	});
	
	return construct;
});