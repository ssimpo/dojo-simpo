// summary:
//		Feed loader.
// description:
//		Class is simply a mechanism for loading the correct feed controller.
//		Callback from the application controller is passed to the feed
//		controller, hence this is just a routing class.
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"require"
], function(
	declare, require
){
	"use strict";
	
	var construct = declare(null, {
		constructor: function(config){
			this._init(config);
		},
		
		_init: function(config){
			// summary:
			//		Initialize widget for handling a specific feed type.
			// config: object
			//		config.application object
			//			Reference to the main application object.
			//		config.type string
			//			The feed controller type to load.
			//		config.config object
			//			The configuration options to pass to the feed controller.
			//		config.src string
			//			The url to load the feed from.
			//		config.onsuccess function [optional]
			//			Callback to use when the controller is
			//			loaded successfully.
			//		config.onerror function [optional]
			//			Callback to use when an error occurs in loading the
			//			feed controller.
			//		config.onmeta function [optional]
			//			Callback to use when any meta data is loaded. (Note may
			//			be called multiple times).
			// todo:
			//		Are the optional arguments optional, what happens if
			//		not included?
			// tags:
			//		private.
			
			require(["./feed/"+config.type], function(controller){
				new controller(config);
			});
		}
	});
	
	return construct;
});