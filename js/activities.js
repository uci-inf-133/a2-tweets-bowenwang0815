function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completed = tweet_array.filter(function(t){
		return t.source === 'completed_event' && t.activityType !== 'unknown';
	});

	const countsByActivity = {};
	for (const t of completed) {
		const a = t.activityType;
		countsByActivity[a] = (countsByActivity[a] || 0) + 1;
	}
	const activities = Object.keys(countsByActivity);
	document.getElementById('numberActivities').innerText = activities.length.toString();
	const top3 = activities.sort(function(a,b){return countsByActivity[b]-countsByActivity[a];}).slice(0,3);
	document.getElementById('firstMost').innerText = top3[0] || '';
	document.getElementById('secondMost').innerText = top3[1] || '';
	document.getElementById('thirdMost').innerText = top3[2] || '';

	// Compute longest/shortest among top 3 by average distance and weekday vs weekend
	function mean(arr)
	{ 
		if(arr.length===0) return 0; 
		return arr.reduce(function(a,b){return a+b;},0)/arr.length; }
	const top3Set = new Set(top3);
	const top3Completed = completed.filter(function(t){ return top3Set.has(t.activityType) && t.distance > 0; });
	const means = {};
	for (const a of top3) {
		const dists = top3Completed.filter(function(t){ return t.activityType === a; }).map(function(t){ return t.distance; });
		means[a] = mean(dists);
	}
	const sortedByMean = top3.slice().sort(function(a,b){ return means[b] - means[a]; });
	const longest = sortedByMean[0];
	const shortest = sortedByMean[sortedByMean.length - 1];
	document.getElementById('longestActivityType').innerText = longest || 'N/A';
	document.getElementById('shortestActivityType').innerText = shortest || 'N/A';

	const isWeekend = function(d){ const day = d.getDay(); return day === 0 || day === 6; };
	const longestTweets = top3Completed.filter(function(t){ return t.activityType === longest; });
	const weekdayMean = mean(longestTweets.filter(function(t){ return !isWeekend(t.time); }).map(function(t){ return t.distance; }));
	const weekendMean = mean(longestTweets.filter(function(t){ return isWeekend(t.time); }).map(function(t){ return t.distance; }));
	document.getElementById('weekdayOrWeekendLonger').innerText = (weekendMean > weekdayMean) ? 'weekends' : 'weekdays';

	// Activity counts bar chart (completed only)
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Number of Tweets containing each type of activity.",
	  "height": 200,
	  "data": { "values": completed },
	  "transform": [ { "aggregate": [{"op":"count","as":"count"}], "groupby": ["activityType"] } ],
	  "mark": {"type":"bar"},
	  "encoding": {
		"x": {"field":"activityType","type":"nominal", "sort":"-y", "title":"Activity"},
		"y": {"field":"count","type":"quantitative", "title":"Number of Tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});


	// Distances by day of week for the three most tweeted-about activities (points)
	const top3Data = top3Completed.map(function(t){ 
		const d = t.time;
		const dow = d.getDay();
		return { 
			activityType: t.activityType, 
			distance: t.distance, 
			time: d.toISOString(),
			dow: dow
		}; 
	});
	console.log('top3 activities:', top3);
	console.log('top3Completed count:', top3Completed.length);
	if (top3Data.length > 0) { console.log('sample top3Data[0]:', top3Data[0]); }

	const distanceVis = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distances for top 3 activities by day of week.",
	  "height": 200,
	  "data": {"values": top3Data},
	  "mark": {"type":"point", "opacity":0.45},
	  "encoding": {
		"x": {"field":"dow", "type":"ordinal", "title":"Day of Week", "sort":[0,1,2,3,4,5,6],
			"scale": {"domain": [0,1,2,3,4,5,6]},
			"axis": {"grid": true,"labelExpr": "toNumber(datum.value)==0?'Sun':toNumber(datum.value)==1?'Mon':toNumber(datum.value)==2?'Tue':toNumber(datum.value)==3?'Wed':toNumber(datum.value)==4?'Thu':toNumber(datum.value)==5?'Fri':'Sat'"}},
		"y": {"field":"distance", "type":"quantitative", "title":"Distance (mi)"},
		"color": {"field":"activityType", "type":"nominal", "title":"Activity"}
	  }
	};
	vegaEmbed('#distanceVis', distanceVis, {actions:false});

	// Aggregated means by day and activity (bars)
	const distanceVisAggregated = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance for top 3 activities by day of week.",
	  "height": 200,
	  "data": {"values": top3Data},
	  "transform": [
		{"aggregate": [{"op":"mean","field":"distance","as":"meanDistance"}], "groupby": ["activityType", "dow"]}
	  ],
	  "mark": {"type":"point", "size": 40},
	  "encoding": {
		"x": {"field":"dow", "type":"ordinal", "title":"time (day)", "sort":[0,1,2,3,4,5,6],
			"scale": {"domain": [0,1,2,3,4,5,6]},
			"axis": {"labelExpr": "toNumber(datum.value)==0?'Sun':toNumber(datum.value)==1?'Mon':toNumber(datum.value)==2?'Tue':toNumber(datum.value)==3?'Wed':toNumber(datum.value)==4?'Thu':toNumber(datum.value)==5?'Fri':'Sat'",
				"grid": true}},
		"y": {"field":"meanDistance", "type":"quantitative", "title":"Mean of distance", "scale": {"nice": true},
			"axis": {"grid": true}},
		"color": {"field":"activityType", "type":"nominal", "title":"Activity"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distanceVisAggregated, {actions:false});

	// Toggle button behavior
	const btn = document.getElementById('aggregate');
	const visRaw = document.getElementById('distanceVis');
	const visAgg = document.getElementById('distanceVisAggregated');
	// Show means by default; keep container height stable
	visRaw.style.display = 'none';
	visAgg.style.display = 'block';
	btn.innerText = 'Show All Activities';
	btn.addEventListener('click', function(){
		const showingAgg = visAgg.style.display !== 'none';
		visAgg.style.display = showingAgg ? 'none' : 'block';
		visRaw.style.display = showingAgg ? 'block' : 'none';
		btn.innerText = showingAgg ? 'Show means' : 'Show All Activities';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});