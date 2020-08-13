chrome.runtime.onInstalled.addListener( // When the shortcut is first run
    function (details) {
        chrome.storage.sync.get(["doFixPeriodNumbers", 
                                "doSeperateTimetableBreaks", 
                                "doOrderZoomMeetings", 
                                "doAppendMusicTimetable", 
                                "doHighlightMusicLessons", 
<<<<<<< Updated upstream
                                "highlightMusicLessonsColor"], function (response) {
=======
                                "highlightMusicLessonsColor",
                                "highlightTimetableBreaks",
                                "musicTeachers"], function (response) {
>>>>>>> Stashed changes

            chrome.storage.sync.set({"doFixPeriodNumbers": (((doFixPeriodNumbers = response.doFixPeriodNumbers) != undefined) ? doFixPeriodNumbers : true), // Set presets for settings
                                  "doSeperateTimetableBreaks": (((doSeperateTimetableBreaks = response.doSeperateTimetableBreaks) != undefined) ? doSeperateTimetableBreaks : true),
                                  "doOrderZoomMeetings": (((doOrderZoomMeetings = response.doOrderZoomMeetings) != undefined) ? doOrderZoomMeetings : true),
                                  "doAppendMusicTimetable": (((doAppendMusicTimetable = response.doAppendMusicTimetable) != undefined) ? doAppendMusicTimetable : false),
                                  "doHighlightMusicLessons": (((doHighlightMusicLessons = response.doHighlightMusicLessons) != undefined) ? doHighlightMusicLessons : true),
<<<<<<< Updated upstream
                                  "highlightMusicLessonsColor": (((highlightMusicLessonsColor = response.highlightMusicLessonsColor) != undefined) ? highlightMusicLessonsColor : "#efc537ad")}) 
=======
                                  "highlightMusicLessonsColor": (((highlightMusicLessonsColor = response.highlightMusicLessonsColor) != undefined) ? highlightMusicLessonsColor : "#f4d776"),
                                  "highlightTimetableBreaks": (((highlightTimetableBreaks = response.highlightTimetableBreaks) != undefined) ? highlightTimetableBreaks : "#ddeedd")
                                }) 
            
            chrome.runtime.sendMessage(
                {contentScriptQuery: "queryTimetableMusic"},
                function (html) {
                    for (row of musicDocument.getElementsByTagName("table")[2].rows[1].cells[0].children[1].rows) {
                        
                    }
                    chrome.storage.sync.set({
                        "musicTeachers": ((musicTeachers = response.musicTeachers) != undefined) ? musicTeachers : teachers
                    })
                }
            )
>>>>>>> Stashed changes
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