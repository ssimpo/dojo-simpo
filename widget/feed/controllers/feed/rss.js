// summary:
//		
// description:
//		
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dojo/request",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/date/locale",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/dom-attr",
	"dojox/encoding/digests/MD5"
], function(
	declare, request, lang, array, locale, $, nodeList, domAttr, MD5
){
	"use strict";
	
	var construct = declare(null, {
		"config": {},
		"_namespaces": [],
		
		constructor: function(config){
			this._init(config);
		},
		
		_init: function(config){
			// summary:
			//		Initialize object information.
			// config: object|string
			//		The settings to use for this feed parser.
			// tags:
			//		private
			
			this.config = config;
			
			request(this.config.src, {
				"handleAs": "xml",
				"query": this.config.config
			}).then(
				lang.hitch(this, this._dataLoaded),
				this.config.onerror
			);
		},
		
		_dataLoaded: function(document){
			// summary:
			//		Parse a loaded RSS feed.
			// tags:
			//		private
			
			this._storeNamespaces(document);
            
			var parsedData = new Array();
			$("item",document).forEach(function(item){
				var parsedItemObj = this._parseItemObj(item);
				parsedData.push(parsedItemObj);
			}, this);
			
			this.config.onsuccess(parsedData);
		},
		
		_storeNamespaces: function(document){
			// summary:
			//		Scan supplied XML document and store any namespaces.
			// description:
			//		Scan supplied XML document and store any namespaces, so
			//		they can be referenced by url at a later stage.
			// tags:
			//		private
			// document: object XMLDom
			//		The XML document to parse.
			
			var rss = $("rss",document);
			if(rss.length > 0){
				rss = rss[0];
				
				array.forEach(rss.attributes, function(attribute){
					var attName = attribute.name.toLowerCase().split(':');
					var attValue = attribute.value.toLowerCase();
					
					if(attName.length > 1){
						if(attName[0] == "xmlns"){
							this._namespaces.push({
								"namespace":attName[1],
								"src":attValue
							})
						}
					}
				}, this);
			}
		},
		
		_getNamespace: function(url){
			// summary:
			//		Get the namespace identifier for given namespace url.
			// tags:
			//		private
			// url: string
			//		The url of the namespace
			// returns: string|boolean=false
			//		The namespace identifier or false when not available.
		
			var namespace = false;
			array.every(this._namespaces, function(ns){
				if(ns.src == url.toLowerCase()){
					namespace = ns.namespace;
					return false;
				}
				return true;
			}, this);
			return namespace;
		},
		
		_parseItemObj: function(item){
			// summary:
			//		Parse an RSS item returning an object.
			// tags:
			//		private
			// returns: object
			
			var parsedItemObj = {
				"id": this._getId(item),
				"type": "rssitem",
				"title": this._getChildNodeContent(item,"title"),
				"description": this._getChildNodeContent(item,"description"),
				"author": this._getAuthor(item),
				"category": this._getCategory(item),
				"enclosure":this._getEnclosure(item),
				"comments": this._getChildNodeContent(item,"comments"),
				"source": this._getSource(item),
				"link": this._getChildNodeContent(item,"link"),
				"guid": this._getChildNodeContent(item,"guid"),
				"thumbnails":this._getThumbnails(item),
				"date":locale.parse(
					this._getChildNodeContent(item,"pubDate"),{
						"datePattern": "EEE, dd MMM yyyy HH:mm:ss ZZZZ",
						"selector": "date"
					}
				)
			};
			
			return parsedItemObj;
		},
		
		_getThumbnails: function(item){
			// summary:
			//		Get an array of thumbnail objects from given rss item node.
			// tags:
			//		private
			// item: object XMLNode
			//		The RSS item node.
			// returns: array
			//		An array of objects
			
			var namespace = this._getNamespace("http://search.yahoo.com/mrss/");
			
			if(namespace){
				var thumbNodes = new Array();
				var nodes = this._getChildNodes(item);
				array.forEach(nodes,function(node){
					if(node.tagName.toLowerCase() == (namespace + ":thumbnails")){
						var thumbs = this._getChildNodes(node);
						array.forEach(thumbs, function(thumb){
							if(thumb.tagName.toLowerCase() == namespace+":thumbnail"){
								thumbNodes.push(thumb);
							}
						}, this);
					}
				},this);
				
				var parsedObjs = new Array();
				array.forEach(thumbNodes, function(node){
					var obj = {};
					array.forEach(node.attributes, function(attribute){
						obj[attribute.name] = attribute.value;
					}, this);
					parsedObjs.push(obj);
				}, this);
				
				return parsedObjs;
			}
			
			return new Array();
		},
		
		_getChildNodes: function(node){
			// summary:
			//		Get direct children of a specified node.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to get children of.
			// returns array nodeList
			
			var childNodes = new nodeList();
			var children = node.children;
			if(children == undefined){ children = node.childNodes; }
		
			if(children != undefined){
				array.forEach(children,function(cnode,n){
					if((cnode.nodeType == 1) || (cnode.nodeType == 6)){
						childNodes.push(cnode);
					}
				},this);
			}
	
			return childNodes;
		},
		
		_getEnclosure: function(item){
			// summary:
			//		Get the enclosure value for an rss <item>
			// tags:
			//		private
			// item: object XMLNode
			//		The item element to grab the source from.
			// returns object
			//		object.url string
			//			The url path of the source.
			//		object.value string
			//			The source content/value.
			
			var enclosures = new Array();
			
			$("enclosure",item).forEach(function(node){
				enclosures.push({
					"url": this._getNodeAttribute(node,"url"),
					"type": this._getNodeAttribute(node,"type"),
					"length": this._getNodeAttribute(node,"length")
				});
			}, this);
			
			return enclosures;
		},
		
		_getCategory: function(item){
			// summary:
			//		Get the categories for an rss <item>
			// tags:
			//		private
			// item: object XMLNode
			//		The item element to grab the categories from.
			// returns array
			//		Array of category objects in the form
			//
			//		object.domain string [optional]
			//			The url path of the category scheme (if any).
			//		object.value string
			//			The category value.
			
			var categories = new Array();
			
			$("category",item).forEach(function(node){
				categories.push({
					"domain": this._getNodeAttribute(node,"domain"),
					"value": this._getNodeContent(node)
				});
			}, this);
			
			return categories;
		},
		
		_getSource: function(item){
			// summary:
			//		Get the source value for an rss <item>
			// tags:
			//		private
			// item: object XMLNode
			//		The item element to grab the source from.
			// returns object
			//		object.url string
			//			The url path of the source.
			//		object.value string
			//			The source content/value.
			
			var source = $("source",item);
			
			if(source.length > 0){
				return {
					"url": this._getNodeAttribute(source,"url"),
					"value": this._getNodeContent(source)
				};
			}
			
			return {};
		},
		
		_getAuthor: function(item){
			// summary:
			//		Get the author value for an rss <item>
			// tags:
			//		private
			// item: object XMLNode
			//		The item element to grab the author from.
			// returns string
			
			var author = this._getChildNodeContent(item,"author");
			return author;
		},
		
		_getId: function(item){
			// summary:
			//		Generate an ID from a given item object.
			// tags:
			//		private
			// item: object XMLNode
			//		The item object (corresponding to <item></item>).
			// returns: string
			//		32byte MD5 hash of the GUID + rss_ as a prefix.
			
			var id = "rss_"+MD5(this._getChildNodeContent(item,"guid"),1);
			return id.toLowerCase();
		},
		
		_getNodeAttribute: function(node, attrName){
			// summary:
			//		Get the text content of a node attribute.
			// description:
			//		Get the text content of a node attribute.  If node is
			//		not found or not a string then return a blank string.
			// tags:
			//		private
			// node: object XMLNode
			//		Node to grab attribute from.
			// attrName: string
			//		Name of attribute to retrieve.
			// returns: string
			
			try{
				var value = domAttr.get(node,attrName);
				if((value == null) || (value == false) || (value == "") || (value == undefined)){
					value = "";
				}
				return value;
			}catch(error){
				return "";
			}
			
		},
		
		_getChildNodeContent: function(parent, childNodeName){
			// summary:
			//		Get the text content of the first child node with the
			//		give tag name.
			// tags
			//		private
			// parent: object XMLNode
			//		The node parent to grab from.
			// childNodeName: string
			//		Name of child node to grab text of.
			// retuns: string
			
			var childNodes = $(childNodeName, parent);
			
			if(childNodes.length > 0){
				return this._getNodeContent(childNodes[0]);
			}
			
			return "";
		},
		
		_getNodeContent: function(node){
			// summary:
			//		Get the text content of a node.
			// description:
			//		Will use various methods to get the text content of a node
			//		ensuring it is cross-browser compatible and safe.
			// tags:
			//		private
			// node: object XMLNode
			//		The node to grab the text from.
			// returns string
			
			if(node.textContent){
				return node.textContent;
			}else if(node.text){
				return node.text;
			}else if(node.innerText){
				return node.innerText;
			}else{
				return '';
			}
		}
	});
	
	return construct;
});