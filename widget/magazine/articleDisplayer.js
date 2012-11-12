dojo.provide("rcbc.magazine.articleDisplayer");

dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("rcbc.dojo");
dojo.require("rcbc.less");
dojo.require("rcbc.colour");
dojo.require("dojox.encoding.digests.MD5");
dojo.require("rcbc.magazine.articleBox");
dojo.require("rcbc.magazine.articlePageSelector");

dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");

// summary:
//		
// description:
//
dojo.declare (
    "rcbc.magazine.articleDisplayer",
    [dijit._Widget,dijit._Templated],
    {
        templateString: '<div dojoAttachPoint="container" class="rcbcMagazineArticleDisplayer"></div>',
		rows: 2,
		cols: 2,
		size: 50,
		width: 600,
		height: 700,
		store: {},
		boxColours: ['#EE008A','#f7941e','#0ea9eb','#e3ea06'],
		
		_pages: [[]],
		_pageSize: 0,
		_currentPage: 0,
		_currentPage2: 0,
		_stack: {},
		_panes: [],
		
		_boxWidth: 250,
		_boxHeight: 250,
		_margin: 20,
		_thumbHeight: 125,
		_thumbWidth: 125,
		
		_currentSort: [
			{attribute: "date", descending: true},
			{attribute: "title", descending: false}
			
		],
		_currentQuery: {'id':'*'},

		
		_currentBoxColour: -1,
		_boxCount: 0,
		
		postMixInProperties: function() {
			this._boxWidth = (this.width - (this._margin*(this.cols-1))) / this.cols;
			this._boxHeight = (this.height - (this._margin*this.rows) - 20) / this.rows;
			this._pageSize = this.rows * this.cols;
			this._thumbWidth = Math.round(0.431*this._boxWidth);
			this._thumbHeight = Math.round(0.391*this._boxHeight);
			dojo.connect(this.store,"onChange",this,this._updater);
		},
		
		buildRendering: function() {
			this.inherited(arguments);
			
			dojo.style(this.container,'width',this.width+'px');
			dojo.style(this.container,'height',this.height+'px');
		},
		
		_updater: function() {
			this._datafetcher(this._currentQuery,this._currentSort,this.size);
		},
		
		_datafetcher: function(query,sort,size) {
			this.store.fetch({
				'query':query,
				'sort':sort,
				'count':size,
				onComplete: dojo.hitch(this,this._writeContent)
			});
		},
		
		_writeContent: function(data) {
			this._createBoxes(data);
			this._displayCurrentPage();
			this._writePageSelector();
		},
		
		_getBackgroundColor: function(node) {
			while (node != dojo.doc) {
				var bkColour = rcbc.getComputedStyle(node,"background-color");
				if (bkColour) {
					if (!rcbc.contains(bkColour,"transparent") && !rcbc.contains(bkColour,"inherit")) {
						return new rcbc.colour(bkColour);
					}
				}
				node = rcbc.getParentNode(node);
			}
			
			return false;
		},
		
		_writePageSelector: function() {
			var selector = new rcbc.magazine.articlePageSelector({
				'count':this._pages.length,
				'colour':this._selectTextColour(this.container),
				label:'Pages:'
			});
			dojo.style(selector.domNode,'marginTop',this._margin+'px');
			dojo.place(selector.domNode,this.container);
			dojo.connect(selector,'onChange',this,'_selectPage');
		},
		
		_selectPage: function(pageNo) {
			this._stack.selectChild(this._panes[pageNo-1],true);
			this._currentPage2 = (pageNo-1);
			this.draw();
		},
		
		_selectTextColour: function(node) {
			var colourBK = this._getBackgroundColor(node);
			var colour = '#FFFFFF';
			
			if (colourBK) {
				if (colourBK.brightness() > 127) {
					colour = '#00000';
				}
			}
			return colour;
		},
		
		_displayCurrentPage: function() {
			this._clearDisplayer();
			
			var stack = new dijit.layout.StackContainer();
			dojo.forEach(this._pages,function(pageArray){
				var page = new dijit.layout.ContentPane();
				this._panes.push(page);
				dojo.forEach(pageArray,function(box) {
					dojo.place(box.domNode,page.domNode);
				},this);
				dojo.place(page.domNode,stack.domNode);
			},this);
			dojo.place(stack.domNode,this.container);
			stack.startup();
			this._stack = stack;
			this._selectPage(this._currentPage2+1);
		},
		
		draw: function() {
			dojo.forEach(this._pages[this._currentPage2],function(box) {
				box.draw();
			},this);
		},
		
		_clearDisplayer: function() {
			this.container.innerHTML = '';
		},
		
		_createBoxes: function(data) {
			for (var i=0; i<9; i++) {
			dojo.forEach(data,function(item,n) {
				var box = this._createBox(item);
				
				this._boxCount++;
				if (this._pages[this._currentPage].length >= this._pageSize) {
					this._currentPage++;
					this._pages[this._currentPage] = [];
				}
				this._pages[this._currentPage].push(box);
			},this);
			}
		},
		
		_createBox: function(item) {
			var box = new rcbc.magazine.articleBox(dojo.mixin({
				'headline':this._getTitle(item),
				'content':this._getDescription(item),
				'href':this._getLink(item),
				'title':this._getCategory(item),
				'padding':this._margin,
				'width':this._boxWidth,
				'height':this._boxHeight,
				'colour':this._getBoxColour()
			},this._getImageSettings(item)));
			
			this._addBoxLayoutStyles(box);
			return box;
		},
	
		_getImageSettings: function(item) {
			if (item.hasOwnProperty("media_thumbnails")) {
				var sizes = this._resizeInBox(
					item.media_thumbnails[0].media_thumbnail.width,
					item.media_thumbnails[0].media_thumbnail.height
				);
				return {
					'imageSrc':item.media_thumbnails[0].media_thumbnail.url,
					'imageWidth':sizes.width,
					'imageHeight':sizes.height
				};
			} else {
				return {
					'imageSrc':'',
					'imageWidth':this._thumbWidth,
					'imageHeight':this._thumbHeight
				};
			}
		},
		
		_resizeInBox: function(height,width) {
			var factor = (width/height);
			if ((this._thumbWidth > width) && (this._thumbHeight > height)) {
				// Do nothing
			} else if (width == height) {
				if (this._thumbWidth > this._thumbHeight) {
					height = this._thumbHeight;
					width = this._thumbHeight;
				} else {
					height = this._thumbWidth;
					width = this._thumbWidth;
				}
			} else if (width > height) {
				width = this._thumbWidth;
				height = width / factor;
			} else {
				height = this._thumbHeight;
				width = height / factor;
			}
			
			return {'width':width,'height':height};
		},
		
		_addBoxLayoutStyles: function(box) {
			if ((this._boxCount % this.cols) == 0) {
				dojo.style(box.domNode,'clear','left');
			} else {
				dojo.style(box.domNode,'marginLeft',this._margin+'px');
			}
		},
		
		_getBoxColour: function() {
			this._currentBoxColour++;
			if (this._currentBoxColour >= this.boxColours.length) {
				this._currentBoxColour = 0;
			}
			return this.boxColours[this._currentBoxColour];
		},
		
		_getUNID: function(item) {
			// summary:
			//	Get a UNID from the item (32-bit Hex string that is unique to this item).
			// item: Object DojoItemFileWriteStoreItem
			//	Item to grab UNID from.
			// returns: String*32
			
			if (dojo.isString(item)) {
				return dojox.encoding.digests.MD5(
					item,
					dojox.encoding.digests.outputTypes.Hex
				);
			} else {
				if (item.item) { item = item.item[0]; }
				if (rcbc.isDomElement(item)) {
					var UNID = rcbc.query("guid",item);
					if (UNID.length > 0) {
						return dojox.encoding.digests.MD5(
							UNID[0].textContent,
							dojox.encoding.digests.outputTypes.Hex
						);	
					} else {
						UNID = item.id;
						var parts1 = UNID.split('_');
						if (parts1.length > 0) { return parts1[1]; }
					}	
				} else if (this._isDataItem(item)) {
					return this._arrayFlatten(item.id);
				}
			}
			return '';
			
		},
		
		_getLink: function(item) {
			// summary:
			//	Get the link (URL) contained within an item.
			// item: Object DojoItemFileWriteStoreItem
			//	Item to grab link (URL) from.
			// returns: String
			
			return this._arrayFlatten(item.link);
		},		
		
		_getTitle: function(item) {
			// summary:
			//	Get the title contained within an item.
			// item: Object DojoItemFileWriteStoreItem
			//	Item to grab title from.
			// returns: String
			
			return this._arrayFlatten(item.title);
		},
		
		_getDescription: function(item) {
			// summary:
			//	Get the description contained within an item.
			// item: Object DojoItemFileWriteStoreItem
			//	Item to grab description from.
			// returns: String
			
			return this._arrayFlatten(item.description);
		},
		
		_getCategory: function(item) {
			// summary:
			//	Get the description contained within an item.
			// item: Object DojoItemFileWriteStoreItem
			//	Item to grab description from.
			// returns: String
			
			return item.category[0].content;
		},
		
		_arrayFlatten: function(arrayItems) {
			// summary:
			//	Flatten an array into a string.
			// description:
			//	Normally used on single item arrays.
			// arrayItems: array
			//	The array to flatten.
			// returns: string
			
			try {
				return arrayItems.join();
			} catch(e) {
				return arrayItems;
			}
			
		}
		
    }
);
