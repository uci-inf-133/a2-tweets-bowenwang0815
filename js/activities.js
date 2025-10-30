function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Build completed tweets with parsed activity and distance
	const completed = tweet_array.filter(function(t){
		return t.source === 'completed_event' && t.activityType !== 'unknown';
	});

	// Count activity frequencies
	const countsByActivity = {};
	for (const t of completed) {
		const a = t.activityType;
		countsByActivity[a] = (countsByActivity[a] || 0) + 1;
	}
	const activities = Object.keys(countsByActivity);
	// Update spans for numberActivities and top three
	document.getElementById('numberActivities').innerText = activities.length.toString();
	const top3 = activities.sort(function(a,b){return countsByActivity[b]-countsByActivity[a];}).slice(0,3);
	document.getElementById('firstMost').innerText = top3[0] || '';
	document.getElementById('secondMost').innerText = top3[1] || '';
	document.getElementById('thirdMost').innerText = top3[2] || '';

	// Compute longest/shortest among top 3 by average distance and weekday vs weekend
	function mean(arr){ if(arr.length===0) return 0; return arr.reduce(function(a,b){return a+b;},0)/arr.length; }
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

	// Create a graph of the number of tweets containing each type of activity
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": { "values": completed },
	  "transform": [ { "aggregate": [{"op":"count","as":"count"}], "groupby": ["activityType"] } ],
	  "mark": {"type":"bar"},
	  "encoding": {
		"x": {"field":"count","type":"quantitative", "title":"Number of Tweets"},
		"y": {"field":"activityType","type":"nominal", "sort":"-x", "title":"Activity"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});
	console.log('Activity counts (raw):', countsByActivity);

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});