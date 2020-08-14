// Functions

function catchZoomSuccess (tabId, changeInfo) {
    if (changeInfo.url != undefined) {
        if (changeInfo.url.endsWith("#success") && changeInfo.url.startsWith("https://cgsvic.zoom.us/j/")) { // if tab is successful zoom launch
            chrome.storage.sync.get(['closeZoomSuccessTabs'], function (response) {
                if (response.closeZoomSuccessTabs) {
                    chrome.tabs.remove(tabId, function() { }); // remove it
                }
            })
            
        }
    }
}

// Listeners

chrome.runtime.onInstalled.addListener( // When the extension is first run
    function (details) {
        chrome.storage.sync.get(["doFixPeriodNumbers", 
                                "doSeperateTimetableBreaks", 
                                "doOrderZoomMeetings", 
                                "doAppendMusicTimetable", 
                                "doHighlightMusicLessons", 
                                "highlightMusicLessonsColor",
                                "highlightTimetableBreaks",
                                "closeZoomSuccessTabs"], 
                                
                                function (response) {

            chrome.storage.sync.set({"doFixPeriodNumbers": (((doFixPeriodNumbers = response.doFixPeriodNumbers) != undefined) ? doFixPeriodNumbers : true), // Set presets for settings
                                  "doSeperateTimetableBreaks": (((doSeperateTimetableBreaks = response.doSeperateTimetableBreaks) != undefined) ? doSeperateTimetableBreaks : true),
                                  "doOrderZoomMeetings": (((doOrderZoomMeetings = response.doOrderZoomMeetings) != undefined) ? doOrderZoomMeetings : true),
                                  "doAppendMusicTimetable": (((doAppendMusicTimetable = response.doAppendMusicTimetable) != undefined) ? doAppendMusicTimetable : false),
                                  "doHighlightMusicLessons": (((doHighlightMusicLessons = response.doHighlightMusicLessons) != undefined) ? doHighlightMusicLessons : true),
                                  "highlightMusicLessonsColor": (((highlightMusicLessonsColor = response.highlightMusicLessonsColor) != undefined) ? highlightMusicLessonsColor : "#f4d776"),
                                  "highlightTimetableBreaks": (((highlightTimetableBreaks = response.highlightTimetableBreaks) != undefined) ? highlightTimetableBreaks : "#ddeedd"),
                                  "closeZoomSuccessTabs": (((closeZoomSuccessTabs = response.closeZoomSuccessTabs) != undefined) ? closeZoomSuccessTabs : true)});
            if (response.closeZoomSuccessTabs) {
                chrome.tabs.onUpdated.addListener( // When tabs update
                    catchZoomSuccess    
                )
            } 
                                }
                            )
        
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
            chrome.tabs.query({}, function (tabs){
                for (tab of tabs) {
                    if (/https:\/\/cgsvic.zoom.us\/j\/\d*#success/g.test(tab.url)) { 
                        chrome.tabs.remove(tab.id, function () { }); 
                    }
                }
            });
            return true;  // Will respond asynchronously.
        }
    });