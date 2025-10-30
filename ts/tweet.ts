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
        const lower = this.text.toLowerCase();
        // running variants
        if (lower.includes(' run') || lower.startsWith('run') || lower.includes('running') || lower.includes('ran') || lower.includes('jog') || lower.includes('treadmill')) return 'running';
        // walking variants
        if (lower.includes(' walk') || lower.startsWith('walk') || lower.includes('walking') || lower.includes('walked') || lower.includes('power walk')) return 'walking';
        // cycling variants
        if (lower.includes('ride') || lower.includes('rode') || lower.includes('bike') || lower.includes('biked') || lower.includes('biking') || lower.includes('cycling') || lower.includes('cycle')) return 'cycling';
        if (lower.includes('hike')) return 'hiking';
        if (lower.includes('swim')) return 'swimming';
        if (lower.includes('row')) return 'rowing';
        if (lower.includes('ski')) return 'skiing';
        if (lower.includes('snowboard')) return 'snowboarding';
        if (lower.includes('skate')) return 'skating';
        if (lower.includes('elliptical')) return 'elliptical';
        if (lower.includes('yoga')) return 'yoga';
        return 'other';
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const lower = this.text.toLowerCase();
        const words = lower.split(/\s+/);

        function stripEdgePunct(s:string):string {
            let start = 0, end = s.length;
            while (start < end && "(\"'".indexOf(s[start]) !== -1) start++;
            while (end > start && ",.!?:;)\"'".indexOf(s[end-1]) !== -1) end--;
            return s.substring(start, end);
        }

        function toMiles(value:number, unit:string):number {
            if (unit.indexOf('km') === 0 || unit.indexOf('kilometer') === 0) {
                return value / 1.609;
            }
            return value;
        }

        for (let i = 0; i < words.length; i++) {
            let token = stripEdgePunct(words[i]);
            if (!token) continue;

            // Case 1: number followed by unit in next token
            const value = parseFloat(token);
            if (!Number.isNaN(value) && (token[0] >= '0' && token[0] <= '9')) {
                if (i + 1 < words.length) {
                    let unit = stripEdgePunct(words[i + 1]);
                    if (!unit) continue;
                    if (unit === 'mi' || unit === 'mile' || unit === 'miles' || unit === 'km' || unit === 'kilometer' || unit === 'kilometers') {
                        const miles = toMiles(value, unit);
                        return Math.round(miles * 100) / 100;
                    }
                }
            }

            // Case 2: number+unit combined (e.g., 5mi or 10km)
            if (token.endsWith('mi') || token.endsWith('km')) {
                let unit = token.endsWith('mi') ? 'mi' : 'km';
                let numPart = token.substring(0, token.length - unit.length);
                const v = parseFloat(numPart);
                if (!Number.isNaN(v)) {
                    const miles = toMiles(v, unit);
                    return Math.round(miles * 100) / 100;
                }
            }
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        // return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const activity = this.activityType;
        const urlMatch = this.text.match(/https?:\/\/\S+/);
        let linkedText = this.text;
        if (urlMatch) {
            const url = urlMatch[0];
            const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            linkedText = this.text.replace(url, anchor);
        }
        const html = `
            <tr>
                <th scope="row">${rowNumber}</th>
                <td>${activity}</td>
                <td>${linkedText}</td>
            </tr>
        `;
        return html;
    }
}