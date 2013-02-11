// summary:
//
// description:
//
// author:
//		Stephen Simpson <me@simpo.org>, <http://simpo.org>
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/i18n",
	"dojo/i18n!./nls/flashing",
	"dojo/_base/fx",
	"dojo/fx",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/_base/connect"
], function(
	declare, _widget, i18n, strings, fx, coreFx, lang, on, connect
) {
	"use strict";
	
	var construct = declare([_widget], {
		"i18n": strings,
		"_animation": null,
		"duration": 100,
		"_duration": 0,
		"cycles": 3,
		"_cycles": 0,
		
		postCreate: function(args){
			this.flash();
		},
		
		_setDurationAttr: function(value){
			this.duration = value;
			this._createAnimation();
		},
		
		_setCyclesAttr: function(value){
			this.cycles = value;
			this._createAnimation();
		},
		
		_createAnimation: function(){
			if((this.cycles != this._cycles) || (this.duration != this._duration)){
				this._duration = this.duration
				this._cycles = this.cycles
				
				this._animation = coreFx.combine(
					this._createAnimationChain({
						"node": this.domNode,
						"duration": this.duration,
						"onEnd": function(){
							console.log("END-PART-Combine");
						}
					})
				);
				
				this._animation2 = coreFx.chain(
					this._createAnimationChain({
						"node": this.domNode,
						"duration": this.duration,
						"onEnd": function(){
							console.log("END-PART-Chain");
						}
					})
				);
				
				console.log(this._animation, this._animation2);
				
				on(this._animation, "End", function(){
					console.log("ONEND-Combine");
				});
				this._animation.play();
				
				on(this._animation2, "End", function(){
					console.log("ONEND-Chain");
				});
				this._animation2.play();
				
				//this._animation.onEnd = function(){
					//console.log("END");
				//}
			}
		},
		
		_createAnimationChain: function(construct){
			var chain = new Array();
			for(var i = 1; i <= this.cycles; i++){
				chain = chain.concat(
					this._createAnimationPart(construct)
				);
			}
			
			return chain;
		},
		
		_createAnimationPart: function(construct){
			return [
				fx.fadeOut(construct),
				fx.fadeIn(construct)
			];
		},
		
		flash: function(){
			// summary:
			//		
			// description
			//
			
			if(this._animation !== null){
				//this._animation.play();
			}
		}
	});
	
	return construct;
});