
/*********************************************************************************
* The MIT License (MIT)                                                          *
*                                                                                *
* Copyright (c) 2020 KMi, The Open University UK                                 *
*                                                                                *
* Permission is hereby granted, free of charge, to any person obtaining          *
* a copy of this software and associated documentation files (the "Software"),   *
* to deal in the Software without restriction, including without limitation      *
* the rights to use, copy, modify, merge, publish, distribute, sublicense,       *
* and/or sell copies of the Software, and to permit persons to whom the Software *
* is furnished to do so, subject to the following conditions:                    *
*                                                                                *
* The above copyright notice and this permission notice shall be included in     *
* all copies or substantial portions of the Software.                            *
*                                                                                *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL        *
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER     *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN      *
* THE SOFTWARE.                                                                  *
*                                                                                *
**********************************************************************************/

var badgejson_template = {
	"type": "attendance", // gold, silver, bronze, self, attendance (default) or super
	"filename": "button.txt",
	"pngname": "button.png",
	"ribbon": {
		"title": "THE RIBBON TEXT",
		"fontWeight": "normal", //bold or normal (default)
		"diameterOffset": 0, // -10 to +10 (default 0)
		"verticalOffset": 0, // -10 to +10 (default 0)
		"horizontalOffset": 0 // -5 to +5 (default 0)
	},
	"shield": {
		"title": "Shield Text",
		"fontWeight": "bold", //bold or normal (default)
		"lineSpacing": 1.2, // max = 2, default = 1.2
		"logo": {
			"file": "",
			"base64": "",
			"width": 142, // default 142
			"top": 8 // default 8
		},
		"line1": {
			"text": "Line One",
			"font": "Verdana",
			"fontSize": 20,
			"fontWeight": "normal",
			"fontStyle": "normal",
			"fontColour": "#0C2638",
			"kerning": 0,
			"lineSpacing": 0
		},
		"line2": {
			"text": "Line Two",
			"font": "Verdana",
			"fontSize": 20,
			"fontWeight": "normal",
			"fontStyle": "normal",
			"fontColour": "#0C2638",
			"kerning": 0,
			"lineSpacing": 10
		},
		"line3": {
			"text": "Line Three",
			"font": "Verdana",
			"fontSize": 20,
			"fontWeight": "normal",
			"fontStyle": "normal",
			"fontColour": "#0C2638",
			"kerning": 0,
			"lineSpacing": 10
		},
		"line4": {
			"text": "Line Four",
			"font": "Verdana",
			"fontSize": 20,
			"fontWeight": "normal",
			"fontStyle": "normal",
			"fontColour": "#0C2638",
			"kerning": 0,
			"lineSpacing": 10
		},
		"line5": {
			"text": "Line Five",
			"font": "Verdana",
			"fontSize": 20,
			"fontWeight": "normal",
			"fontStyle": "normal",
			"fontColour": "#0C2638",
			"kerning": 0,
			"lineSpacing": 10
		},
		"textarea": true
		},
};

var canvasWidth = 400;
var canvasHeight = 400;
var colorLayer;
var startR;
var startG;
var startB;
var canvas;
var ctx;
var file;
var ribbonFontSize;
var ribbonFont;
var ribbonFontWeight;
var maxRibbonArc;
var ribbonoffset;
var titleFontSize;
var titleFont;
var minFontSize;
var maxFontSize;
var shieldFontWeight;
var titleTop;
var titleWidth;
var maxTitleHeight;
var centerX;
var centerY;
var radius;
var logoAreaTopY;
var logoimg;
//var logoOriginalWidth;
//var logoOriginalHeight;
var logoWidth;
var logoTop;
var ribbonDiameterOffset;
var ribbonTextYOffset;
var ribbonTextXOffset;
var titleMiddle;
var badgechanged = true;
var badgeimage;
var currentLine = "line1";
var size1, size2, size3, size4, size5;
var defaultLetterSpacing = 0;
var defaultLineSpacing = 10;

var outputPNGsize=400;
var largestPNGsize=400;
var maxLogoStoredDim = 400;
var defaultLogoWidth = 142;

// clone the badge json template;
var badgejson = JSON.parse(JSON.stringify(badgejson_template));

var badgeimages = {};
var table = null;


document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    updateList();
});


function initializePage() {

	//console.log(badgejson);

	document.getElementById("line1").value = badgejson.shield["line1"].text;
	document.getElementById("line2").value = badgejson.shield["line2"].text;
	document.getElementById("line3").value = badgejson.shield["line3"].text;
	document.getElementById("line4").value = badgejson.shield["line4"].text;
	document.getElementById("line5").value = badgejson.shield["line5"].text;
	document.getElementById("line1_fs").value = badgejson.shield["line1"].fontSize;
	document.getElementById("line2_fs").value = badgejson.shield["line2"].fontSize;
	document.getElementById("line3_fs").value = badgejson.shield["line3"].fontSize;
	document.getElementById("line4_fs").value = badgejson.shield["line4"].fontSize;
	document.getElementById("line5_fs").value = badgejson.shield["line5"].fontSize;
	if (badgejson.shield["line1"].fontWeight == "bold") {
		document.getElementById("line1_weight").checked = true;
	} else {
		document.getElementById("line1_weight").checked = false;
	}
	if (badgejson.shield["line2"].fontWeight == "bold") {
		document.getElementById("line2_weight").checked = true;
	} else {
		document.getElementById("line2_weight").checked = false;
	}
	if (badgejson.shield["line3"].fontWeight == "bold") {
		document.getElementById("line3_weight").checked = true;
	} else {
		document.getElementById("line3_weight").checked = false;
	}
	if (badgejson.shield["line4"].fontWeight == "bold") {
		document.getElementById("line4_weight").checked = true;
	} else {
		document.getElementById("line4_weight").checked = false;
	}
	if (badgejson.shield["line5"].fontWeight == "bold") {
		document.getElementById("line5_weight").checked = true;
	} else {
		document.getElementById("line5_weight").checked = false;
	}

	document.getElementById("line1_es").value = badgejson.shield["line1"].kerning;
	document.getElementById("line2_es").value = badgejson.shield["line2"].kerning;
	document.getElementById("line3_es").value = badgejson.shield["line3"].kerning;
	document.getElementById("line4_es").value = badgejson.shield["line4"].kerning;
	document.getElementById("line5_es").value = badgejson.shield["line5"].kerning;

	document.getElementById("line2_is").value = badgejson.shield["line2"].lineSpacing;
	document.getElementById("line3_is").value = badgejson.shield["line3"].lineSpacing;
	document.getElementById("line4_is").value = badgejson.shield["line4"].lineSpacing;
	document.getElementById("line5_is").value = badgejson.shield["line5"].lineSpacing;

	badgechanged = true;
	init();
}

function init() {

	//console.log(badgejson);

	var el = document.getElementById("badgeType");
	el.value = badgejson.type;

	el = document.getElementById("ribbon");
	el.value = badgejson.ribbon.title;

	var el = document.getElementById("ribbonWeight");
	el.value = badgejson.ribbon.fontWeight;

	el = document.getElementById("shield");
	el.value = badgejson.shield.title;

	var el = document.getElementById("shieldWeight");
	el.value = badgejson.shield.fontWeight;

	canvas = document.getElementById("badgeCanvas");
	//canvas = createCanvas(canvasWidth, canvasHeight);
	ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.imageSmoothingQuality = "high";
	file = "";
	ribbonFontSize = 26;
	ribbonFont = "Verdana";
	ribbonFontWeight;
	maxRibbonArc = 135;
	ribbonoffset = 36;
	titleFontSize = 28;
	titleFont = "Verdana";
	minFontSize = 14;
	maxFontSize = 40;
	shieldFontWeight;
	titleTop = 124;
	titleWidth = 244;
	maxTitleHeight = 122;
	centerX = 1 + canvas.width / 2;
	centerY = 12 + canvas.height / 2;
	titleMiddle = titleTop + maxTitleHeight/2;
	radius = 152;
	logoAreaTopY = 262;
	logoWidth = 0;
	logoTop = 0;

	ctx.fillStyle = "#0C2638";

	if (badgejson.type == undefined) {
		file = cfg.proxy_path+'/images/templates/attendance.png'
	} else if (badgejson.type.toLowerCase() == "gold") {
		file = cfg.proxy_path+'/images/templates/gold.png'
	} else if (badgejson.type.toLowerCase() == "silver") {
		file = cfg.proxy_path+'/images/templates/silver.png'
	} else if (badgejson.type.toLowerCase() == "bronze") {
		file = cfg.proxy_path+'/images/templates/bronze.png'
	} else if (badgejson.type.toLowerCase() == "self") {
		file = cfg.proxy_path+'/images/templates/self_assessed.png'
	} else if (badgejson.type.toLowerCase() == "attendance") {
		file = cfg.proxy_path+'/images/templates/attendance.png'
	} else if (badgejson.type.toLowerCase() == "super") {
		file = cfg.proxy_path+'/images/templates/super.png'
		//centerY -= 6;
		//maxTitleHeight -= 12;
	} else {
		file = cfg.proxy_path+'/images/templates/attendance.png'
	}

	if (badgejson.ribbon.diameterOffset == undefined) {
		ribbonDiameterOffset = 0;
	} else {
		ribbonDiameterOffset = parseInt(badgejson.ribbon.diameterOffset);
	}
	if (ribbonDiameterOffset > 15) ribbonDiameterOffset = 15;
	if (ribbonDiameterOffset < -15) ribbonDiameterOffset = -15;
	badgejson.ribbon.diameterOffset = ribbonDiameterOffset;

	if (badgejson.ribbon.verticalOffset == undefined) {
		ribbonTextYOffset = 0;
	} else {
		ribbonTextYOffset = parseInt(badgejson.ribbon.verticalOffset);
	}
	if (ribbonTextYOffset > 15) ribbonTextYOffset = 15;
	if (ribbonTextYOffset < -15) ribbonTextYOffset = -15;
	badgejson.ribbon.verticalOffset = ribbonTextYOffset;

	if (badgejson.ribbon.horizontalOffset == undefined) {
		ribbonTextXOffset = 0;
	} else {
		ribbonTextXOffset = parseInt(badgejson.ribbon.horizontalOffset);
	}
	if (ribbonTextXOffset > 5) ribbonTextXOffset = 5;
	if (ribbonTextXOffset < -5) ribbonTextXOffset = -5;
	badgejson.ribbon.horizontalOffset = ribbonTextXOffset;

	if (badgejson.shield.lineSpacing == undefined) {
		shieldLineSpacing = 1.2;
	} else {
		shieldLineSpacing = Math.abs(1 * badgejson.shield.lineSpacing);
		if (shieldLineSpacing > 2) shieldLineSpacing = 2;
	}

	if (badgejson.ribbon.fontWeight == undefined) {
		ribbonFontWeight = "normal";
	} else if (badgejson.ribbon.fontWeight.toLowerCase() == "bold") {
		ribbonFontWeight = "bold";
	} else {
		ribbonFontWeight = "normal";
	}

	if (badgejson.shield.fontWeight == undefined) {
		shieldFontWeight = "normal";
	} else if (badgejson.shield.fontWeight.toLowerCase() == "bold") {
		shieldFontWeight = "bold";
	} else {
		shieldFontWeight = "normal";
	}

	if (badgejson.shield.logo != undefined) {
		if (badgejson.shield.logo.base64 != undefined && badgejson.shield.logo.base64 != "") {

			if (badgejson.shield.logo.width != undefined) {
				logoWidth = parseInt(badgejson.shield.logo.width);
			} else {
				logoWidth = 142;
			}
			if (badgejson.shield.logo.top != undefined) {
				logoTop = parseInt(badgejson.shield.logo.top);
			} else {
				logoTop = 8;
			}
			logoScale = logoWidth / badgejson.shield.logo.base64Width;
			logoHeight = logoScale * badgejson.shield.logo.base64Height;

			//console.log(badgejson.shield.logo.width + " " + badgejson.shield.logo.height);
		}
	}

	if (badgejson.shield.textarea) {
		document.getElementById("radio_s1").checked = true;
		document.getElementById("radio_s2").checked = true;
		document.getElementById("single_editrow").style.display="block";
		document.getElementById("multi_editrow").style.display="none";
	} else {
		document.getElementById("radio_i1").checked = true;
		document.getElementById("radio_i2").checked = true;
		document.getElementById("single_editrow").style.display="none";
		document.getElementById("multi_editrow").style.display="block";

		document.getElementById(currentLine).value = badgejson.shield[currentLine].text;
		document.getElementById(currentLine + "_fs").value = badgejson.shield[currentLine].fontSize;
		if (badgejson.shield[currentLine].fontWeight == "bold") {
			document.getElementById(currentLine + "_weight").checked = true;
		} else {
			document.getElementById(currentLine + "_weight").checked = false;
		}
		document.getElementById("line1_es").value = badgejson.shield['line1'].kerning;
		document.getElementById("line2_es").value = badgejson.shield['line2'].kerning;
		document.getElementById("line3_es").value = badgejson.shield['line3'].kerning;
		document.getElementById("line4_es").value = badgejson.shield['line4'].kerning;
		document.getElementById("line5_es").value = badgejson.shield['line5'].kerning;

		document.getElementById("line2_is").value = badgejson.shield['line2'].lineSpacing;
		document.getElementById("line3_is").value = badgejson.shield['line3'].lineSpacing;
		document.getElementById("line4_is").value = badgejson.shield['line4'].lineSpacing;
		document.getElementById("line5_is").value = badgejson.shield['line5'].lineSpacing;
	}

	draw();
	refreshPageParts();

}

function refreshPageParts() {
	document.getElementById(currentLine + "_fs").value = badgejson.shield[currentLine].fontSize;
	document.getElementById("badgejson").value = JSON.stringify(badgejson);
}

function draw() {

	if (file != "" && badgechanged) {
		badgeimage = new Image;
		badgeimage.src = file;

		badgeimage.onload = function(){
			badgechanged = false;
			badgeImageReady();
		}
	} else {
		badgeImageReady();
	}
}

function badgeImageReady() {
	ctx.drawImage(badgeimage, 0, 0, canvasWidth, canvasHeight);

	//console.log(badgejson.shield.logo);

	if (badgejson.shield.logo.base64 != "" && badgejson.shield.logo.base64 != undefined) {
		logoimg = new Image();
		logoimg.onload = function(){
			//console.log(centerX + " " + logoAreaTopY + " " + logoTop + " " + logoWidth + " " + logoHeight);
			ctx.drawImage(logoimg, centerX - logoWidth/2, logoAreaTopY + logoTop, logoWidth, logoHeight);
			complete();
		}
		logoimg.src = badgejson.shield.logo.base64;
	} else {
		complete();
	}
}

function complete() {
	startX = 200;
	startY = 280;

	//flood_fill( startX, startY, {r:188, g:211, b:221, a:255});

	ctx.font = ribbonFontWeight + " " + ribbonFontSize + "px " + ribbonFont;
	ctx.textAlign = "center";

	var fontHeight = measureTextHeight(ribbonFont, ribbonFontSize, ribbonFontWeight);

	getCircularText(centerX + ribbonTextXOffset, centerY + ribbonTextYOffset, fontHeight, badgejson.ribbon.title, 2*radius + ribbonDiameterOffset, 180, "center", false, false, 0, true);

	if (badgejson.shield.textarea) {

		ctx.font = shieldFontWeight + " " + titleFontSize + "px " + titleFont;
		fontHeight = measureTextHeight(titleFont, titleFontSize, shieldFontWeight);
		//console.log(fontHeight);

		bottom = wrapText(ctx, badgejson.shield.title, centerX, titleTop + fontHeight, titleWidth, fontHeight * shieldLineSpacing, true);
		titleheight = bottom - titleTop;
		while (titleheight > maxTitleHeight && titleFontSize > minFontSize ) {
			titleFontSize = titleFontSize - 0.3;
			if (titleFontSize < minFontSize) titleFontSize = minFontSize
			ctx.font = shieldFontWeight + " " + titleFontSize + "px " + titleFont;
			fontHeight = measureTextHeight(titleFont, titleFontSize, shieldFontWeight);
			bottom = wrapText(ctx, badgejson.shield.title, centerX, titleTop + fontHeight, titleWidth, fontHeight * shieldLineSpacing, true);
			titleheight = bottom - titleTop;
		}
		titleTop = titleTop + (maxTitleHeight - titleheight)/2;

		bottom = wrapText(ctx, badgejson.shield.title, centerX, titleTop + fontHeight, titleWidth, fontHeight * shieldLineSpacing, false);

	} else {
		var shieldItem = badgejson.shield.line1;

		function handler1(size) {
			size1 = size;
			function handler2(size) {
				size2 = size;
				function handler3(size) {
					size3 = size;
					function handler4(size) {
						size4 = size;
						function handler5(size) {
							size5 = size;
							textHeight = totalTextHeight();
							//console.log(textHeight);

							var top = titleMiddle - 3 - textHeight/2; // -3 added to match single text line y pos
							var topStart = top

							if (badgejson.shield.line1.text.trim() != "") {
								drawText(ctx, size1, top, badgejson.shield.line1);
								top += size1[1];
							}
							if (badgejson.shield.line2.text.trim() != "") {
								if (top > topStart) {
									top += badgejson.shield.line2.lineSpacing;
								}
								drawText(ctx, size2, top, badgejson.shield.line2);
								top += size2[1];
							}
							if (badgejson.shield.line3.text.trim() != "") {
								if (top > topStart) {
									top += badgejson.shield.line3.lineSpacing;
								}
								drawText(ctx, size3, top, badgejson.shield.line3);
								top += size3[1];
							}
							if (badgejson.shield.line4.text.trim() != "") {
								if (top > topStart) {
									top += badgejson.shield.line4.lineSpacing;
								}
								drawText(ctx, size4, top, badgejson.shield.line4);
								top += size4[1];
							}
							if (badgejson.shield.line5.text.trim() != "") {
								if (top > topStart) {
									top += badgejson.shield.line5.lineSpacing;
								}
								drawText(ctx, size5, top, badgejson.shield.line5);
								top += size5[1];
							}
						}
						measureText(badgejson.shield.line5, handler5);
					}
					measureText(badgejson.shield.line4, handler4);
				}
				measureText(badgejson.shield.line3, handler3);

			}
			measureText(badgejson.shield.line2, handler2);
		}
		measureText(badgejson.shield.line1, handler1);
	}
}

function getCircularText(x, y, textHeight, text, diameter, startAngle, align, textInside, inwardFacing, kerning, measure) {
	ctx.save();
    // text:         The text to be displayed in circular fashion
    // diameter:     The diameter of the circle around which the text will
    //               be displayed (inside or outside)
    // startAngle:   In degrees, Where the text will be shown. 0 degrees
    //               if the top of the circle
    // align:        Positions text to left right or center of startAngle
    // textInside:   true to show inside the diameter. False draws outside
    // inwardFacing: true for base of text facing inward. false for outward
    // kerning:     0 for normal gap between letters. positive or
    //               negative number to expand/compact gap in pixels
 //------------------------------------------------------------------------
	var sa = startAngle;
	var da = diameter;

    // declare and intialize canvas, reference, and useful variables
    align = align.toLowerCase();
    var clockwise = align == "right" ? 1 : -1; // draw clockwise for aligned right. Else Anticlockwise
    startAngle = startAngle * (Math.PI / 180); // convert to radians

    // in cases where we are drawing outside diameter,
    // expand diameter to handle it
    if (!textInside) diameter += textHeight * 2;

    // Reverse letter order for align Left inward, align right outward
    // and align center inward.
    if (((["left", "center"].indexOf(align) > -1) && inwardFacing) || (align == "right" && !inwardFacing)) text = text.split("").reverse().join("");

    // Setup letters and positioning
    ctx.translate(x, y);
    startAngle += (Math.PI * !inwardFacing); // Rotate 180 if outward
    ctx.textBaseline = 'middle'; // Ensure we draw in exact center
    ctx.textAlign = 'center'; // Ensure we draw in exact center

    // rotate 50% of total angle for center alignment
    if (align == "center") {
        for (var j = 0; j < text.length; j++) {
            var charWid = ctx.measureText(text[j]).width;
            startAngle += ((charWid + (j == text.length-1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise;
        }
    }

    // Phew... now rotate into final start position
    ctx.rotate(startAngle);
    sumangle = 0;

    // Now for the fun bit: draw, rotate, and repeat
    for (var j = 0; j < text.length; j++) {
        var charWid = ctx.measureText(text[j]).width; // half letter

        ctx.rotate((charWid/2) / (diameter / 2 - textHeight) * clockwise);  // rotate half letter

        sumangle += (charWid/2) / (diameter / 2 - textHeight) * clockwise;

        // draw char at "top" if inward facing or "bottom" if outward
        if (!measure) ctx.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 - (ribbonoffset - textHeight) / 2 +  textHeight));

        ctx.rotate((charWid/2 + kerning) / (diameter / 2 - textHeight) * clockwise); // rotate half letter
        sumangle += (charWid/2 + kerning) / (diameter / 2 - textHeight) * clockwise;
    }
    //console.log(sumangle / (Math.PI / 180));

    if (measure) {
   		totalangle = Math.abs(sumangle/(Math.PI / 180));
   		//console.log(totalangle);
   		if (totalangle > maxRibbonArc) {
   			ribbonFontSize = ribbonFontSize * maxRibbonArc / totalangle;
   			textHeight = measureTextHeight(ribbonFont, ribbonFontSize, ribbonFontWeight);
   			ribbonoffset = ribbonoffset *  (1 - (1 - maxRibbonArc / totalangle)/2);
   			//console.log(ribbonFontSize);
   		}
		ctx.restore();
		ctx.font = ribbonFontWeight + " " + ribbonFontSize + "px " + ribbonFont;
   		getCircularText(x, y, textHeight, text, da, sa, align, textInside, inwardFacing, kerning, false)
    }
	ctx.restore();
}

function measureTextHeight(theFont, theFontSize, theFontWeight) {
	var width = 50;
	var height = 50;
	var left = 0;
	var top = 0;

    var thecanvas = document.createElement('canvas');
    thecanvas.width = width;
    thecanvas.height = height;
	var thecontext = thecanvas.getContext('2d');

	thecontext.font = theFontWeight + " " + theFontSize + "px " + theFont;
    // Draw the text in the specified area
    thecontext.save();
    thecontext.translate(left, top + Math.round(height * 0.7));
    thecontext.fillText("gMI", 0, 0);
    thecontext.restore();

    // Get the pixel data from the canvas
    var data = thecontext.getImageData(left, top, width, height).data,
        firstvar = false,
        last = false,
        r = height,
        c = 0;
        //console.log(data);

    // Find the last line with a non-white pixel
    while(!last && r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                last = r;
                break;
            }
        }
    }

    // Find the first line with a non-white pixel
    while(r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                firstvar = r;
                break;
            }
        }

        // If we've got it then return the height
        if(firstvar != r) {
    		thecanvas.remove();
        	return last - firstvar + 1;
        }
    }
    // We screwed something up...  What do you expect from free code?
    thecanvas.remove();
    return 0;
}

function findSmallestString(word, maxWidth, context) {
	var n=0;
	var bits = "";
	for(n=0; n < word.length; n++) {
		bits = bits+word[n];
		var metrics = context.measureText(bits);
		var testWidth = metrics.width;
		if (testWidth > maxWidth) {
			n = n-1;
			break;
		}
	}
	return n;
}

function wrapText(context, text, x, y, maxWidth, lineHeight, calculate) {
	ctx.save();
	ctx.textBaseline = "bottom";
	var words = text.split(' ');
	var line = '';
	var word = "";
	for(var n = 0; n < words.length; n++) {
		word = words[n];

		// breakword if required
		var metrics = context.measureText(word);
		var testWidth = metrics.width;
		if (testWidth > maxWidth) {
			var len = findSmallestString(word, maxWidth, context);
			line = word.substring(0, len-1);
			words[n] = word.substring(len);
			n--;
			if (line.charAt(line.length - 1) == " ") line = line.substring(0, line.length - 1);
			if (!calculate) context.fillText(line, x, y);
			line = "";
			y += lineHeight;
		} else {
			var testLine = line + word;
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				if (line.charAt(line.length - 1) == " ") line = line.substring(0, line.length - 1);
				if (!calculate) context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			} else {
				line = testLine + ' ';
			}
		}
	}

	if (line.charAt(line.length - 1) == " ") line = line.substring(0, line.length - 1);
	if (!calculate) context.fillText(line, x, y);
	//console.log(y);
	ctx.restore();
	return y;
}

function flood_fill( x, y, color ) {
	pixel_stack = [{x:x, y:y}] ;
	pixels = ctx.getImageData( 0, 0, canvas.width, canvas.height ) ;
	var linear_cords = ( y * canvas.width + x ) * 4 ;
	original_color = {r:pixels.data[linear_cords],
					  g:pixels.data[linear_cords+1],
					  b:pixels.data[linear_cords+2],
					  a:pixels.data[linear_cords+3]} ;

	while( pixel_stack.length>0 ) {
		new_pixel = pixel_stack.shift() ;
		x = new_pixel.x ;
		y = new_pixel.y ;

		//console.log( x + ", " + y ) ;

		linear_cords = ( y * canvas.width + x ) * 4 ;
		while( y-->=0 &&
			   (pixels.data[linear_cords]==original_color.r &&
				pixels.data[linear_cords+1]==original_color.g &&
				pixels.data[linear_cords+2]==original_color.b &&
				pixels.data[linear_cords+3]==original_color.a) ) {
			linear_cords -= canvas.width * 4 ;
		}
		linear_cords += canvas.width * 4 ;
		y++ ;

		var reached_left = false ;
		var reached_right = false ;
		while( y++<canvas.height &&
			   (pixels.data[linear_cords]==original_color.r &&
				pixels.data[linear_cords+1]==original_color.g &&
				pixels.data[linear_cords+2]==original_color.b &&
				pixels.data[linear_cords+3]==original_color.a) ) {
			pixels.data[linear_cords]   = color.r ;
			pixels.data[linear_cords+1] = color.g ;
			pixels.data[linear_cords+2] = color.b ;
			pixels.data[linear_cords+3] = color.a ;

			if( x>0 ) {
				if( pixels.data[linear_cords-4]==original_color.r &&
					pixels.data[linear_cords-4+1]==original_color.g &&
					pixels.data[linear_cords-4+2]==original_color.b &&
					pixels.data[linear_cords-4+3]==original_color.a ) {
					if( !reached_left ) {
						pixel_stack.push( {x:x-1, y:y} ) ;
						reached_left = true ;
					}
				} else if( reached_left ) {
					reached_left = false ;
				}
			}

			if( x<canvas.width-1 ) {
				if( pixels.data[linear_cords+4]==original_color.r &&
					pixels.data[linear_cords+4+1]==original_color.g &&
					pixels.data[linear_cords+4+2]==original_color.b &&
					pixels.data[linear_cords+4+3]==original_color.a ) {
					if( !reached_right ) {
						pixel_stack.push( {x:x+1,y:y} ) ;
						reached_right = true ;
					}
				} else if( reached_right ) {
					reached_right = false ;
				}
			}

			linear_cords += canvas.width * 4 ;
		}
	}
	ctx.putImageData( pixels, 0, 0 ) ;
}

function is_in_pixel_stack( x, y, pixel_stack ) {
	for( var i=0 ; i<pixel_stack.length ; i++ ) {
		if( pixel_stack[i].x==x && pixel_stack[i].y==y ) {
			return true ;
		}
	}
	return false ;
}

function totalTextHeight() {
	var textHeight = 0;
	if (badgejson.shield.line1.text.trim() != "") textHeight += size1[1];
	if (badgejson.shield.line2.text.trim() != "" && textHeight > 0) textHeight += badgejson.shield.line2.lineSpacing;
	if (badgejson.shield.line2.text.trim() != "") textHeight += size2[1];
	if (badgejson.shield.line3.text.trim() != "" && textHeight > 0) textHeight += badgejson.shield.line3.lineSpacing;
	if (badgejson.shield.line3.text.trim() != "") textHeight += size3[1];
	if (badgejson.shield.line4.text.trim() != "" && textHeight > 0) textHeight += badgejson.shield.line4.lineSpacing;
	if (badgejson.shield.line4.text.trim() != "") textHeight += size4[1];
	if (badgejson.shield.line5.text.trim() != "" && textHeight > 0) textHeight += badgejson.shield.line5.lineSpacing;
	if (badgejson.shield.line5.text.trim() != "") textHeight += size5[1];
	return textHeight;
}

function drawText(context, size, top, item) {
	context.save();
	var fontStr = item.fontWeight.toLowerCase() + " " + item.fontSize + "px " + item.font;
	var fontStrBold = "bold " + item.fontSize + "px " + item.font;
	var boldSkipTo = -1;
	if (item.fontStyle.toLowerCase() == "italic") fontStr = "italic " + fontStr;
	context.font = fontStr;
	context.fillStyle = item.fontColour;
	context.textBaseline = "top";
	context.textAlign = "left";
	var textx = centerX - size[0]/2;
	var texty = top;
	for (i = 0; i < item.text.length; i++) {
		if (item.text.length - i >= 3 && item.text[i] == "<" && item.text[i + 1].toLowerCase() == "b" && item.text[i + 2] == ">") {
			boldSkipTo = i + 2;
			context.font = fontStrBold;
		} else if (item.text.length - i >= 4 && item.text[i] == "<" && item.text[i + 1] == "/" && item.text[i + 2].toLowerCase() == "b" && item.text[i + 3] == ">") {
				boldSkipTo = i + 3;
				context.font = fontStr;
		}
		if (i > boldSkipTo) {
			context.fillText(item.text[i], textx, texty);
			textx += context.measureText(item.text[i]).width + item.kerning;
		}
	}
	context.restore();
	refreshPageParts();
}

function measureText(item, handler) {
	var width = 400;
	var height = 400;
	var left = 0;
	var top = 0;

	if (item.text.trim() != "") {

		var thecanvas = document.createElement('canvas');
		thecanvas.width = width;
		thecanvas.height = height;
		var thecontext = thecanvas.getContext('2d');
		thecontext.clearRect(0, 0, width, height);

		var fontStr = item.fontWeight.toLowerCase() + " " + item.fontSize + "px " + item.font;
		var fontStrBold = "bold " + item.fontSize + "px " + item.font;
		var boldSkipTo = -1;
		if (item.fontStyle.toLowerCase() == "italic") fontStr = "italic " + fontStr;
		thecontext.font = fontStr;
		thecontext.fillStyle = "#000000";


		// Draw the text in the specified area
		thecontext.save();
		thecontext.translate(left, top + Math.round(height * 0.5));

		var textx = left;
		for (i = 0; i < item.text.length; i++) {
			if (item.text.length - i >= 3 && item.text[i] == "<" && item.text[i + 1].toLowerCase() == "b" && item.text[i + 2] == ">") {
				boldSkipTo = i + 2;
				thecontext.font = fontStrBold;
			} else if (item.text.length - i >= 4 && item.text[i] == "<" && item.text[i + 1] == "/" && item.text[i + 2].toLowerCase() == "b" && item.text[i + 3] == ">") {
				boldSkipTo = i + 3;
				thecontext.font = fontStr;
			}
			if (i > boldSkipTo) {
				thecontext.fillText(item.text[i], textx, 0);
				textx += thecontext.measureText(item.text[i]).width + item.kerning;
			}
		}

		thecontext.restore();

		pleft = width;
		pright = 0;
		ptop = height;
		pbottom = 0;


		// Get the pixel data from the canvas
		var data = thecontext.getImageData(left, top, width, height).data
		for (x = 0; x < width; x++) {
			for (y = 0; y < height; y++) {
				index = (x + y * width) * 4;
				a = data[index + 3];

				if (a > 0) {
					if (x < pleft) pleft = x;
					if (x > pright) pright = x;
					if (y < ptop) ptop = y;
					if (y > pbottom) pbottom = y;

				}
				//console.log(a);
			}
		}
		//console.log(pleft + " " + pright + " " + ptop + " " + pbottom);
		var wsize = pright - pleft;
		var hsize = pbottom - ptop;
		//console.log(wsize + " " + hsize);

		if (wsize > titleWidth && item.fontSize > minFontSize) {
			item.fontSize = Math.floor(item.fontSize * titleWidth / wsize);
			if (item.fontSize < minFontSize) item.fontSize = minFontSize;
			thecanvas.remove();
			measureText(item, handler);
		} else {
			size = [wsize, hsize];
			thecanvas.remove();
			//console.log(size);
			handler(size);
		}
   	} else {
		size = [0, 0];
		//console.log(size);
		handler(size);
   	}

}

function updateType(val) {
	badgejson.type = val;
	badgechanged = true;
	init();
}

function updateRibbon(val) {
	badgejson.ribbon.title = val;
	init();
}

function updateRibbonWeight(val) {
	badgejson.ribbon.fontWeight = val;
	init();
}

function updateShield(val) {
	badgejson.shield.title = val;
	init();
}

function updateShieldWeight(val) {
	badgejson.shield.fontWeight = val;
	init();
	//var dataURL = canvas.toDataURL('image/png');
}

function handleFiles(e) {
	//console.log(e);
    var url = URL.createObjectURL(e[0]);

    logoimg = new Image();
    logoimg.onload = function() {

  		var logoOriginalHeight = logoimg.height;
  		var logoOriginalWidth = logoimg.width;

    	if (logoimg.height > maxLogoStoredDim || logoimg.width > maxLogoStoredDim) {
    		var scale;
    		if (logoimg.height / maxLogoStoredDim > logoimg.width / maxLogoStoredDim) {
    			scale = maxLogoStoredDim / logoimg.height;
    			logoOriginalHeight = maxLogoStoredDim;
  				logoOriginalWidth = parseInt(logoimg.width * scale);

    		} else {
    			scale = maxLogoStoredDim / logoimg.width;
    			logoOriginalWidth = maxLogoStoredDim;
  				logoOriginalHeight = parseInt(logoimg.height * scale);
    		}
    	}
    	//console.log(logoOriginalWidth + " " + logoOriginalHeight);

 		var tcanvas = document.createElement('canvas'),
   		tctx = tcanvas.getContext('2d');
  		tcanvas.height = logoOriginalHeight;
  		tcanvas.width = logoOriginalWidth;
  		tctx.drawImage(logoimg, 0, 0, logoOriginalWidth, logoOriginalHeight);

  		var uri = tcanvas.toDataURL('image/png');
  		base64 = uri.replace(/^data:image.+;base64,/, '');
  		badgejson.shield.logo.base64 = uri;

  		badgejson.shield.logo.base64Height = logoOriginalHeight;
  		badgejson.shield.logo.base64Width = logoOriginalWidth;

  		//console.log(badgejson);
  		//document.getElementById("test").src = uri;
    	init();
    }
    logoimg.src = url;
}

function plusImage() {
	badgejson.shield.logo.width += 2;
	if (badgejson.shield.logo.width > 200) badgejson.shield.logo.width = 200;
	init();
}

function minusImage() {
	badgejson.shield.logo.width -= 2;
	if (badgejson.shield.logo.width < 20) badgejson.shield.logo.width = 20;
	init();
}

function downImage() {
	badgejson.shield.logo.top += 2;
	if (badgejson.shield.logo.top > 40) badgejson.shield.logo.top = 40;
	init();
}

function upImage() {
	badgejson.shield.logo.top -= 2;
	if (badgejson.shield.logo.top < -10) badgejson.shield.logo.top = -10;
	init();
}


function rightRibbon() {
	badgejson.ribbon.horizontalOffset += 1;
	init();
}
function leftRibbon() {
	badgejson.ribbon.horizontalOffset -= 1;
	init();
}

function downRibbon() {
	badgejson.ribbon.verticalOffset += 1;
	init();
}
function upRibbon() {
	badgejson.ribbon.verticalOffset -= 1;
	init();
}

function downDiameter() {
	badgejson.ribbon.diameterOffset -= 2;
	init();
}
function upDiameter() {
	badgejson.ribbon.diameterOffset += 2;
	init();
}
/*
// choose to save 400x400 or 200x200 png
var createSmall=0;
function resizebut() {
	if (createSmall==0){
		createSmall=1;
		document.getElementById("sizebutid").innerHTML="200";
	} else {
		createSmall=0;
		document.getElementById("sizebutid").innerHTML="400";
	}
}
*/

function textareaChange() {
	//console.log(document.getElementById("badgejson").value);
	badgejson = JSON.parse(document.getElementById("badgejson").value);
    logoimg = new Image();
	if (badgejson.shield.logo.base64 != "") {
		logoimg.src = badgejson.shield.logo.base64;
		logoimg.onload = function(){
			first();
		}
	} else {
		first();
	}
}

function downFont(which) {
	currentLine = which;
	badgejson.shield[currentLine].fontSize = badgejson.shield[currentLine].fontSize - 1;
	if (badgejson.shield[currentLine].fontSize < minFontSize) badgejson.shield[currentLine].fontSize = minFontSize;
	//if (badgejson.shield[currentLine].fontSize < 9) badgejson.shield[currentLine].fontSize = 9;
	init();
}

function upFont(which) {
	currentLine = which;
	badgejson.shield[currentLine].fontSize = badgejson.shield[currentLine].fontSize + 1;
	if (badgejson.shield[currentLine].fontSize > maxFontSize) badgejson.shield[currentLine].fontSize = maxFontSize;
	init();
}

function changeFontSize(which, form) {
	currentLine = which;
	badgejson.shield[currentLine].fontSize = form.value;
	if (badgejson.shield[currentLine].fontSize > maxFontSize) badgejson.shield[currentLine].fontSize = maxFontSize;
	if (badgejson.shield[currentLine].fontSize < minFontSize) badgejson.shield[currentLine].fontSize = minFontSize;
	init();
}

function downLetterSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].kerning -= 1;
	if (badgejson.shield[currentLine].kerning < 0) badgejson.shield[currentLine].kerning = 0;
	//console.log(JSON.stringify(badgejson));
	init();
}

function upLetterSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].kerning += 1;
	if (badgejson.shield[currentLine].kerning > 10) badgejson.shield[currentLine].kerning = 10;
	init();
}

function changeLetterSpacing(which, form) {
	currentLine = which;
	badgejson.shield[currentLine].kerning = 1 * form.value;
	if (badgejson.shield[currentLine].kerning < 0) badgejson.shield[currentLine].kerning = 0;
	if (badgejson.shield[currentLine].kerning > 10) badgejson.shield[currentLine].kerning = 10;
	init();
}

function equalLetterSpacing(which) {
	currentLine = which;
	var letterspacing = badgejson.shield[currentLine].kerning;
	badgejson.shield["line1"].kerning = letterspacing;
	badgejson.shield["line2"].kerning = letterspacing;
	badgejson.shield["line3"].kerning = letterspacing;
	badgejson.shield["line4"].kerning = letterspacing;
	badgejson.shield["line5"].kerning = letterspacing;
	init();
}

function downLineSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].lineSpacing -= 2;
	if (badgejson.shield[currentLine].lineSpacing < 0) badgejson.shield[currentLine].lineSpacing = 0;
	init();
}

function upLineSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].lineSpacing += 2;
	if (badgejson.shield[currentLine].lineSpacing > 50) badgejson.shield[currentLine].lineSpacing = 50;
	init();
}

function changeLineSpacing(which, form) {
	currentLine = which;
	badgejson.shield[currentLine].lineSpacing = 2 * Math.floor(parseInt(form.value)/2);
	if (badgejson.shield[currentLine].lineSpacing < 0) badgejson.shield[currentLine].lineSpacing = 0;
	if (badgejson.shield[currentLine].lineSpacing > 50) badgejson.shield[currentLine].lineSpacing = 50;
	init();
}


function equalLineSpacing(which) {
	currentLine = which;
	var currentspacing = badgejson.shield[currentLine].lineSpacing;
	badgejson.shield["line2"].lineSpacing = currentspacing;
	badgejson.shield["line3"].lineSpacing = currentspacing;
	badgejson.shield["line4"].lineSpacing = currentspacing;
	badgejson.shield["line5"].lineSpacing = currentspacing;
	init();
}

function resetLetterSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].kerning = defaultLetterSpacing;
	init();
}

function resetLineSpacing(which) {
	currentLine = which;
	badgejson.shield[currentLine].lineSpacing = defaultLineSpacing;
	init();
}

function updateText(val, which) {
	currentLine = which;
	badgejson.shield[currentLine].text = val;
	init();
}

function boldCheck(check, which) {
	currentLine = which;
	if (check.checked) {
		badgejson.shield[currentLine].fontWeight = "bold";
	} else {
		badgejson.shield[currentLine].fontWeight = "normal";
	}
	init();
}

function typeChange(value){
	badgejson.shield.textarea = true;
	if (value == "multiple") {
		badgejson.shield.textarea = false;
	}
	init();
}

function preventNonNumericalInput(e, form) {
	e = e || window.event;
	var charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
	var charStr = String.fromCharCode(charCode);

	if (!charStr.match(/^[0-9]+$/)) e.preventDefault();
	//form.value = 1 * form.value;
}

//////////////////////////////////////////////////////////////////////////////////////////

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function savetoclip() {
	var t=document.getElementById("badgejson").value;
	copyToClipboard(t);
}
// force a maximum and minimum (not under 0) png size
function handleSize(n) {
	var tn=Number(n.value);
	if (tn<0){
		outputPNGsize=100;
		document.getElementById("chosenSize").value=100;
	} else if (tn>largestPNGsize){
		outputPNGsize=largestPNGsize;
		document.getElementById("chosenSize").value=largestPNGsize;
	} else {
		outputPNGsize=tn;
	}
}

function handletxt(n) {
	badgejson.filename=n.value;
	init();
}

function handlepng(n) {
	badgejson.pngname=n.value;
	init();
}

function checkSizeInput(e,value){
    // Check Character
    var unicode=e.charCode? e.charCode : e.keyCode;
    if (value.indexOf(".") != -1)if( unicode == 46 )return false;
    if (unicode!=8)if((unicode<48||unicode>57)&&unicode!=46)return false;
    outputPNGsize=Number(value);
}

function checkLengthSizeInput(len,ele){
    var fieldLength = ele.value.length;
    if(fieldLength <= len){
        return true;
    } else {
        var str = ele.value;
        str = str.substring(0, str.length - 1);
    	ele.value = str;
    }
}


/*function loadTextFile() {
    var text = document.getElementById("badgejson").value;
 }*/

function loadaFile(o){
	var fr = new FileReader();
	fr.onload = function(e){
		showDataFile(e, o);
	};
	fr.readAsText(o.files[0]);
}

function showDataFile(e, o){
	var fname = o.value.substring(o.value.lastIndexOf("\\") + 1, o.value.length);
	//document.getElementById("saveFileName").value = fname;
	document.getElementById("saveFileName").value = e.target.filename;
	document.getElementById("chosenFileName").value = e.target.pngname;
	document.getElementById("badgejson").focus();
	document.getElementById("badgejson").value = e.target.result;
	document.getElementById("badgejson").blur();
}

function showHelp() {
	alert("Files will be saved to the downloads folder.\r\nThe maximum size is 400px.\r\nYou can copy and paste the code in the lower text box as an alternative way to save the badge.\r\nYou can alter the badge by changing the code in the lower box (click off the box to commit the change).\r\nAny loaded logo image is converted, embedded and saved in the file.\r\nLogos have better anti-aliasing when using Chrome, Firefox creates more jagged edges (Feb 2020).");
}

function createBadgeImage() {

	var name = document.getElementById("name").value;
	if (!name || name == "") {
		alert("You must give your badge image item a name to save it against.");
		return;
	}
	name = demicrosoftize(name);

    var text = document.getElementById("badgejson").value;

	var send = {};
	send.name = name;
	send.json = document.getElementById("badgejson").value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			resetBadgeCreator();
			var innerhandler = function(response) {
				editBadgeImage(response.id);
			}
			updateList(innerhandler, response);
		}
	}

	makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/images/create", send, handler);
}

function editBadgeImage(badgeimageid) {
	var badgeimage = badgeimages[badgeimageid];

	if (badgeimage.url && badgeimage.url != "" && badgeimage != null) {
		var message = "The badge image entry for:\n\n "+badgeimage.name+"\n\nhas been published. Please note that editing and saving this image will unpublish the existing image file.\n\nDo you want to proceed?";
		var reply = confirm(message);
		if (reply === false) {
			return;
		}
	}

	document.getElementById("badgeimageid").value = badgeimage.id;
	document.getElementById("name").value = badgeimage.name;

	document.getElementById("updateButton").style.display = "inline";
	document.getElementById("saveButton").style.display = "none";
	document.getElementById("publishButton").disabled = false;

	//document.getElementById("badgejson").value = badgeimage.json;

	badgejson = JSON.parse(badgeimage.json);

	//textareaChange();

	initializePage();
}

function updateBadgeImage() {

	var send = {};
	send.id = document.getElementById("badgeimageid").value;
	send.name = demicrosoftize(document.getElementById("name").value);
	send.json = document.getElementById("badgejson").value;

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			resetBadgeCreator();
			updateList();
		}
	}

	makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/images/update", send, handler);
}

function resetBadgeCreator() {

	document.getElementById("updateButton").style.display = "none";
	document.getElementById("saveButton").style.display = "inline";
	document.getElementById("publishButton").disabled = true;

	document.getElementById("badgeimageid").value = "";
	document.getElementById("name").value = "";

	badgejson = JSON.parse(JSON.stringify(badgejson_template));
	initializePage();
}

function deleteBadgeImage(badgeimageid) {
	var badgeimage = badgeimages[badgeimageid];

	var message = "Are you sure you want to delete the badge image entry for:\n\n "+badgeimage.name+"\n";
	var reply = confirm(message);
	if (reply == true) {

		var handler = function(response) {
			if (response.error) {
				showError(response);
			} else {
				resetBadgeCreator();
				updateList();
			}
		}

		var send = {};
		send.id = badgeimageid;
		makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/images/delete", send, handler);
	} else {
	  // do nothing
	}
}

function cloneBadgeImage(badgeimageid) {
	var badgeimage = badgeimages[badgeimageid];

	document.getElementById("updateButton").style.display = "none";
	document.getElementById("saveButton").style.display = "inline";

	document.getElementById("badgeimageid").value = "";
	document.getElementById("name").value = badgeimage.name+" Copy";
	badgejson = JSON.parse(badgeimage.json);
	initializePage();

	document.getElementById("name").focus();
}

function publishBadgeImage() {

	// is it a new image or an existing image?
	var badgeimageid = document.getElementById("badgeimageid").value;
	if (badgeimageid == "") {
		alert("You must have saved a draft of your badge image before you can publish it.");
	} else {
		var badgeimage = badgeimages[badgeimageid];

		var message = "Are you sure you want to publish the badge image:\n\n"+badgeimage.name+"\n\nto the server?\n";
		var reply = confirm(message);
		if (reply == true) {

			var name = document.getElementById("name").value;
			if (!name || name == "") {
				alert("You must give your badge image item a name to save it against.");
				return;
			}
			name = demicrosoftize(name);

			var tcanvas = document.createElement('canvas'),
			tctx = tcanvas.getContext('2d');
			tcanvas.height = outputPNGsize;
			tcanvas.width = outputPNGsize;
			var sourceImageData = canvas.toDataURL("image/png");
			//console.log(sourceImageData);

			var send = {};
			send.id = badgeimageid;
			send.imagedata = sourceImageData;

			var handler = function(response) {
				if (response.error) {
					showError(response);
				} else {
					resetBadgeCreator();
					updateList();
				}
			}
			makeRequest("POST", cfg.proxy_path+cfg.badges_path+"/images/publish", send, handler);
		}
	}
}

// https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
function copyToClipboard(str) {

	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);

	fadeMessage("URL copied to clipboard");
};

/**
 * Load list of saved badge images from database
 */
function updateList(returnhandler, params){

	var handler = function(response) {

		badgeimages = {}
		var data = new Array();

		if ( response && response.badgeimages && response.badgeimages.length > 0 ) {

			for (i = 0; i < response.badgeimages.length; i++) {

				// store to global list by id
				badgeimages[response.badgeimages[i].id] = response.badgeimages[i];

				// <button id="file-container" onclick="document.getElementById('file-input').click();">Open</button>

				data[i] = {};

				data[i].id = response.badgeimages[i].id;
				data[i].name = response.badgeimages[i].name;

				if (response.badgeimages[i].url && response.badgeimages[i].url != "" && response.badgeimages[i].url != null) {
					data[i].url = '<img src="'+response.badgeimages[i].url+'" width="100" /><a style="padding-left:20px;" class="wrapit" target="_blank" href="'+response.badgeimages[i].url+'">Open in new tab</a>';
					data[i].url += '<a style="padding-left:20px;" class="wrapit" target="_blank" onclick="copyToClipboard(\''+response.badgeimages[i].url+'\');return false;" onmouseover="this.style.cursor=\'pointer\'">Copy URL</a>';
				} else {
					data[i].url = '';
				}

				if (response.badgeimages[i].usedInBadge === false) {
					data[i].edit = '<center><button class="sbut" title="Edit" onclick="editBadgeImage(\''+response.badgeimages[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/edit.png" /></button></center>';
					data[i].delete = '<center><button class="sbut" title="Delete" onclick="deleteBadgeImage(\''+response.badgeimages[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/delete.png" /></button></center>';
				} else {
					data[i].edit = 'Used in badge';
					data[i].delete = 'Used in badge';
				}
				data[i].clone = '<center><button class="sbut" title="Delete" onclick="cloneBadgeImage(\''+response.badgeimages[i].id+'\');"><img src="'+cfg.proxy_path+'/images/issuing_buttons/copy.png" /></button></center>';
			}
		}

		if (table != null) table.destroy();

		table = $('#storedList').DataTable({
			"data": data,
			"stateSave": true,
			"columns": [
				{ "data": "id", "title": "ID", "width": "5%" },
				{ "data": "name", "title": "Name", "width": "30%" },
				{ "data": "url", "title": "Published Image", "width": "35%" },
				{ "data": "edit" , "title": "Edit", "width": "10%", "orderable": true },
				{ "data": "delete" , "title": "Delete", "width": "10%", "orderable": true },
				{ "data": "clone", "title": "Clone", "width": "10%", "orderable": false  },
			],
			"order": [[ 0, "desc" ]]
		});

		if (returnhandler && typeof returnhandler === "function") {
			returnhandler(params);
		}
	}

	makeRequest("GET", cfg.proxy_path+cfg.badges_path+"/images/list", {}, handler);
}