define([
    "dojo/_base/declare",
    "./div",
    "dojo/_base/fx",
    "dojo/dom-style",
    "dojo/on",
    "dojo/_base/lang",
    "simpo/typeTest",
    "dojo/window"
], function(
    declare, simpoDiv, fx, domStyle, on, lang, typeTest, win
){
    "use strict";
    
    var construct = declare([simpoDiv], {
        "maxHeight":0,
        "minHeight":0,
        "minWidth":0,
        "maxWidth":0,
        "expanded": false,
        "scroll": false,
        "useAvail": false,
        "availMargin": 0,
        
        "_animationLength": 500,
        "_allowExpandContractFlag": true,
        "_currentAnimation": null,
        
        postCreate: function(){
            this._init();
            this._initExpandingDiv();
        },
        
        _initExpandingDiv: function(){
            this._setMinMax();
            this._setHeightWidth();
            this._addMouseEvents();
        },
        
        _setMinMax: function(){
            this._setMinMaxHeight();
            this._setMinMaxWidth();
        },
        
        _setMinMaxHeight: function(){
            this.minHeight = domStyle.get(this.domNode, 'minHeight');
            this.maxHeight = domStyle.get(this.domNode, 'maxHeight');
            if((this.minHeight == 0) && (this.maxHeight == 0)){
                this.minHeight = domStyle.get(this.domNode, 'height');
                this.maxHeight = this.minHeight;
            }else{
                this.set("maxHeight", this.maxHeight);
            }
        },
        
        _setMaxHeightAttr: function(value){
            this.maxHeight = value;
            if(this.useAvail){
                var box = win.getBox();
                var constraint = (box.h - this.availMargin);
                if((constraint < value) && (constraint > this.minHeight)){
                    this.maxHeight = constraint;
                }
            }
        },
        
        _getMaxHeightAttr: function(){
            var value = this.maxHeight;
            if(this.useAvail){
                var box = win.getBox();
                var constraint = (box.h - this.availMargin);
                if((constraint < value) && (constraint > this.minHeight)){
                    value = constraint;
                }
            }
            
            return value;
        },
        
        _setMinMaxWidth: function(){
            this.minWidth = domStyle.get(this.domNode, 'minWidth');
            this.maxWidth = domStyle.get(this.domNode, 'maxWidth');
            if((this.minWidth == 0) && (this.maxWidth == 0)){
                this.minWidth = domStyle.get(this.domNode, 'width');
                this.maxWidth = this.minWidth;
            }else{
                this.set("maxWidth", this.maxWidth);
            }
        },
        
        _setMaxWidthAttr: function(value){
            this.maxWidth = value;
            if(this.useAvail){
                var box = win.getBox();
                var constraint = (box.w - this.availMargin);
                if((constraint < value) && (constraint > this.minWidth)){
                    this.maxWidth = constraint;
                }
            }
        },
        
        _getMaxWidthAttr: function(){
            var value = this.maxWidth;
            if(this.useAvail){
                var box = win.getBox();
                var constraint = (box.w - this.availMargin);
                if((constraint < value) && (constraint > this.minWidth)){
                    value = constraint;
                }
            }
            
            return value;
        },
        
        _setHeightWidth: function(){
            if(this.minHeight > 0){
                domStyle.set(this.domNode, "height", this.minHeight+'px');
            }
            if(this.minWidth > 0){
                domStyle.set(this.domNode, "width", this.minWidth+'px');
            }
        },
        
        _addMouseEvents: function(){
            on(this.domNode, "mouseover", lang.hitch(this, this._expandDiv));
            on(this.domNode, "mouseout", lang.hitch(this, this._contractDiv));
        },
        
        _createAnimationProperties: function(options){
            var aniProps = new Object;
            
            if(options.startHeight != options.endHeight){
                aniProps.height = {
                    "start":options.startHeight, "end":options.endHeight
                };
            }
            if(options.startWidth != options.endWidth){
                aniProps.width = {
                    "start":options.startWidth, "end":options.endWidth
                };
            }
            
            return ((aniProps !== {}) ? aniProps : null);
        },
        
        _expandDiv: function(evt){
            if(!this.expanded){
                
            var aniProps = this._createAnimationProperties({
                "startHeight": domStyle.get(this.domNode,'height'),
                "endHeight": this.get("maxHeight"),
                "startWidth": domStyle.get(this.domNode,'width'),
                "endWidth": this.get("maxWidth")
            });
            
            if(aniProps !== null){
                this._emitEvent("beforeexpanded");
                this.expanded = true;
                this._animate(aniProps, lang.hitch(this, function(){
                    if(this.scroll){
                        var extraScroll = 25;
                        if(this.useAvail){
                            if(this.availMargin > 0){
                                extraScroll = parseInt((this.availMargin/2), 10);
                            }
                        }
                        window.scrollBy(0, extraScroll);
                    }
                    this._emitEvent("expanded");
                    this.onexpand(this.domNode);
                }));
            }
            }
        },
        
        _emitEvent: function(type){
            on.emit(this.domNode, type, {
                "bubbles": true,
                "cancelable": false,
                "target": this.domNode
            });
        },
        
        _contractDiv: function(evt){
            if(this.expanded){
                
            var node = evt.toElement || evt.relatedTarget;
            
            if(!this._isInsideNode(node, this.domNode)){
                var aniProps = this._createAnimationProperties({
                    "startHeight": domStyle.get(this.domNode,'height'),
                    "endHeight": this.get("minHeight"),
                    "startWidth": domStyle.get(this.domNode,'width'),
                    "endWidth": this.get("minWidth")
                });
                if(aniProps !== null){
                    this._emitEvent("beforecontracted");
                    this.expanded = false;
                    this._animate(aniProps, lang.hitch(this, function(){
                        this._emitEvent("contracted");
                        this.oncontract(this.domNode);
                    }));
                }
            }
            }
        },
        
        _isInsideNode: function(node, targetNode){
            var cNode = node;
            while((cNode != document.body) && (cNode != undefined) && (cNode != document)){
                if(cNode == targetNode){
                    return true;
                }
                cNode = cNode.parentNode;
            }
            
            return false;
        },
        
        _animate: function(aniProps, callback){
            if(this._currentAnimation !== null){
                this._currentAnimation.stop();
            }
            
            this._currentAnimation = fx.animateProperty({
                "node": this.domNode,
                "properties": aniProps,
                "duration": this._animationLength,
                "onEnd": lang.hitch(this, function(){
                    this._currentAnimation = null;
                    callback();
                }),
                "onAnimate": lang.hitch(this, function(evt){
                    if(this.scroll){
                        win.scrollIntoView(this.domNode);
                    }
                    this._emitEvent("resizing");
                }) 
            });
            this._currentAnimation.play();
        },
        
        _pxToNumber: function(val){
            try{
                val = parseInt(val.replace("px",""));
            }catch(e){
                val = NaN;
            }
            return val;
        },
        
        onexpand: function(dom) {
            
        },
        
        oncontract: function(dom) {
            
        },
        
        _allowExpandContract: function() {
            this._allowExpandContractFlag = true;
        }
    });
    
    return construct;
});