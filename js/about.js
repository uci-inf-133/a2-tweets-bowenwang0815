function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// Compute category counts
	const total = tweet_array.length;
	const counts = 
	{
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0
	};
	for (const t of tweet_array) {
		const src = t.source;
		counts[src] += 1;
	}

	
	// Update category spans
	const setTextByClass = (cls, text) => {
		const nodes = document.getElementsByClassName(cls);
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].innerText = text;
		}
	};
	function rounding2decmial (n)
	{
		const num = total === 0 ? 0 : (n/total) * 100;
		return math.format(num, {notation: 'fixed', precision: 2}) + '%';
	}

	setTextByClass('completedEvents', counts.completed_event.toString());
	setTextByClass('completedEventsPct', rounding2decmial(counts.completed_event));
	setTextByClass('liveEvents', counts.live_event.toString());
	setTextByClass('liveEventsPct', rounding2decmial(counts.live_event));
	setTextByClass('achievements', counts.achievement.toString());
	setTextByClass('achievementsPct', rounding2decmial(counts.achievement));
	setTextByClass('miscellaneous', counts.miscellaneous.toString());
	setTextByClass('miscellaneousPct', rounding2decmial(counts.miscellaneous));

	// Written text stats for completed events
	const completedTotal = counts.completed_event;
	const completedWritten = tweet_array.filter(function(t){ return t.source === 'completed_event' && t.written; }).length;
	const writtenPctText = completedTotal === 0 ? '0.00%' : math.format((completedWritten / completedTotal) * 100, {notation:'fixed', precision:2}) + '%';
	setTextByClass('written', completedWritten.toString());
	setTextByClass('writtenPct', writtenPctText);

	// get all the tweet times
	const tweetTimes = tweet_array.map(function(t) 
	{ 
		return t.time.getTime(); 
	});
	const earliestDate = new Date(Math.min.apply(null, tweetTimes));
	const latestDate = new Date(Math.max.apply(null, tweetTimes));
	const dateFormatOptions = 
	{ 	weekday: 'long', 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' };
	document.getElementById('firstDate').innerText = earliestDate.toLocaleDateString('en-US', dateFormatOptions);
	document.getElementById('lastDate').innerText = latestDate.toLocaleDateString('en-US', dateFormatOptions);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});