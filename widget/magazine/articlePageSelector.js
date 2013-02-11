dojo.provide("rcbc.magazine.articlePageSelector");

dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("rcbc.colour");

// summary:
//		
// description:
//
dojo.declare (
    "rcbc.magazine.articlePageSelector",
    [dijit._Widget,dijit._Templated],
    {
       templateString:'<div dojoAttachPoint="container" class="rcbcMagazineArticleDisplayer-pageSelectors"></div>',
        
        count:0,
        colour:'#000000',
        label:'Pages:',
        _pageSelectors:[],
	_pageNo:0,
        
        postMixInProperties: function() {
            this.label = this.label + '&nbsp;&nbsp;'
	    this._pageNo = 1;
        },
        
        buildRendering: function() {
	    this.inherited(arguments);
            this._addLabel();
            this._addPageSelectors();
	    
	},
        
        _addLabel: function() {
            var label = dojo.create('div',{
		'class':'rcbcMagazineArticleDisplayer-pageSelectorLabel',
		'innerHTML':'Pages:&nbsp;&nbsp;'
	    },this.container);
            dojo.style(label,'color',this.colour);
        },
        
        _addPageSelectors: function() {
            for (var no=1; no <= this.count; no++) {
                var selector = new rcbc.magazine.articlePageSelectorSelector({
		    'pageNo':no,'colour':this.colour
		});
                this._pageSelectors.push(selector);
                dojo.style(selector,'color',this.colour);
                dojo.connect(selector,'onSelect',this,'_select');
                dojo.place(selector.domNode,this.container);
            }
	    this._pageSelectors[this._pageNo-1]._toggle();
        },
        
        _select: function(pageNo) {
	    this._pageSelectors[this._pageNo-1]._toggle();
	    this._pageNo = pageNo;
	    this.onChange(this._pageNo);
        },
	
	onChange: dijit._connectOnUseEventHandler
    }
)