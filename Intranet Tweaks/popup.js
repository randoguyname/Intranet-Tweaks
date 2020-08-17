// Preset the checklist with all the stored values
function presetChecklist() {
    var list = document.getElementById('myUL');
    console.log(list.children);//temp
    chrome.storage.sync.get(["doFixPeriodNumbers", 
                            "doOrderZoomMeetings", 
                            "doAppendMusicTimetable", 
                            "doSeperateTimetableBreaks", 
                            "doHighlightMusicLessons", 
                            "highlightMusicLessonsColor", 
                            "highlightTimetableBreaks", 
                            "closeZoomSuccessTabs"], function (response) {
                                
        doFixPeriodNumbers = response.doFixPeriodNumbers;
        doSeperateTimetableBreaks = response.doSeperateTimetableBreaks;
        doOrderZoomMeetings = response.doOrderZoomMeetings;
        doAppendMusicTimetable = response.doAppendMusicTimetable;
        doHighlightMusicLessons = response.doHighlightMusicLessons;
        highlightMusicLessonsColor = response.highlightMusicLessonsColor;
        highlightTimetableBreaks = response.highlightTimetableBreaks;
        closeZoomSuccessTabs = response.closeZoomSuccessTabs;

        if (doFixPeriodNumbers) {document.querySelector("[intranetfeatureid=doFixPeriodNumbers]").classList.add("checked")};
        if (doOrderZoomMeetings) {document.querySelector("[intranetfeatureid=doOrderZoomMeetings]").classList.add("checked")};
        if (doAppendMusicTimetable) {document.querySelector("[intranetfeatureid=doAppendMusicTimetable]").classList.add("checked")};
        if (doSeperateTimetableBreaks) {document.querySelector("[intranetfeatureid=doSeperateTimetableBreaks]").classList.add("checked")};
        if (doHighlightMusicLessons) {document.querySelector("[intranetfeatureid=doHighlightMusicLessons]").classList.add("checked")};
        if (closeZoomSuccessTabs) {document.querySelector("[intranetfeatureid=closeZoomSuccessTabs]").classList.add("checked")};
        
        document.getElementById("highlightMusicLessonsColorIcon").style.backgroundColor = highlightMusicLessonsColor;
        document.getElementById("highlightMusicLessonsColor").value = highlightMusicLessonsColor;
        document.getElementById("highlightTimetableBreaksIcon").style.backgroundColor = highlightTimetableBreaks;
        document.getElementById("highlightTimetableBreaks").value = highlightTimetableBreaks;
    })

}

// Add a "checked" symbol when clicking on a list item and change chrome storage
function checklistChecked() {
    var list = document.getElementById('myUL');
    list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
        featureId = ev.target.attributes["intranetfeatureid"].value
        isEnabled = ev.target.classList.contains("checked")
        chrome.storage.sync.set({[featureId]:isEnabled})
        if (featureId == "closeZoomSuccessTabs" && isEnabled) {
            chrome.runtime.sendMessage(
                {
                    contentScriptQuery: "purgeZoomTabs",
                }
            )
        }
        }
    }, false);
}

function colorSelect(iconId, inputId) {
    document.getElementById(iconId).addEventListener("click", function (ev) {
        document.getElementById(inputId).click();
    }, false)

    document.getElementById(inputId).addEventListener("change", function (ev) {
        color = document.getElementById(inputId).value
        document.getElementById(iconId).style.backgroundColor = color;
        chrome.storage.sync.set({
            [inputId]: color,
        });
    })
}

function onLoad() {
    colorSelect("highlightMusicLessonsColorIcon", "highlightMusicLessonsColor")
    colorSelect("highlightTimetableBreaksIcon", "highlightTimetableBreaks")
    presetChecklist();
    checklistChecked();
}

window.onload = onLoad;