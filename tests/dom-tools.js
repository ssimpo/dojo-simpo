define([
	"doh",
	"simpo/dom-tools",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dijit/Dialog",
	"dojo/dom-style"
], function(
	doh, domTools, lang, domConstr, dialog, domStyle
) {
	"use strict";
	
	var fixtures = {
		"blank": function(){},
		"deferred": function(){
			this.deferred = new doh.Deferred();
		}
	};
	
	var tearDowns = {
		"blank":function() {}	
	};
	
	doh.register("simpo/widget/feed/tests/controller/application", [{
		"name": "_createHiddenNode",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
		}
	},{
		"name": "getNodeDimensions",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			this.testOne();
			this.testTwo();
			this.testThree();
		},
		"testOne": function(){
			var div = domConstr.create("div",{
				"style": {
					"position": "absolute",
					"width": "100px",
					"height": "100px"
				}
			}, document.body);
			
			var di = domTools.getNodeBoxDimensions(div);
			console.log(di);
			
			doh.assertTrue(di.hasOwnProperty("margin"));
			doh.assertTrue(di.margin.hasOwnProperty("h"));
			doh.assertTrue(di.margin.hasOwnProperty("w"));
			
			doh.assertEqual(100, di.margin.w);
			doh.assertEqual(100, di.margin.h);
		},
		"testTwo":function(){
			var widget = new dialog({
				"style": {"width":"300px", "height":"300px"}
			});
			widget.show();
			
			var di = domTools.getNodeBoxDimensions(widget);
			doh.assertEqual(300, di.margin.w);
			doh.assertEqual(300, di.margin.h);
		},
		"testThree": function(){
			var div = domConstr.create("div",{
				"style": {
					"position": "absolute",
					"width": "100px",
					"height": "100px",
					"marginTop": "20px",
					"marginRight": "105px",
				}
			}, document.body);
			
			var di = domTools.getNodeBoxDimensions(div);
			doh.assertEqual(205, di.margin.w);
			doh.assertEqual(120, di.margin.h);
		},
	},{
		"name": "getImageDimensions[1]",
		"setUp": fixtures.deferred,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			domTools.getImageDimensions(
				"/scripts/simpo/tests/resources/1.jpg",
				this.deferred.getTestCallback(this.testOne)
			);
			return this.deferred;
		},
		"testOne": function(di){
			doh.assertTrue(di.hasOwnProperty("width"));
			doh.assertTrue(di.hasOwnProperty("height"));
			doh.assertTrue(di.hasOwnProperty("node"));
			doh.assertEqual(397, di.width);
			doh.assertEqual(241, di.height);
			doh.assertEqual("img", di.node.tagName.toLowerCase());
		}
	},{
		"name": "getImageDimensions[2]",
		"setUp": fixtures.deferred,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			domTools.getImageDimensions(
				"/scripts/simpo/tests/resources/2.jpg",
				this.deferred.getTestCallback(this.testTwo)
			);
			return this.deferred;
		},
		"testTwo": function(di) {
			doh.assertEqual(115, di.width);
			doh.assertEqual(160, di.height);
		}
	},{
		"name": "getImageDimensions[3]",
		"setUp": fixtures.deferred,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			domTools.getImageDimensions(
				"/scripts/simpo/tests/resources/3.jpg",
				this.deferred.getTestCallback(this.testThree)
			);
			return this.deferred;
		},
		"testThree": function(di) {
			doh.assertEqual(150, di.width);
			doh.assertEqual(150, di.height);
		}
	},{
		"name": "scaleNode[1]",
		"setUp": fixtures.deferred,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			domTools.getImageDimensions(
				"/scripts/simpo/tests/resources/3.jpg",
				this.deferred.getTestCallback(this.testOne)
			);
			
			return this.deferred;
		},
		"testOne": function(di){
			var newDi = domTools.scaleNode(di.node, 50, 50);
			doh.assertEqual(50, newDi.width);
			doh.assertEqual(50, newDi.height);
			
			newDi = domTools.scaleNode(di.node, 300, 300);
			doh.assertEqual(150, newDi.width);
			doh.assertEqual(150, newDi.height);
			
			newDi = domTools.scaleNode(di.node, 300, 300, true);
			doh.assertEqual(300, newDi.width);
			doh.assertEqual(300, newDi.height);
			
			newDi = domTools.scaleNode(di.node, 300, 1000, false);
			doh.assertEqual(150, newDi.width);
			doh.assertEqual(150, newDi.height);
			
			newDi = domTools.scaleNode(di.node, 300, 1000, true);
			doh.assertEqual(300, newDi.width);
			doh.assertEqual(300, newDi.height);
			
			newDi = domTools.scaleNode(di.node, 1000, 300, true);
			doh.assertEqual(300, newDi.width);
			doh.assertEqual(300, newDi.height);
		}
	},{
		"name": "scaleNode[2]",
		"setUp": fixtures.deferred,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			domTools.getImageDimensions(
				"/scripts/simpo/tests/resources/1.jpg",
				this.deferred.getTestCallback(this.testTwo)
			);
			
			return this.deferred;
		},
		"testTwo": function(di){
			var newDi = domTools.scaleNode(di.node, 50, 50);
			doh.assertEqual(50, parseInt(newDi.width, 10));
			doh.assertEqual(30, parseInt(newDi.height, 10));
			
			var newDi = domTools.scaleNode(di.node, 500, 500);
			doh.assertEqual(397, parseInt(newDi.width, 10));
			doh.assertEqual(241, parseInt(newDi.height, 10));
			
			var newDi = domTools.scaleNode(di.node, 500, 500, true);
			doh.assertEqual(500, parseInt(newDi.width, 10));
			doh.assertEqual(303, parseInt(newDi.height, 10));
		}
	},{
		"name": "scaleNode[3]",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
			var div = domConstr.create("div",{
				"style": {
					"position": "absolute",
					"width": "100px",
					"height": "100px"
				}
			}, document.body);
			this.testThree(div);
			this.testFour(div);
			
			var widget = new dialog({
				"style": {"width":"300px", "height":"300px"}
			});
			widget.show();
			this.testFive(widget);
		},
		"testThree": function(node){
			var newDi = domTools.scaleNode(node, 50, 50);
			doh.assertEqual(50, newDi.width);
			doh.assertEqual(50, newDi.height);
		},
		"testFour": function(node){
			var newDi = domTools.scaleNode(node, {"width": 50, "height": 50});
			doh.assertEqual(50, newDi.width);
			doh.assertEqual(50, newDi.height);
			
			var newDi = domTools.scaleNode(node, {"width": 300, "height": 300});
			doh.assertEqual(100, newDi.width);
			doh.assertEqual(100, newDi.height);
			
			var newDi = domTools.scaleNode(node, {"width": 300, "height": 300}, true);
			doh.assertEqual(300, newDi.width);
			doh.assertEqual(300, newDi.height);
		},
		"testFive": function(widget){
			var newDi = domTools.scaleNode(widget, 50, 50);
			doh.assertEqual(50, newDi.width);
			doh.assertEqual(50, newDi.height);
		}
	},{
		"name": "insertNodeAtProportion",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
		}
	},{
		"name": "resizeText",
		"setUp": fixtures.blank,
		"tearDown": tearDowns.blank,
		"runTest": function(){
		}
	}]);
});