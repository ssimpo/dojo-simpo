// summary:
//		
// description:
//
define([
	"dojo/_base/declare",
	"dijit/_WidgetBase",
	"dojo/dom-class",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/_base/lang",
	"dijit/Dialog",
	"dojo/_base/array",
	"dojo/dom-style",
	"dojo/query",
	"lib/pnglib"
], function(
	declare, _widget, domClass, domAttr, domConstruct, on, lang, dialog, array,
	domStyle, $, pnglib
) {
    
    var construct = declare("simpo.widget.iconEditor",[_widget],{
		src:'',
		container:{},
		
		_imageNode:{},
		_dialog:false,
		_matrix:[],
		_png:{},
		_background:{},
		_forground:{},
		_thumbnail:{},
		
		buildRendering: function() {
			this.inherited(arguments);
			this._contructTemplate();
			
			on(this._imageNode,"click",lang.hitch(this,this.edit));
		},
		
		_contructTemplate: function() {
			this.src = domAttr.get(this.domNode,'src');
			this.container = domConstruct.create('div',{
				'class':'dojoSimpoWidgetIconEditor'
			},this.domNode,'replace');
			this._imageNode = domConstruct.create('img',{
				'src':this.src,
				'width':48,
				'height':48,
				'alt':'Metro Icon'
			},this.container)
		},
		
		edit: function(event) {
			if (this._dialog == false) {
				var div = domConstruct.create('div');
				var table = this._createIconEditor();
				domConstruct.place(table,div);
				var imgDiv = domConstruct.create('div',{
					'class':'dojoSimpoWidgetIconEditorThumbnailDiv'
				},div);
				this._thumbnail = domConstruct.create('img',{
					'class':'dojoSimpoWidgetIconEditorThumbnail',
					'width':48,
					'height':48
				},imgDiv);
				this._updateThumbnail();
				
				this._dialog = new dialog({
					'title':'Edit Icon',
					'content':div,
					'onCancel': lang.hitch(this,this._dialogClosed),
					'class':'dojoSimpoWidgetIconEditorDialog'
				});
			}
			
			this._dialog.show();
		},
		
		_createIconEditor: function() {
			var table = domConstruct.create('table',{
				'class':'dojoSimpoWidgetIconEditorTable',
				'cellspacing':'0'
			});
			on(table,"click",lang.hitch(this,this._pixelClick));
			
			this._png = new pnglib({
				'height':48,'width':48,'depth':256
			});
			this._background = this._png.color(0, 0, 0, 0);
			this._forground = this._png.color(255, 255, 255, 255);
			
			for (var row=1; row<=48; row++){
				var tr = domConstruct.create('tr',{},table);
				for (var col=1; col<=48; col++){
					var td = domConstruct.create('td',{
						'innerHTML':'&nbsp;'
					},tr);
					this._matrix[((row-1)*48)+col] = false;
					this._png.buffer[this._png.index(col,row)] = this._background;
				}
			}
			
			return table;
		},
		
		_pixelClick: function(event) {
			var target = event.target;
			
			if (target.tagName.toLowerCase() == 'td') {
				var table = this._getTableParent(target);
				var cells = $('td',table);
				var cCell = 0;
				
				array.forEach(cells,function(cell,n){
					if (cell == target) {
						cCell = n;
					}
				},this);
				
				var pos = this._calRowCol(cCell);
				if (this._matrix[cCell]) {
					domStyle.set(target,'backgroundColor','#000000');
					this._png.buffer[this._png.index(pos.col,pos.row)] = this._background;
				} else {
					domStyle.set(target,'backgroundColor','#ffffff');
					this._png.buffer[this._png.index(pos.col,pos.row)] = this._forground;
				}
				this._matrix[cCell] = !this._matrix[cCell];
				this._updateThumbnail();
			}
			
		},
		
		_calRowCol: function(cNo) {
			return {
				'row':parseInt(((cNo-(cNo%48))/48),10),
				'col':(cNo%48)
			}
		},
		
		_getTableParent: function(td) {
			var parent = td;
			if (td.tagName.toLowerCase() == 'td') {
				while (parent.tagName.toLowerCase() != 'table') {
					parent = parent.parentNode;
				}
			}
			
			return parent;
		},
		
		_dialogClosed: function(event) {
			console.log(event);
		},
		
		_updateThumbnail: function() {
			domAttr.set(
				this._thumbnail,
				'src',
				'data:image/png;base64,'+this._png.getBase64()
			);
		}
	});
    
    return construct;
});