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

var event = {};

var badgeDataCopy;
var canvas;
var ctx;
var maxbadges; // maximum number of badges set when data loads
var maxentry=10; // maximum number of entries in first and leader tables
var canvasHeight=100; // height of the canvas
//
function initializePage(passevent) {
	//
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	//
	event = passevent;
	//
	//drawStats(event);  not needed - activated by server script...
	//document.body.style.backgroundImage='url("/images/backsquare.png")'; // set background for this page only
	//document.body.style.background='#00b6e9'; // set background for this page only
	//document.body.style.background='linear-gradient(#1dcdff, #4ca7c1)';
	//document.body.style.background='linear-gradient(#399fbc, #05487c)';
	//document.body.style.background='linear-gradient(#399fbc, #9eefff 30%, #399fbc 60%, #05487c)';
	//document.body.style.background='url("/images/badgeback.png"),linear-gradient(#d37ebb, #fee7ff 30%, #d37ebb 60%, #aa5c84)';
	//document.body.style.background='url("/images/backpinkdot.png"), url("/images/badgeback.png"), linear-gradient(#d37ebb, #fee7ff 30%, #d37ebb 60%, #aa5c84)';
	document.body.style.background='url("/images/lightblueback.png")';
}
//
function drawStats(statsdata) { // statsdata temporarily disabled for demo version...
	// object used just for testing....

		/* statsdata key:
		data.attendees = attendeecount;
		data.badges = badgestats;
		data.leaders = peoplestats; - all 10 = quantity time ascending
		data.latestearners = latestearners; - all resorted by time = quantity time descending newest at top
		*/

		badgeDataCopy=statsdata.badges;
		allDataCopy=statsdata.leaders;
		// find maximum number of different types of badges
		maxbadges=Number(statsdata.badges.length); // use for production page
		//maxbadges=7; // use for testing counts
		//////////
		// latest table
		var temps="<div class=\"lm_head\"><div class=\"lm_headleft\">Name</div><div class=\"lm_headright\">Badges</div></div>";
		for (s=0;s<maxentry;s++){
			if (statsdata.latestearners[s]){
				if (statsdata.latestearners[s].badgecount>=maxbadges){ // test if latest entry has reached maximum badge count - if so display a different background
					temps+="<div class=\"lm_holdermax\"><div class=\"lm_holdername\">"+statsdata.latestearners[s].name.toUpperCase()+"</div><div class=\"lm_holdernumber\">"+statsdata.latestearners[s].badgecount+"</div></div>";
				} else {
					temps+="<div class=\"lm_holder\"><div class=\"lm_holdername\">"+statsdata.latestearners[s].name.toUpperCase()+"</div><div class=\"lm_holdernumber\">"+statsdata.latestearners[s].badgecount+"</div></div>";
				}
			}
		}
		document.getElementById("latestBoardTable").innerHTML=temps;
		//////////
		temps="";
		// leader table

		//currentleaderstart
		// once there are more than 10 people with all badges, rotate just the people with all the badges

		if (statsdata.leaders[10].badgecount >= maxbadges) {
			var temps="<div class=\"ld_head\"><div class=\"ld_headleft\">Position</div><div class=\"ld_headcentre\">Name</div><div class=\"ld_headright\">Badges</div></div>";
			var lastmax = 0;
			var count = 0;
			for (s=currentleaderstart;s<statsdata.leaders.length;s++){
				if (statsdata.leaders[s].badgecount >= maxbadges) {
					lastmax = s;
					if (statsdata.leaders[s] && count < maxentry){
						if(s%2==0){
							temps+="<div class=\"ld_holder\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
						} else {
							temps+="<div class=\"ld_holdergr\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
						}
						count++;
					}
				} else {
					break;
				}
			}
			//console.log(lastmax);
			if (count < maxentry) {
				for (s=0;s<(maxentry-count);s++){
						if (statsdata.leaders[s] ){
						if(s%2==0){
							temps+="<div class=\"ld_holder\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
						} else {
							temps+="<div class=\"ld_holdergr\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
						}
					}
				}
			}
			if (currentleaderstart < lastmax) {
				currentleaderstart++;
			} else {
				currentleaderstart = 0;
			}
		} else {
			var temps="<div class=\"ld_head\"><div class=\"ld_headleft\">Position</div><div class=\"ld_headcentre\">Name</div><div class=\"ld_headright\">Badges</div></div>";
			for (s=0;s<maxentry;s++){
				if (statsdata.leaders[s]){
					if(s%2==0){
						temps+="<div class=\"ld_holder\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
					} else {
						temps+="<div class=\"ld_holdergr\"><div class=\"ld_holderposition\">"+(s+1)+"</div><div class=\"ld_holdername\">"+statsdata.leaders[s].name.toUpperCase()+"</div><div class=\"ld_holdernumber\">"+statsdata.leaders[s].badgecount+"</div></div>";
					}
				}
			}
		}
		document.getElementById("firstBoardTable").innerHTML=temps;
		//////////
		var maxTheight=418; // 418 is the maximum height of the tables
		var itemBheight=maxTheight/maxbadges; // height of the items in the badge table
		// badge frequency display
		temps="";
		var rect = document.getElementById("leaderBadgeDisplay").getBoundingClientRect();
		var largestW=rect.width-69; // account for img + padding (also in resize)
		var largestCount=Math.max.apply(Math, statsdata.badges.map(q => q.issuedcount));
		var imgheight=itemBheight*0.8;
		//
		for (t=0;t<maxbadges;t++){
			if(statsdata.badges[t]){
				var hd=itemBheight*0.4; // show bar and caption of the number of this badge issued
				temps+="<div class=\"leaderholder\" style=\"height:"+itemBheight+"px;max-height:"+itemBheight+"px\">";
				temps+="<div class=\"leaderimgh\" style=\"height:"+imgheight+"px\"><img src=\""+statsdata.badges[t].imageurl+"\"/></div>";
				temps+="<div class=\"leadertitle\" style=\"line-height:"+hd+"px;height:"+hd+"px\">"+statsdata.badges[t].title.toUpperCase()+"</div>";
				var tm=statsdata.badges[t].issuedcount;
				if(Number(tm)>0){ // make >=0 if want to show a zero with no bar...
					var wd=(Number(tm)/largestCount)*largestW; // show bar and caption of the number of this badge issued
					temps+="<div class=\"leaderbar\" style=\"top:"+(hd)+"px\"><div class=\"pipecap\" id=\"pc"+t+"\"style=\"line-height:"+hd+"px\">"+tm+"</div><img id=\"lb"+t+"\"src=\""+cfg.proxy_path+"/images/badgedisplaybar25ns.png\" width=\""+wd+"\" height=\""+(hd*0.89)+"\"/></div>";
				}
				temps+="</div>";
			}
		}
		//
		document.getElementById("leaderBadgeDisplay").innerHTML=temps;
		// get total badges
		var tempBadgeTotal=0
		for (b=0;b<statsdata.badges.length;b++){
			tempBadgeTotal+=Number(statsdata.badges[b].issuedcount);
		}
		// stats tag line
		if (Number(tempBadgeTotal)==1){
			document.getElementById("leaderTagLine").innerHTML=tempBadgeTotal+" badge earned by "+statsdata.leaders.length+" unique badge recipient out of "+statsdata.attendees+" registered badge recipients";
		} else {
			document.getElementById("leaderTagLine").innerHTML=tempBadgeTotal+" badges earned by "+statsdata.leaders.length+" unique badge recipients out of "+statsdata.attendees+" registered badge recipients";
		}
		// draw up the bar chart
		drawCanvas();
}
// draw canvas bars
function drawCanvas(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	var leftX=0;
	var leftXpadding=20;
	var numof=allDataCopy.length; // number of people
	var rightX=window.innerWidth; // width of canvas
	var barwidth=((rightX*0.80)-leftXpadding)/numof;
	canvas.width = rightX*0.80;
	canvas.height = canvasHeight; // height of the canvas
	ctx.lineWidth=barwidth;
	ctx.textAlign="center";
	ctx.font = "8px Arial";
	// draw bars
	for (d=0;d<numof;d++){
		var tpc=allDataCopy[d].badgecount;
		if (tpc>maxbadges){ // maximum number of badges
			tpc=maxbadges;
		}
		var barheight=canvasHeight-((tpc/maxbadges)*canvasHeight);
		leftX=leftXpadding+(d*barwidth+barwidth*0.5);
		ctx.lineWidth=barwidth;
		ctx.strokeStyle="#b4accd";
		ctx.beginPath();
		ctx.moveTo(leftX,canvasHeight);
		ctx.lineTo(leftX,barheight);
		ctx.stroke();
		ctx.lineWidth=1;
		ctx.strokeStyle="#5d3069";
		ctx.beginPath();
		ctx.moveTo(leftX+barwidth*0.5,canvasHeight);
		ctx.lineTo(leftX+barwidth*0.5,0);
		ctx.stroke();
	}
	// draw number background
	ctx.fillStyle="#0b2637";
	ctx.fillRect(0,0,20,100);
	// draw numbers
	for (n=1;n<maxbadges+1;n++){
		ctx.fillStyle="#d6dffb";
		ctx.fillText(n,10,96-((n-1)*(100/(maxbadges*1.05))));
	}
}
//
function resize(){
	var rect = document.getElementById("leaderBadgeDisplay").getBoundingClientRect();
	var largestW=rect.width-69; // account for img + padding (also in main func)
	var largestCount=Math.max.apply(Math, badgeDataCopy.map(q => q.issuedcount));
	for (t=0;t<maxbadges;t++){
		if (document.getElementById("lb"+t)){
			var wd=(Number(badgeDataCopy[t].issuedcount)/largestCount)*largestW;
			document.getElementById("lb"+t).style.width=wd+"px";
		}
	}
  	drawCanvas();
}
window.onresize = resize;