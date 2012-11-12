// summary:
//      
// description:
//
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>

define([
    "dojo/_base/declare",
    "require",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/query",
    "dojo/NodeList-dom",
    "dojo/_base/array",
    "dojo/_base/window"
], function(
    declare, require, domConstruct, domStyle, $, domNodeList, array, win
){
	var construct = declare("simpo.widget._loadingDiv",null,{
        '_standby':{},
        '_standbyOn':false,
        '_hiddenDiv':{},
        
        _toggleLoading: function() {
            // summary:
            //      Toggle display of the loading graphic v video player.
            
            if (this._standbyOn) {
                this._standbyOn = false;
                this._destroyContent(this.domNode);
                this._moveContent(this._hiddenDiv);
            } else {
                this._standbyOn = true;
                this._destroyContent(this.domNode);
                this._hiddenDiv = this._createHiddenDiv(win.body());
                this._standby = this._createLoadingDiv(this.domNode);   
            }
        },
        
        _moveContent: function(fromNode) {
            var nodes = $('*',fromNode);
            array.forEach(nodes,function(cnode){
                domConstruct.place(cnode,this.domNode);
            },this);
        },
        
        _destroyContent: function(node) {
            var nodes = $('*',node);
            array.forEach(nodes,function(cnode){
                domConstruct.destroy(cnode);
            },this);
        },
        
        _createHiddenDiv: function(refnode) {
            return domConstruct.create(
                "div",{'style':{
                    'visibility':'hidden',
                    'width':'1px','height':'1px',
                    'overflow':'hidden'
                }},refnode
            );
        },
        
        _createLoadingDiv: function(refNode) {
            // summary:
            //      Creating a loading XMLnode
            // description:
            //      Create a loading graphic to display in place of the
            //      video player while the API is downloaded and the player
            //      is created.  The graphic is contained within a block
            //      element that can be inserted into the video area.
            // refNode: object XMLNode
            //      The XMLNode for the containing element (ie. that will
            //      contain the video player).
            // returns: object XMLNode
            //      The loading graphic.
            
            var rWidth = (domStyle.get(refNode,'width')-20);
            var rHeight = (domStyle.get(refNode,'height')-20);
            
            var node = domConstruct.create('div',{
                'style':{
                    'width':rWidth+'px',
                    'height':rHeight+'px',
                    'backgroundColor':'#aaaaaa',
                    'opacity':0.75,
                    'margin':'10px'
                }
            },refNode);
            this._creatingLoadingImage(node);
            return node;
        },
        
        _creatingLoadingImage: function(refNode) {
            // summary:
            //      Creating a loading graphic for the video area.
            // description:
            //      Create a loading graphic to display in place of the
            //      video player while the API is downloaded and the player
            //      is created.
            // refNode: object XMLNode
            //      The XMLNode for the containing element (ie. that will
            //      contain the video player).
            // returns: object XMLNode
            //      The loading graphic.
            
            var node = domConstruct.create('img',{
                'src':require.toUrl("dojox/widget/Standby/images/loading.gif"),
                'width':32,'height':32,'alt':'loading'
            },refNode);
            this._setLoadingImageMargins(node,refNode);
            return node;
        },
        
        _setLoadingImageMargins: function(node,refNode) {
            // summary:
            //      Set the css margins to assign the loading image.
            // node: object XMLNode
            //      The XMLnode for the <img> tag
            // refNode: object XMLNode
            //      The XMLNode for the containing element (ie. that
            //      contains the <img> tag).
            
            var dimensions = this._calcLoadingMargins(node,refNode);
            domStyle.set(node,{
                'marginRight':dimensions.h+'px',
                'marginLeft':dimensions.h+'px',
                'marginTop':dimensions.v+'px',
                'marginBottom':dimensions.v+'px'
            });
        },
        
        _calcLoadingMargins: function(node,refNode) {
            // summary:
            //      Calculate the css margins to assign the loading image.
            // node: object XMLNode
            //      The XMLnode for the <img> tag
            // refNode: object XMLNode
            //      The XMLNode for the containing element (ie. that
            //      contains the <img> tag).
            // returns: object
            //      Returns an object in the form {v:<integer>,h:<integer},
            //      where v is the vertical margin and h the horizontal.
            
            var width = domStyle.get(node,'width');
            var height = domStyle.get(node,'height');
            var rWidth = domStyle.get(refNode,'width');
            var rHeight = domStyle.get(refNode,'height');
            
            return {
                'h':parseInt(((rWidth-width)/2),10),
                'v':parseInt(((rHeight-height)/2),10)
            }
        }
    });
    
    return construct;
});