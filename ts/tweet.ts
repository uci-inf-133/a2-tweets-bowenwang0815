class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.startsWith("Achieved"))
        {
            return "achievement"
        }
        else if (this.text.includes("live") || this.text.includes("Watch"))
        {
            return 'live_event'
        }
        else if (this.text.includes("completed") || this.text.includes("posted"))
        {
            return 'completed_event'
        }
        
        return 'miscellaneous'
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        // Clean up the tweet first
        let stripped = this.text
            .replace(/#RunKeeper/gi, '')
            .replace(/https?:\/\/\S+/gi, '')
            .trim();

        // Consider text after the last separator as user-written
        const separators = [" - ", " – ", " — ", ": "];
        let lastIdx = -1;
        for (const sep of separators) {
            const idx = stripped.lastIndexOf(sep);
            if (idx > lastIdx) lastIdx = idx;
        }
        if (lastIdx === -1) return false;
        const tail = stripped.substring(lastIdx + 3).trim();
        return tail.length > 0;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        // Remove hashtag + links first
        let stripped = this.text
            .replace(/#RunKeeper/gi, '')
            .replace(/https?:\/\/\S+/gi, '')
            .trim();

        // Extract the text after the last separator
        const candidates = [" - ", " – ", " — ", ": "];
        let lastIdx = -1, sepLen = 0;
        for (const sep of candidates) {
            const idx = stripped.lastIndexOf(sep);
            if (idx > lastIdx) { lastIdx = idx; sepLen = sep.length; }
        }
        if (lastIdx === -1) return "";
        let userPart = stripped.substring(lastIdx + sepLen).trim();
        // Trim surrounding quotes
        if ((userPart.startsWith('"') && userPart.endsWith('"')) || (userPart.startsWith("'") && userPart.endsWith("'"))) {
            userPart = userPart.substring(1, userPart.length - 1).trim();
        }
        return userPart;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}