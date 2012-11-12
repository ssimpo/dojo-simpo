// summary:
//      
// description:
//
// author:
//      Stephen Simpson <me@simpo.org>, <http://simpo.org>

define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/query",
    "dojo/NodeList-dom",
], function(
    declare, domConstruct, domStyle, $, domNodeList
){
    var construct = declare("simpo.widget._loadingDiv",null,{
        _showMessage: function(messageHTML) {
            // summary:
            //      Create and show a graphic telling why the video
            //      cannot be displayed.
            // description:
            //      Tell people to download flash or use a HTML5 compatible
            //      browser.  Graphic is displayed in place of the loading
            //      graphic and the video player.
            
            this._destroyContent(this.domNode);
            
            var div = domConstruct.create("div",{
                'innerHTML':messageHTML,
                'style':{'margin':'7px'}
            },this.domNode);
            
            domStyle.set(this.domNode,{'backgroundColor':'#000000'});
            $('*',this.domNode).style({'color':'#ffffff'});
        },
        
        _destroyContent: function(node) {
            var nodes = $('*',node);
            array.forEach(nodes,function(cnode){
                domConstruct.destroy(cnode);
            },this);
        }
    });
    
    return construct;
});