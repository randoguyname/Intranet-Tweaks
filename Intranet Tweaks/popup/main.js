// Preset the checklist with all the stored values
function presetChecklist() {
    var list = document.getElementById('myUL');
    console.log(list.children);//temp
    chrome.storage.sync.get(["doFixPeriodNumbers", "doOrderZoomMeetings", "doAppendMusicTimetable", "doSeperateTimetableBreaks", "doHighlightMusicLessons"], function (response) {
        doFixPeriodNumbers = response.doFixPeriodNumbers;
        doSeperateTimetableBreaks = response.doSeperateTimetableBreaks;
        doOrderZoomMeetings = response.doOrderZoomMeetings;
        doAppendMusicTimetable = response.doAppendMusicTimetable;
        doHighlightMusicLessons = response.doHighlightMusicLessons;
        if (doFixPeriodNumbers) {document.querySelector("[intranetfeatureid=doFixPeriodNumbers]").classList.add("checked")};
        if (doOrderZoomMeetings) {document.querySelector("[intranetfeatureid=doOrderZoomMeetings]").classList.add("checked")};
        if (doAppendMusicTimetable) {document.querySelector("[intranetfeatureid=doAppendMusicTimetable]").classList.add("checked")};
        if (doSeperateTimetableBreaks) {document.querySelector("[intranetfeatureid=doSeperateTimetableBreaks]").classList.add("checked")};
        if (doHighlightMusicLessons) {document.querySelector("[intranetfeatureid=doHighlightMusicLessons]").classList.add("checked")};
    })

}

// Add a "checked" symbol when clicking on a list item and change chrome storage
function checklistChecked() {
    var list = document.getElementById('myUL');
    list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
        featureId = ev.target.attributes["intranetfeatureid"].value
        chrome.storage.sync.set({[featureId]:ev.target.classList.contains("checked")})
        }
    }, false);
}

<<<<<<< Updated upstream:Intranet Tweaks/popup.js
=======
function colorSelect(iconId, inputId) {
    if (!document.getElementById(inputId) || !document.getElementById(iconId)) {
        return; // Error catch
    }
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

>>>>>>> Stashed changes:Intranet Tweaks/popup/main.js
function onLoad() {
    presetChecklist();
    checklistChecked();
}

window.onload = onLoad;