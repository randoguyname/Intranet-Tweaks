chrome.runtime.onInstalled.addListener( // When the shortcut is first run
    function (details) {
        chrome.storage.local.set({"doFixPeriodNumbers":true, // Set presets for settings
                                  "doSeperateTimetableBreaks":true,
                                  "doOrderZoomMeetings":true,
                                  "doAppendMusicTimetable":false}) 
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