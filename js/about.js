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