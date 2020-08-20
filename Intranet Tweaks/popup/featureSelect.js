// Variables

var allFeatureIds = [
    "doFixPeriodNumbers", 
    "doOrderZoomMeetings", 
    "doAppendMusicTimetable", 
    "doSeperateTimetableBreaks", 
    "doHighlightMusicLessons", 
    "closeZoomSuccessTabs",
    "removeDeprecated",]

var highlightColors = [
    "highlightMusicLessonsColor", 
    "highlightTimetableBreaksColor"
]

// Preset the checklist with all the stored values
function presetChecklist() {
    var list = document.getElementById('myUL');
    chrome.storage.sync.get(allFeatureIds.concat(highlightColors), function (response) {
                          
        for (featureId of allFeatureIds) {
            if (response[featureId]) {document.querySelector(`[intranetfeatureid=${featureId}]`).classList.add("checked")};
        }

        for (highlightColor of highlightColors) {
            document.getElementById(`${highlightColor}Icon`).style.backgroundColor = response[highlightColor];
            document.getElementById(highlightColor).value = response[highlightColor];
        }
    })

}

// Add a "checked" symbol when clicking on a list item and change chrome storage
function checklistChecked() {
    var list = document.getElementById('myUL');
    list.addEventListener('click', function(ev) {
        if (ev.target.attributes['intranetfeatureid']) {
            item = document.querySelector(`li[intranetfeatureid=${ev.target.attributes.intranetfeatureid.value}]`)
            item.classList.toggle('checked');
            featureId = item.attributes["intranetfeatureid"].value
            isEnabled = item.classList.contains("checked")
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
    colorSelect("highlightTimetableBreaksColorIcon", "highlightTimetableBreaksColor")
    presetChecklist();
    checklistChecked();
}

window.onload = onLoad;