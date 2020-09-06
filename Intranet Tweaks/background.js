// Variables

var syncStorageDefaults = {
    "doFixPeriodNumbers": true, 
    "doSeperateTimetableBreaks": true, 
    "doOrderZoomMeetings": true, 
    "doAppendMusicTimetable": false, 
    "doHighlightMusicLessons": true, 
    "highlightMusicLessonsColor": "#f4d776",
    "highlightTimetableBreaksColor": "#ddeedd",
    "closeZoomSuccessTabs": true,
    "removeDeprecated": true,
    "doAutoRefresh": true
}

var pendingRefresh = []

var localStorageDefaults = { // Rely on these being two-element arrays, in the format of [isEnabled, data]
    "changeIntranetBackground": [false, null]
}

var completeZoomMeetingLinkPatterns = [
    /https:\/\/cgsvic.zoom.us\/j\/\d*.*#success/g, 
    /https:\/\/cgsvic.zoom.us\/postattendee.*/g,
    /https:\/\/cgsvic.zoom.us\/.*status=success.*/g
]

var intranetURLPatterns = [
    /https:\/\/intranet.cgs.vic.edu.au\/Portal\/.*/g, 
    /https:\/\/intranet.cgs.vic.edu.au\/CurriculumPortal\/.*/g
]

// Functions

function isURLMatch(patterns, matchMode, url) {
    matches = []
    for (pattern of patterns) {
        if (pattern.test(url)) {
            matches.push(1);
        }
        else {
            matches.push(0);
        }
    }
    switch (matchMode) {
        case "or":
            return matches.some((match) => match) // Simulates OR gate
            break;
        case "xor":
            return matches.some((match) => match) && !matches.every((match) => match) // Simulates XOR gate
            break;
        case "nor":
            return !matches.some((match) => match) // Simulates NOR gate
            break;
        case "xnor":
            return matches.every( (val, i, arr) => val === arr[0] ) // Simulates NOR gate
            break;
        case "and":
            return matches.every((match) => match) // Simulates AND gate
            break;
        case "nand":
            return !matches.every((match) => match); // Simulates NAND gate
            break;
    }
    return false;

}

function iterTabs(patterns, matchMode, dependsOnStorage, callback) { // Calls back for all tabs with a url pattern (regex) 
    // Modes include (or, xor, nor, xnor, and, nand)
    chrome.tabs.query({}, function (tabs){
        chrome.storage.sync.get([dependsOnStorage], function (response) {
            if (!response[dependsOnStorage]) {
                return;
            }

            for (tab of tabs) {
                if (isURLMatch(patterns, matchMode, tab.url)) { // check if tab url matched patterns
                    callback(tab) // run callback
                    
                }
            }
        });
    });
    return true;
}

// Listeners

chrome.runtime.onInstalled.addListener( // When the extension is first run
    function (details) {
        // Set presets for enabled features, sync and local
        chrome.storage.sync.get(Object.keys(syncStorageDefaults), function (response) {
            storage = {}
            for ([storageKey, def] of Object.entries(syncStorageDefaults)) {
                storage[storageKey] = (((value = response[storageKey]) != undefined) ? value : def)
            }
            chrome.storage.sync.set(storage)
        })
        chrome.storage.local.get(Object.keys(localStorageDefaults), function (response) {
            storage = {}
            for ([storageKey, def] of Object.entries(localStorageDefaults)) {
                storage[storageKey] = (((value = response[storageKey]) != undefined) ? value : def)
            }
            chrome.storage.local.set(storage)
        })
        setInterval( function () { // Every 100 ms (more consistent results than event listeners)
            iterTabs(completeZoomMeetingLinkPatterns, "or", "closeZoomSuccessTabs", function (tab) { // for all tabs that are complete zoom meetings
                chrome.tabs.remove(tab.id, function() { // remove them
                    if (chrome.runtime.lastError) { } // if an error occurs, do nothing
                });
            })
        }, 100)

        setInterval( function () { // Every 5 minutes
            iterTabs(intranetURLPatterns, "or", "doAutoRefreshe", function (tab) { // for all tabs that are the intranet
                chrome.tabs.update(tab.id, {url: tab.url}); // refresh the tab
                console.log("refresh")
            })
        }, 300000)
    }
)

chrome.runtime.onStartup.addListener( // When chrome opens
    function () {
        // Add timers
        setInterval( function () { // Every 100 ms (more consistent results than event listeners)
            iterTabs(completeZoomMeetingLinkPatterns, "or", "closeZoomSuccessTabs", function (tab) { // for all tabs that are complete zoom meetings
                chrome.tabs.remove(tab.id, function() { // remove them
                    if (chrome.runtime.lastError) { } // if an error occurs, do nothing
                });
            })
        }, 100)

        setInterval( function () { // Every 5 minutes
            iterTabs(intranetURLPatterns, "or", "doAutoRefreshe", function (tab) { // for all tabs that are the intranet
                chrome.tabs.update(tab.id, {url: tab.url}); // refresh the tab
            })
        }, 300000)
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
            .then(response => sendResponse(response.text())) // send it back to the contentScript
        return true;  // Will respond asynchronously.
        }
    });

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.contentScriptQuery == "purgeZoomTabs") {  // When triggered to remove tabs
            iterTabs(completeZoomMeetingLinkPatterns, "or", "closeZoomSuccessTabs", function (tab) { // for all tabs that are complete zoom meetings
                chrome.tabs.remove(tab.id, function() { // remove them
                    if (chrome.runtime.lastError) { } // if an error occurs, do nothing
                });
            })
            return true;  // Will respond asynchronously.
        }
    });