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

var currentleaderstart = 0;

function initializeEventStatsData(passedevent) {

	updateStatsData(passedevent.id);

	// start off a looped fetching of the data evey 10 seconds.
	var loopInterval = setInterval(function() {
		updateStatsData(passedevent.id);
	}, 5000); // interval set at 10 seconds
}

function sortByCountAndOldestDates(a, b) {
	/*
	{
		"name": "Kevin Quick",
		"badgecount": 3,
		"date": 1578670660
	}
	*/
	// Most recent date at the top of the list
	if (a.badgecount < b.badgecount) {
		return 1;
	}
	if (a.badgecount > b.badgecount) {
		return -1;
	}
	if (a.badgecount == b.badgecount && a.date > b.date) {
		return 1;
	}
	if (a.badgecount == b.badgecount && b.date > a.date) {
		return -1;
	}

	return 0;
}

function sortByNewestDates(a, b) {
	/*
	{
		"name": "Kevin Quick",
		"badgecount": 3,
		"date": 1578670660
	}
	*/
	// Most recent date at the top of the list
	if (a.date > b.date) {
		return -1;
	}
	if (b.date > a.date) {
		return 1;
	}

	return 0;
}

function updateStatsData(eventid) {

	var handler = function(response) {
		if (response.error) {
			showError(response);
		} else {
			// preprocess data
			var data = response;
			//console.log(data);

			var badgestats = [];
			if (response.badgestats) {
				badgestats = response.badgestats;
			}
			var peoplestats = [];
			if (response.peoplestats) {
				peoplestats = response.peoplestats;
			}

			var tempStr = JSON.stringify(peoplestats);
			//console.log(tempStr);

			var latestearners = JSON.parse(tempStr);
			//console.log(latestearners);

			latestearners.sort(sortByNewestDates);
			peoplestats.sort(sortByCountAndOldestDates);

			var attendeecount = 0;
			if (response.attendeecount) {
				attendeecount = parseInt(response.attendeecount);
			}
			//console.log(attendeecount);

			data = {}
			data.attendees = attendeecount;
			data.badges = badgestats;
			data.leaders = peoplestats;
			data.latestearners = latestearners;

			drawStats(data);
		}
	}

	makeRequest("GET", cfg.proxy_path+"/events/stats/"+eventid, {}, handler);
}