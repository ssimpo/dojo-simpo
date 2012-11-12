define([
    "dojo/_base/declare",
    "simpo/div",
    "dojo/_base/connect",
    "dojo/_base/fx",
    "dojo/dom-style"
], function(
    declare, simpoDiv, connect, fx, domStyle
){
    var construct = declare("simpo.expandingDiv",[simpoDiv],{
        _animationLength: 500,
        _allowExpandContractFlag:true,
        maxHeight:0,
        minHeight:0,
        
        postCreate: function() {
            this.inherited(arguments);
            
            this.minHeight = domStyle.get(this.domNode,'minHeight');
            this.maxHeight = domStyle.get(this.domNode,'maxHeight');
            
            domStyle.set(this.domNode,"height",this.minHeight+'px');
            connect.connect(this.domNode,"onmouseover",this,this._expandDiv);
            connect.connect(this.domNode,"onmouseout",this,this._contractDiv);
        },
        
        _expandDiv: function() {
            var height = domStyle.get(this.domNode,'height');
            var ani = fx.animateProperty({
                node:this.domNode,
                properties: {
                    height: { start:height, end:this.maxHeight }
                },
                duration:this._animationLength
            });
            ani.play();
            
            this.onexpand(this.domNode);
        },
        
        _contractDiv: function() {
            var height = domStyle.get(this.domNode,'height');
            var ani = fx.animateProperty({
                node:this.domNode,
                properties: {
                    height: { start:height, end:this.minHeight }
                },
                duration:this._animationLength
            });
            ani.play();
            
            this.oncontract(this.domNode);
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