/* simpo/widget/magazine/tab.js */

define([
    "dojo/_base/declare",
    "doh",
    "simpo/widget/magazine/tab",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/query",
    "dojo/_base/window",
    "simpo/colour"
],function(
    declare, doh, tab, domConstruct, domStyle, domGeom, $, winBase, colour
) {
        
    "use strict";
    
    function calcContrast(colour1, colour2){
        return ((Math.abs(Math.abs(colour1.brightness()) - Math.abs(colour2.brightness()))/255)*100);
    }
    
    var fixture = declare(
        "simpo.widget.magazine.tab.tests.tab.fixture", null, {
            'name': '',
            'runTest': '',
            'object': {},
            'page':{},
            'body':{},
            
            constructor: function(name, runTest) {
                this.name = name;
                this.runTest = runTest;
            },
            
            setUp: function() {
                winBase.withDoc(
                    $('#testBody')[0].contentWindow.document,
                    function(){
                        this.body = $('body');
                        this.body = this.body[0];
                    },
                    this
                );
                
                this.object = new tab({
                    'height':500, 'width':500,
                    'tile': 'Lorem ipsum',
                    'headline': 'Dolor sit amet metus',
                    'content': 'Sagittis nec rutrum, id mauris pulvinar eu nec non nulla, velit mauris sagittis in vitae, neque lectus sollicitudin. Nec vulputate eget eros quis at, auctor fermentum vehicula orci, suspendisse scelerisque hac.'
                });
            },
            
            tearDown: function() {
            }
        }
    );
    
    doh.register("simpo.widget.magazine.tests.tab", [
        new fixture('_getNodeText', function(){
            doh.assertEqual(
                this.object.headline,
                this.object._getNodeText(this.object._headlineBox)
            );
            
            var testText = '<b>TEST</b> testing, 1, 2, 3';
            this.object._headlineBox.innerHTML = testText;
            
            doh.assertEqual(
                'TEST testing, 1, 2, 3',
                this.object._getNodeText(this.object._headlineBox)
            );
        }),
        
        new fixture('_setImageDimensions', function(){
            var img = domConstruct.create('img',{
                'src':this.object.imageSrc
            },this.body);
            this.object._setImageDimensions(img,50,50);
            var contentBox = domGeom.getContentBox(img);
            
            doh.assertEqual('50',contentBox.h);
            doh.assertEqual('50',contentBox.w);
        }),
        
        new fixture('_getContrastingColour', function(){
            var testColour = new colour('#00ff00');
            var contrastColour = this.object._getContrastingColour(testColour);
            contrastColour = contrastColour.toHex();
            var test1 = testColour.spin(120).toHex();
            var test2 = testColour.spin(-120-120).toHex();
           
            doh.assertEqual(
                true,
                ((test1 == contrastColour)||(test2 == contrastColour))
            );
            
            
            var contrastColour = this.object._getContrastingColour('#00ff00');
            doh.assertEqual(
                true,
                ((test1 == contrastColour)||(test2 == contrastColour))
            );
        }),
        
        new fixture('_getBackgoundColour', function() {
            var testColour = new colour('#ff0000');
            var bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
            
            testColour = new colour('#ffaaaa');
            bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
            
            testColour = new colour('#222200');
            bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
            
            testColour = new colour('#f7f7f7');
            bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
            
            testColour = new colour('#555555');
            bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
            
            testColour = new colour('#888888');
            bkColour = this.object._getBackgoundColour(testColour);
            doh.assertEqual(true,(calcContrast(testColour,bkColour) > 25));
        })
    ]);
});