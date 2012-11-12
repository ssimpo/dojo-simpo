// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dojox/layout/ContentPane",
	"dojo/_base/lang",
	"require",
	"dojo/query",
	"dojo/dom-attr",
	"dojo/_base/array",
	"dojo/dom-construct"
], function(declare,ContentPane,lang,require,query,domAtt,array,domConstruct) {
    
    var construct = declare("simpo.layout.ContentPane",[ContentPane],{
		_hiddenDiv:{},
		
		_load: function(){
			// summary:
			//		Load/reload the href specified in this.href

			// display loading message
			this._setContent(this.onDownloadStart(), true);

			var self = this;
			
			var getArgs = {
				preventCache: (this.preventCache || this.refreshOnShow),
				url: this.href,
				handleAs: "text"
			};
			if(lang.isObject(this.ioArgs)){
				lang.mixin(getArgs, this.ioArgs);
			}

			var hand = (this._xhrDfd = (this.ioMethod || xhr.get)(getArgs));
			
			hand.addCallback(function(html){
				self._loadPackages(html,self);
			});

			hand.addErrback(function(err){
				if(!hand.canceled){
				// show error message in the pane
					self._onError('Download', err); // onDownloadError
				}
				delete self._xhrDfd;
				return err;
			});

			// Remove flag saying that a load is needed
			delete this._hrefChanged;
		},
		
		_loadPackages: function(html,self) {
			var packages = self._getRequestedDojoTypes(html);
			require(packages,function(){
				try{
					self._isDownloaded = true;
					self._setContent(html, false);
					self.onDownloadEnd();
				}catch(err){
					self._onError('Content', err); // onContentError
				}
				delete self._xhrDfd;
				return html;
			});
		},
		
		_getRequestedDojoTypes: function(html) {
            // summary:
            //      Search the DOM for items for the dojo parser and add them
            //      to the require list.
            
			self._hiddenDiv = domConstruct.create(
				"div",{
				'style':{
					'visibility':'hidden',
					'width':'0px',
					'height':'0px',
					'overflow':'hidden'
				},
				'innerHTML':html
			});
			
			var packages = [];
            var qry = query('[data-dojo-type]',self._hiddenDiv);
            array.forEach(qry,function(node) {
                var type = domAtt.get(node,'data-dojo-type');
                type = type.replace(/\./g,'/');
                packages.push(type);
            },this);
			
			return packages;
        }
	});
    
    return construct;
});