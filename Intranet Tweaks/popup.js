// Preset the checklist with all the stored values
function presetChecklist() {
    var list = document.getElementById('myUL');
    console.log(list.children);//temp
    chrome.storage.local.get(["doFixPeriodNumbers", "doOrderZoomMeetings", "doAppendMusicTimetable"], function (response) {
        doFixPeriodNumbers = response.doFixPeriodNumbers;
        doOrderZoomMeetings = response.doOrderZoomMeetings;
        doAppendMusicTimetable = response.doAppendMusicTimetable;
        if (doFixPeriodNumbers) {document.querySelector("[intranetfeatureid=doFixPeriodNumbers]").classList.add("checked")};
        if (doOrderZoomMeetings) {document.querySelector("[intranetfeatureid=doOrderZoomMeetings]").classList.add("checked")};
        if (doAppendMusicTimetable) {document.querySelector("[intranetfeatureid=doAppendMusicTimetable]").classList.add("checked")};
    })

}

// Add a "checked" symbol when clicking on a list item and change chrome storage
function checklistChecked() {
    var list = document.getElementById('myUL');
    list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
        featureId = ev.target.attributes["intranetfeatureid"].value
        chrome.storage.local.set({[featureId]:ev.target.classList.contains("checked")})
        }
    }, false);
}

function onLoad() {
    presetChecklist();
    checklistChecked();
}

window.onload = onLoad;