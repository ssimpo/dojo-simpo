define([
    "dojo/_base/declare",
	"simpop/expandingDiv",
	"dojo/_base/xhr",
	"./metroTab",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style"
], function(
    declare, eDiv, xhr, metroTab, domGeom, domClass, domStyle
){
    var construct = declare([eDiv],{
		source:'http://localhost/TCC/wp-content/themes/thechristiancentre2/scripts/simpop/metro/source.json',
		showRows:2,
		
		_tabs:[],
		
		postCreate: function() {
			this.inherited(arguments);
			this._marginBox = domGeom.getMarginBox(this.domNode);
			this._loadConfig();
			console.log(1);
		},
		
		_loadConfig: function() {
            var constr = {
                'content':{},
                'url':this.source,
                'handleAs':'json',
                'preventCache':true,
                'sync':false,
                'load': dojo.hitch(this, this._configLoaded),
                'error': dojo.hitch(this, this._configError)
            };
            
            xhr.get(constr);
        },
		
		_configLoaded: function(data) {
			var lastTab = {};
			dojo.forEach(data,function(item) {
				var tab = new metroTab({
					'imageName':item.icon,
					'colour':item.colour,
					'label':item.label
				});
				
				dojo.place(tab.domNode,this.domNode,"last");
				var marginBox = domGeom.getMarginBox(tab.domNode);
				
				var bottom = marginBox.t + marginBox.h;
				var containerBottom = this._marginBox.t + this._marginBox.h;
				
				if (bottom > containerBottom) {
					domClass.toggle(tab.domNode,'dojoSimpoMetroTabHidden');
				}
				
				this._tabs.push(tab);
				lastTab = tab;
			},this);
			
			var marginBox = domGeom.getMarginBox(lastTab.domNode);
			domStyle.set(this.domNode,"maxHeight",(marginBox.t+marginBox.h+10)+'px');
			this.maxHeight = marginBox.t+marginBox.h+10;
		},
		
		_expandDiv: function() {
			this.inherited(arguments);
			
			dojo.forEach(this._tabs,function(tab) {
				var marginBox = domGeom.getMarginBox(tab.domNode);
				var bottom = marginBox.t + marginBox.h;
				var containerBottom = this._marginBox.t + this._marginBox.h;
				if (bottom > containerBottom) {
					domClass.toggle(tab.domNode,'dojoSimpoMetroTabHidden');
				}
			},this);
		},
		
		_contractDiv: function() {
			this.inherited(arguments);
			dojo.forEach(this._tabs,function(tab) {
				var marginBox = domGeom.getMarginBox(tab.domNode);
				var bottom = marginBox.t + marginBox.h;
				var containerBottom = this._marginBox.t + this._marginBox.h;
				if (bottom > containerBottom) {
					domClass.toggle(tab.domNode,'dojoSimpoMetroTabHidden');
				}
			},this);
		},
		
		_configError: function(e) {
			console.error(e);
		}
	});
    
    return construct;
});