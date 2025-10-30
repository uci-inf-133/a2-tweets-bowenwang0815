function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Filter to just the written tweets
	window.tweet_array = runkeeper_tweets.map(function(t){ return new Tweet(t.text, t.created_at); });
	window.written_tweets = tweet_array.filter(function(t){ return t.written; });
}

function addEventHandlerForSearch() {
	// Search the written tweets as text is entered into the search box, and add them to the table
	const input = document.getElementById('textFilter');
	const tableBody = document.getElementById('tweetTable');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');

	function render(query) {
		// Clear table
		tableBody.innerHTML = '';
		const q = (query || '').trim().toLowerCase();
		searchText.innerText = q;
		if (!q) { searchCount.innerText = '0'; return; }
		const results = (window.written_tweets || []).filter(function(t){
			return t.text.toLowerCase().includes(q);
		});
		searchCount.innerText = results.length.toString();
		// Populate rows
		results.forEach(function(t, idx){
			tableBody.insertAdjacentHTML('beforeend', t.getHTMLTableRow(idx + 1));
		});
	}

	input.addEventListener('input', function(e){
		render(e.target.value);
	});

	// Initialize defaults: 0 tweets and empty search text
	render('');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});