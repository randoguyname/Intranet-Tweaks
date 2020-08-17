// Variables

var allStorage = [
    "doFixPeriodNumbers", 
    "doSeperateTimetableBreaks", 
    "doOrderZoomMeetings", 
    "doAppendMusicTimetable", 
    "doHighlightMusicLessons", 
    "highlightMusicLessonsColor",
    "highlightTimetableBreaksColor",
    "closeZoomSuccessTabs"
]

var completeZoomMeetingLinkPatterns = [
    /https:\/\/cgsvic.zoom.us\/j\/\d*.*#success/g, 
    /https:\/\/cgsvic.zoom.us\/postattendee.*/g
]

// Functions

function purgeTabs(patterns, matchMode, dependsOnStorage) { // Remove all tabs with a url pattern (regex) 
    // Modes include (or, xor, nor, xnor, and, nand)
    chrome.tabs.query({}, function (tabs){
        chrome.storage.sync.get([dependsOnStorage], function (response) {
            if (!response[dependsOnStorage]) {
                return;
            }

            for (tab of tabs) {
                matches = [];
                isMatch = false;
                for (pattern of patterns) {
                    if (pattern.test(tab.url)) {
                        matches.push(1);
                    }
                    else {
                        matches.push(0);
                    }
                }
                switch (matchMode) {
                    case "or":
                        isMatch = matches.some((match) => match) // Simulates OR gate
                        break;
                    case "xor":
                        isMatch = matches.some((match) => match) && !matches.every((match) => match) // Simulates XOR gate
                        break;
                    case "nor":
                        isMatch = !matches.some((match) => match) // Simulates NOR gate
                        break;
                    case "xnor":
                        isMatch = matches.every( (val, i, arr) => val === arr[0] ) // Simulates NOR gate
                        break;
                    case "and":
                        isMatch = matches.every((match) => match) // Simulates AND gate
                        break;
                    case "nand":
                        isMatch = !matches.every((match) => match); // Simulates NAND gate
                        break;
                }
                if (isMatch) { // check if tab url matched patterns
                    chrome.tabs.remove(tab.id, function() { // then remove it
                        if (chrome.runtime.lastError) { } // if an error occurs, do nothing
                    }); 
                    
                }
            }
        });
    });
    return true;
}

// Listeners

chrome.runtime.onInstalled.addListener( // When the extension is first run
    function (details) {
        chrome.storage.sync.get(allStorage, function (response) {

            chrome.storage.sync.set({"doFixPeriodNumbers": (((doFixPeriodNumbers = response.doFixPeriodNumbers) != undefined) ? doFixPeriodNumbers : true), // Set presets for settings
                                  "doSeperateTimetableBreaks": (((doSeperateTimetableBreaks = response.doSeperateTimetableBreaks) != undefined) ? doSeperateTimetableBreaks : true),
                                  "doOrderZoomMeetings": (((doOrderZoomMeetings = response.doOrderZoomMeetings) != undefined) ? doOrderZoomMeetings : true),
                                  "doAppendMusicTimetable": (((doAppendMusicTimetable = response.doAppendMusicTimetable) != undefined) ? doAppendMusicTimetable : false),
                                  "doHighlightMusicLessons": (((doHighlightMusicLessons = response.doHighlightMusicLessons) != undefined) ? doHighlightMusicLessons : true),
                                  "highlightMusicLessonsColor": (((highlightMusicLessonsColor = response.highlightMusicLessonsColor) != undefined) ? highlightMusicLessonsColor : "#f4d776"),
                                  "highlightTimetableBreaksColor": (((highlightTimetableBreaksColor = response.highlightTimetableBreaksColor) != undefined) ? highlightTimetableBreaksColor : "#ddeedd"),
                                  "closeZoomSuccessTabs": (((closeZoomSuccessTabs = response.closeZoomSuccessTabs) != undefined) ? closeZoomSuccessTabs : true)});
            if (response.closeZoomSuccessTabs) {
                chrome.tabs.onUpdated.addListener( // When tabs update
                    function () {
                        purgeTabs(completeZoomMeetingLinkPatterns, "or", "closeZoomSuccessTabs"); 
                        // Remove all tabs that fit *any* of the defined "completeZoomMeetingLinkPatterns" regexes, 
                        // if storage value "closeZoomSuccessTabs" evaluates to true
                    }              

                )
            } 
        })
        
    }
)

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.contentScriptQuery == "queryMeetings") {  // When triggered to get zoom meetings
        var url = "https://portal.cgs.vic.edu.au/Calendar/Zoom/scheduled.php?u=" +
                encodeURIComponent(parseInt(request.userId)); // create URL
        fetch(url) // get URL response
            .then(response => response.text())
            .then(text => sendResponse(text)) // send it back to the contentScript
        return true;  // Will respond asynchronously.
      }
    });

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.contentScriptQuery == "queryTimetableMusic") { // When triggered to get Music Timetable
        var url = "https://intranet.cgs.vic.edu.au/CurriculumPortal/?p=14"; // create URL
        fetch(url) // get URL response
            .then(response => response.text()) 
            .then(text => sendResponse(text)) // send it back to the contentScript
        return true;  // Will respond asynchronously.
        }
    });

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "purgeZoomTabs") {  // When triggered to remove tabs
            purgeTabs(completeZoomMeetingLinkPatterns, "or", "closeZoomSuccessTabs");
            return true;  // Will respond asynchronously.
        }
    });