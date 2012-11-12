define([
    "dojo/_base/declare",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dojox/widget/Standby",
	"simpo/io/script",
	"dojo/_base/lang",
	"dojo/_base/xhr",
	"dojo/_base/array",
	"dojo/query",
	"dojo/dom-style"
], function(
    declare, _widget, _templated, standby, io, lang, xhr, array, query, domStyle
){
    var construct = declare("simpo.gmaps.canvas",[_widget,_templated],{
		'templateString':'<div dojoAttachPoint="gcanvas"></div>',
		'height':400,
		'width':400,
		'src':'',
		'zoom':8,
		'show':'',
		'sensor':false,
		'region':'GB',
		'apiKey':0,
		
		'_JSON':{},
		'_map':{},
		'_apiLoaded':false,
		'_standby':{},
		'_standbyOn':false,
		'_currentInfo':{},
		'_apiScriptId':'gmapsapi',
		'_apiCallback':'gmaps_callback',
		'_googleApiUrl':'http://maps.googleapis.com/maps/api/js',
		
		constructor: function() {
			this.lat = parseInt(arguments.lat,10);
			this.lng = parseInt(arguments.lng,10);
		},
		
		postMixInProperties: function () {
			if (this.src != '') {
				this._loadKml(this.src);
			}
			
			console.log(this._getApiUrl());
			new io({
				url:this._getApiUrl(),
				content:{sensor:'false'},
				load:lang.hitch(this,this.load)
			});
		},
		
		_getApiUrl: function() {
			var url = this._googleApiUrl;
			url += '?key=' + this.apiKey;
			url += '&sensor=' + ((this.sensor)?'true':'false');
			return url;
		},
		
		buildRendering: function() {
			this.inherited(arguments);
			domStyle.set(this.gcanvas, 'height', this.height+'px');
			domStyle.set(this.gcanvas, 'width', this.width+'px');
			this._toggleStandby();
		},
		
		_loadKml: function(source) {
			xhr.get({
				url:source,
				preventCache:true,
				handleAs:'xml',
				load:lang.hitch(this,this._kmlLoaded),
				error:function(e) { console.log(e); }
			});
			
			/*var layer = new google.maps.KmlLayer(
				tcc.appendQueryString(source,'noCache',tcc.randomInt(0,1000000000000)),
				{preserveViewport:true,map:this._map}
			);*/
		},
		
		_kmlLoaded: function(dom) {
			this._kmlToJson(dom);
			if (this._apiLoaded) {
				this._renderKml();
			}
		},
		
		_kmlToJson: function(dom) {
			this._JSON = {
				'placemarks':new Array()
			};
			
			var placemarks = query('Placemark',dom);
			if (placemarks.length > 0) {
				array.forEach(placemarks,function(placemark) {
					this._JSON.placemarks.push(
						this._placemarkToJson(placemark)
					);
				},this);
			}
		},
		
		_placemarkToJson: function(placemark) {
			var JSON = {
				'name':this._getTitle(placemark),
				'description':this._getDescription(placemark),
				'point':this._getPlaceCoords(placemark)
			};
			
			return JSON;
		},
		
		load: function() {
			this._apiLoaded = true;
			if (!this._objectIsEmpty(this._JSON)) {
				this._renderKml();
			}
		},
		
		_renderMap: function() {
			var geo = this._getCenter();
			this._map = new google.maps.Map(
				this.gcanvas,
				{
					zoom: this.zoom,
					center: new google.maps.LatLng(geo[0],geo[1]),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
			);
		},
		
		_getCenter: function() {
			var geo = [-34.397, 150.644];
			array.forEach(this._JSON.placemarks,function(placemark) {
				if (this._isEqual(this.zoomTo,placemark.name)) {
					geo = placemark.point;
				}
			},this);
			return geo;
		},
		
		_renderKml: function() {
			this._renderMap();
			array.forEach(this._JSON.placemarks,function(placemark) {
				this._renderPoint(placemark);
			},this);
			this._toggleStandby();
		},
		
		_renderPoint: function(placemark) {
			var marker = this._createMarker(placemark);
			var infoWindow = this._createInfoWindow(placemark,marker);
			this._setDefaultInfoWindow(infoWindow,marker);
		},
		
		_setDefaultInfoWindow: function(infoWindow,marker) {
			if (!this._isEqual(this.show,'')) {
				if (this._isEqual(marker.title,this.show)) {
					infoWindow.open(this._map, marker);
					this._currentInfo = infoWindow;
					this._map.setCenter(marker.position);
					this._map.panBy(0,Math.round(this.height*-0.35));
				}
			}
		},
		
		_createMarker: function(JSON) {
			return new google.maps.Marker({
				'map':this._map,
				'position':new google.maps.LatLng(
					JSON.point[0],JSON.point[1]
				),
				'clickable':true,
				'visible':true,
				'title':JSON.name
			});
		},
		
		_addInfoWindowEvents: function(infoWindow,marker) {
			google.maps.event.addListener(
				marker, 'click',
				lang.hitch(this,this._openInfoWindow,infoWindow,marker)
			);
			google.maps.event.addListener(
				infoWindow, 'closeclick',
				lang.hitch(this,this._closeInfoWindow)
			);
		},
		
		_closeInfoWindow: function() {
			this._currentInfo = {};
		},
		
		_openInfoWindow: function(infoWindow,marker) {
			if (
				(!this._objectIsEmpty(this._currentInfo)) && (this._currentInfo != infoWindow)
			) {
				this._currentInfo.close();
			}
			infoWindow.open(this._map, marker);
			this._currentInfo = infoWindow;
		},
		
		_createInfoWindow: function(JSON,marker) {
			var infoWindow = new google.maps.InfoWindow({
				'content':JSON.description,
				'maxWidth':Math.round(this.width*0.68)
			});
			this._addInfoWindowEvents(infoWindow,marker);
			return infoWindow;
		},
		
		_getPlaceCoords: function(placemark) {
			var coord = query('Point',placemark);
			if (coord.length > 0) {
				var point = this._getNodeText(coord[0]);
				point = point.split(',');
				return new Array(point[1],point[0]);
			}
			return new Array(0,0);
		},
		
		_getTitle: function(placemark) {
			var name = query('name',placemark);
			if (name.length > 0) {
				return this._getNodeText(name[0]);
			} else {
				return false;
			}
		},
		
		_getDescription: function(placemark) {
			var desc = query('description',placemark);
			if (desc.length > 0) {
				return this._getNodeText(desc[0]);
			} else {
				return false;
			}
		},
		
		_toggleStandby: function() {
			if (this._objectIsEmpty(this._standby)) {
				this._standby = new standby({target: this.gcanvas});
				document.body.appendChild(this._standby.domNode);
				this._standby.startup();
			}
			
			if (this._standbyOn) {
				this._standby.hide();
				this._standbyOn = false;
			} else {
				this._standby.show();
				this._standbyOn = true;
			}
		},
		
		_isEqual: function(text1,text2) {
			// summary:
			//	Test if two pieces of text are equal.  Test is non-case-sensative
			//	and trims both text strings first.
			// text1: String
			//	First string to test
			// text2: String
			//	Second string to test
			// returns: Boolean
	
			if (text1 == undefined) { text1 =''; }
			if (text2 == undefined) { text2 =''; }
	
			var ctext1 = lang.trim(text1.toString().toLowerCase());
			var ctext2 = lang.trim(text2.toString().toLowerCase());
	
			return ( (ctext1 == ctext2) ? true:false );
		},
		
		_objectIsEmpty: function(object) {
			// summary:
			//	Test whether a given object is empty or not.
			// object: Object
			//	The object to test.  Does it have any properties?
			// returns: Boolean
	    
			var i = 0;
			if (lang.isObject(object)) {
				try {
					for (var prop in object) { i++; }
				} catch(e) { //Assume an ActiveX Object and that it must have properties
					return false;
				}
			}
			return ( (i==0) ? true:false );
		},
		
		_getNodeText: function(node) {
			// summary:
			//	Get the text content of a node (regardless of browser).
			// node: Object XML
			//	The XML element node you want the text content of.
			// returns: String
	
			if (node.textContent) {
				return node.textContent;
			} else if (node.text) {
				return node.text;
			} else if (node.innerText) {
				return node.innerText;
			} else {
				return '';
			}
		}
	});
    
    return construct;
});