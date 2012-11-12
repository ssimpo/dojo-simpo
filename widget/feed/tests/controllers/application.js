define([
	"doh",
	"simpo/widget/feed/controllers/application",
	"dojo/store/Memory"
], function(
	doh, application, memory
) {
	"use strict";
	
	var fixtures = {
		"blank": function() {},
		"blankApp": function() {
			this.application = application({});
		},
		"blankAppWithDb": function() {
			this.application = application({});
			this.application._initDatabase();
		}
	};
	
	var tearDowns = {
		"blank":function() {}	
	};
	
	var config = {
		"main":{
			"type":"magazine",
			"cols":2,
			"rows":2,
			"feeds":[{
				"type":"rss",
				"src":"http://peoplesinfonet.org.uk/scripts/feed.xml",
				"settings":{
				}
			}]
		}
	};
	
	doh.register("simpo/widget/feed/tests/controller/application", [
	{
		"name": "_init",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			var app = application({
				"domNode":{}
			});
		}
	},
	{
		"name": "_initDatabase",
		"setUp": fixtures.blankApp,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			this.setOne();
			this.setTwo();
		},
		"setOne": function(){
			this.application._initDatabase();
			var appStore = this.application._appStore;
			var metaSore = this.application._metaStore;
			
			doh.assertTrue(appStore.isInstanceOf(memory));
			doh.assertTrue(metaSore.isInstanceOf(memory));
			doh.assertEqual("id", appStore.idProperty);
			doh.assertEqual("id", metaSore.idProperty);
		},
		"setTwo": function(){
			this.application._initDatabase({
				"appStore": new memory({"idProperty": "test"})
			});
			var appStore = this.application._appStore;
			
			doh.assertEqual("test", appStore.idProperty);
		}
	},
	{
		"name": "_objectIsEmpty",
		"setUp": fixtures.blankApp,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			var blankObj = {};
			var oneProperty = {"test":"test"};
			var oneMethod = {"test":function(){}};
			
			doh.assertTrue(this.application._objectIsEmpty(blankObj));
			doh.assertFalse(this.application._objectIsEmpty(oneProperty));
			doh.assertFalse(this.application._objectIsEmpty(oneMethod));
		}
	},
	{
		"name": "_isEqual",
		"setUp": fixtures.blankApp,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			this.setOne();
			this.setTwo();
		},
		"setOne": function(){
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1"},
				{"test1":"test1"}
			));
			doh.assertFalse(this.application._isEqual(
				{"test1":"test1"},
				{"test1":"test2"}
			));
			doh.assertFalse(this.application._isEqual(
				{"test1":"test1"},
				{"test1":"test1","test2":"test2"}
			));
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1","test2":function(){ return "TEST"; }},
				{"test1":"test1","test2":function(){ return "TEST"; }}
			));
			doh.assertFalse(this.application._isEqual(
				{"test1":"test1","test2":function(){ return "TEST"; }},
				{"test1":"test1"}
			));
			doh.assertFalse(this.application._isEqual(
				{"test1":"test1","test2":function(){ return "TEST"; }},
				{"test1":"test1","test2":"test2"}
			));
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1","test2":function(){ return "TEST"; }},
				{"test1":"test1","test2":function(){ return "TEST2"; }}
			));
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1","test2":{"test2":"test2"}},
				{"test1":"test1","test2":{"test2":"test2"}}
			));
			doh.assertFalse(this.application._isEqual(
				{"test1":"test1","test2":{"test2":"test2"}},
				{"test1":"test1","test2":{"test2":"test3"}}
			));
		},
		"setTwo": function(){
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1"},
				{"test1":"test1"},
				{}
			));
			doh.assertTrue(this.application._isEqual(
				{"test1":"test1"},
				{"test1":"test1","test2":"test2"},
				{"test2":true}
			));
		}
	},
	{
		"name": "updateItem",
		"setUp": fixtures.blankAppWithDb,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			this.appStore = this.application._appStore;
			this.metaStore = this.application._metaStore;
			
			this.setOne();
			this.setTwo();
		},
		"setOne": function(){
			var test1Obj = {"id": 1, "test1": "test1", "test2": "test2"};
			this.application.updateItem(test1Obj);
			var test2Obj = this.appStore.get(test1Obj.id);
			doh.assertEqual(test1Obj, test2Obj);
			
			var test1Obj = {"id": 2, "test1": "test2", "test2": "test1"};
			this.application.updateItem(test1Obj);
			var test3Obj = this.appStore.get(test1Obj.id);
			doh.assertNotEqual(test3Obj, test2Obj);
		},
		"setTwo": function(){
			var test1Obj = {"id": 1, "meta1": "test1", "meta2": "test2"};
			this.application.updateItem(test1Obj, true);
			var test2Obj = this.metaStore.get(test1Obj.id);
			doh.assertEqual(test1Obj, test2Obj);
			
			var test3Obj = this.appStore.get(test1Obj.id);
			doh.assertNotEqual(test3Obj, test2Obj);
		}
	},
	{
		"name": "getItem",
		"setUp": fixtures.blankAppWithDb,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			this.setOne();
			this.setTwo();
		},
		"setOne": function(){
			var test1Obj = {"id": 1, "type": "test1", "test": "test2"};
			this.application.updateItem(test1Obj);
			
			var test2Obj = this.application.getItem("test2","test");
			doh.assertEqual(test1Obj, test2Obj);
		},
		"setTwo": function(){
			var test1Obj = {"id": 1, "type": "test1", "test": "test2"};
			this.application.updateItem(test1Obj, true);
			var test2Obj = this.application.getItem("test2", "test", true);
			doh.assertEqual(test1Obj, test2Obj);
			
			var test3Obj = this.application.getItem("test2", "test", false);
			doh.assertNotEqual(test3Obj, test2Obj);
		}
	}
	]);
});