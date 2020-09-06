// Variables

var allFeaturesSync = [
    "doFixPeriodNumbers", 
    "doSeperateTimetableBreaks", 
    "doOrderZoomMeetings", 
    "doAppendMusicTimetable", 
    "doHighlightMusicLessons",
    "removeDeprecated"
]

var allFeaturesLocal = [
    "changeIntranetBackground"
]
var highlightColors = [
    "highlightMusicLessonsColor", 
    "highlightTimetableBreaksColor"
]

// Functions

function getMinutesFromTime(time) {
    if ((time.endsWith("AM") && !time.startsWith("12")) 
            || (time.startsWith("12") && time.endsWith("PM"))) { // if the time is AM (or 12 PM)
        time = time.slice(0,-3) // Remove AM or PM, leaving "11:05"
        time = (parseInt(time) * 60) + parseInt(time.slice(3)) // Calculate number of minutes since the beginning of the day
    }

    else if ((time.endsWith("PM") && !time.startsWith("12")) 
                || (time.startsWith("12") && time.endsWith("AM"))) { // if time is PM (or 12 AM)
        time = time.slice(0,-3) // Remove AM or PM, leaving "11:05"
        time = ((parseInt(time)+12) * 60) + parseInt(time.slice(3)) // Calculate number of minutes since the beginning of the day
    }
    return time;
}

function sortTable(table) { // Sort table by time
    rows = [].slice.call(table.rows,1); // Get all rows apart from the top row, which contains no meetings
    toprow = table.rows[0]; // Save this for later
    rows1 = []; // Initialise arrays for later
    rows2 = [];

    for (row of rows) { // iterate all meetings
        time = row.cells[0].innerText; // Store the time as text, eg. "11:05 AM"
        time = getMinutesFromTime(time); // Calculate minutes since beginning of day (00:00)
        rows1.push(time); // Add that amount to an array
    }
    rows12 = rows1.slice(0).sort() // Make a copy of that arry that is in order from smallest to largest
    for (row of rows12) { // iterate the sortetd array
        rows2.push(rows[rows1.indexOf(row)]) // Find the index of the iterated value in the original array, then correlate that index to the collection of rows
    }
    table.tBodies[0].innerHTML = ''; // Clear table
    table.tBodies[0].appendChild(toprow); // Add top row to the top
    for (row of rows2) {
        table.tBodies[0].appendChild(row); // Add next row to the bottom
    }
}

function parseDayIndex(text) {
    if (text.length < 5) {
        return;
    }
    days = { // Turn days to numbers
        "monday":    1,
        "tuesday":   2,
        "wednesday": 3,
        "thursday":  4,
        "friday":    5,
    }
    if (days[(dayName = text.split(',')[0].toLowerCase())] != undefined) { // Check if day is in days
        return days[dayName]; // Return day index
    }
}

function parsePeriodIndex(text, doSeperateTimetableBreaks=false) {
    periodMapsTimetableBreaks = { // If timetable breaks is on, use this to calculate period indexes
        1: 1,
        2: 2,
        3: 3, // Recess
        4: 5,
        5: 6, // Lunch
        6: 8,
        7: 9,
        8: 10
    }
    if (text.length < 3) {
        return;
    }
    if (groups = (/P(\d).*/g).exec(text)) { // Use regex to get period of lesson
        // Return Period Index, put through mapping if necassary
        if (!doSeperateTimetableBreaks) return groups.flat().pop(); else return periodMapsTimetableBreaks[groups.pop()]; 
    }
    else if (doSeperateTimetableBreaks) {
        if (text.startsWith("Recess")) {
            return [4, 0];
        }
        else if (text.startsWith("Lunch")) {
            return [7, 0];
        }
    }
    return false
}

function highlightMusicCells(timetable, musicLessons, backgroundColor) {
    musicLessonIds = ["mus", "mub", "mut"] // Possible text "id"s of lessons that show up on both the regular and music timetable

    for (musicLesson of musicLessons) { // Iterate all music lessons
        console.log(musicLesson)
        timetableLessonCell = timetable.rows[musicLesson[0]].cells[musicLesson[1]]; // Cell for lesson marked on timetable
        timetableLesson = timetableLessonCell.innerText.split('-')[0] // Gets the text "id" for the lesson

        if (!musicLessonIds.includes(timetableLesson.toLowerCase())) { // If music lesson is not marked on regular timetable
            timetableLessonCell.style.backgroundColor = backgroundColor // Change background color
        }
    }
}

function waitForElement(doc, querySelector, timeout=0){
    const startTime = new Date().getTime();
    return new Promise((resolve, reject)=>{
        const timer = setInterval(()=>{
            const now = new Date().getTime();
            if (doc.querySelector(querySelector)){
                clearInterval(timer);
                resolve();
            }
            else if (timeout && now - startTime >= timeout){
                clearInterval(timer);
                reject();
            }
        }, 100);
    });
}

// Features

function fixPeriodNumbers() {
    rows = document.getElementsByTagName("table")[3].tBodies[0].rows // Gets all rows in the timetable
    arr = [].slice.call(rows, 1); // Removes the "Pastoral" period, which is not numbered

    for (var row of arr) {
        number = row.cells[0]; // Gets the first cell, which contains the period number
        number.innerText = parseInt(number.innerText)-1 // Replaces the text with the number minus one
    }
}

function seperateTimetableBreaks(highlightTimetableBreaksColor) {
    tBody = document.getElementsByTagName("table")[3].tBodies[0] // Gets the timetable
    
    // Break for Recess
    recessBreak = tBody.insertRow(4);  // Insert row
    recessBreak.style.backgroundColor = highlightTimetableBreaksColor; // Highlight Background
    recessCell = recessBreak.insertCell(0); // Make cell to say "Recess"
    recessCell.innerText = "Recess"
    recessCell.style.textAlign = "center" // Align text to center
    recessCell.colSpan = 5 // Fill all five columns
    recessLeftCell = recessBreak.insertCell(0); // move to the right
    recessLeftCell.style.borderRight = "none"; // Get rid of boundry between two cells
    recessCell.style.borderLeft = "none";

    // Break for Lunch
    lunchBreak = tBody.insertRow(7);  // Insert row
    lunchBreak.style.backgroundColor = highlightTimetableBreaksColor; // Highlight Background
    lunchCell = lunchBreak.insertCell(0); // Make cell to say "Lunch"
    lunchCell.innerText = "Lunch"
    lunchCell.style.textAlign = "center" // Align text to center
    lunchCell.colSpan = 5 // Fill all five columns
    lunchLeftCell = lunchBreak.insertCell(0); // move to the right
    lunchLeftCell.style.borderRight = "none"; // Get rid of boundry between two cells
    lunchCell.style.borderLeft = "none";

}

function highlightMusicLessons() { 
    chrome.runtime.sendMessage(
        {contentScriptQuery: "queryTimetableMusic"},
        function (html) {
            chrome.storage.sync.get(['doSeperateTimetableBreaks', 'highlightMusicLessonsColor'], function (response) {
                parser = new DOMParser(); // Initialise a DOM parser
                musicDocument = parser.parseFromString(html, "text/html"); // Turn HTML text into DOM Document

                musicLessonsTable = musicDocument.getElementsByTagName("table")[2].rows[1].cells[0].children[1]; // Locate the main part of the music timetable, that contains the lesson times

                parsingDay = 0;
                musicLessons = [];
                for (lesson of stringArray1dFromTable(musicLessonsTable, true, "My Timetable")) {
                    if ((day = parseDayIndex(lesson)) != undefined) { // if a day can be found
                        parsingDay = day;
                    }

                    else if ((period = parsePeriodIndex(lesson, response.doSeperateTimetableBreaks))) { // if a period number can be found
                        musicLessons.push([period, parsingDay])
                    }
                }
                console.log(musicLessons)
                
                timetable = document.getElementsByTagName("table")[3].tBodies[0] // Get the timetable
                
                highlightMusicCells(timetable, musicLessons, response.highlightMusicLessonsColor)
            })
        }
    )
}

function orderZoomMeetings() {
    iframe_parent = document.getElementById("holds-the-iframe"); // Get the parent of the iframe
    iframe = iframe_parent.children[0]; // Get the iframe
    new_iframe = document.createElement("iframe"); // Create a replacement iframe
    backup_iframe = document.createElement("iframe") // incase frame fails to load.

    userId = /scheduled\.php\?u=(\d+)/g.exec(iframe.src)[1]; // Extract the "userId" from the iframes src url

    new_iframe.height = iframe.height; // Style the iframe
    new_iframe.width = iframe.width;
    new_iframe.frameBorder = iframe.frameBorder;

    backup_iframe.height = iframe.height; // Style the backup
    backup_iframe.width = iframe.width;
    backup_iframe.frameBorder = iframe.frameBorder;

    backup_iframe.src = iframe.src // Set source
    backup_iframe.hidden = true // hide

    iframe_parent.removeChild(iframe); // Delete the existing iframe and append the new one and the hidden backup
    iframe_parent.appendChild(new_iframe);
    iframe_parent.appendChild(backup_iframe);

    chrome.runtime.sendMessage(
        {contentScriptQuery: "queryMeetings", userId: userId}, // Send message to background script, 
                                                               // tell it to retrieve the url for the iframe
        function (html){
            if (html == undefined) { // An error that sometimes occurs
                backup_iframe.hidden = false; // Resort to old iframe
                iframe_parent.removeChild(new_iframe);
                console.warn("Faliure to sort Zoom meetings, resorting to default Zoom meetings") // send a warning to the console
                return;
            }
            new_iframe.contentDocument.write(html); // Write the html to out new iframe
            iframe_parent.style.backgroundImage = "none"; // Hide the loading gif

            table = new_iframe.contentDocument.getElementsByTagName("table")[0]; // Get the table of meetings
            n = 0;
            waitForElement(new_iframe.contentDocument, "table", 1000) // wait to see if table loads
                .then(function () { // when loaded
                    table = new_iframe.contentDocument.getElementsByTagName("table")[0];
                    sortTable(table); // Sort the table
                }).catch(function () { // if didn't load in 1 seconds
                    backup_iframe.hidden = false; // Resort to old iframe
                    iframe_parent.removeChild(new_iframe);
                    console.warn("Zoom meetings did not load within one second, resorting to default iframe") // send a warning to the console
                })
            

        }
    );
}

function appendMusicTimetable() {
    chrome.runtime.sendMessage(
        {contentScriptQuery: "queryTimetableMusic"},
        html => {
            parser = new DOMParser(); // Initialise a DOM parser
            musicDocument = parser.parseFromString(html, "text/html"); // Turn HTML text into DOM Document

            table = musicDocument.getElementsByTagName("table")[2]; // Locate the main part of the music timetable

            table.width="100%";                                 // Styling
            table.rows[1].cells[0].children[1].align="left";

            spacer = table.insertRow(0); // Add vertical spacer between timtable and music timetable
            spacer.style.height = "5px";

            row = document.getElementsByTagName("table")[1].insertRow(1); // Add a space below the timetable for our music timetable

            paddingCell = row.insertCell(0); // add a cell to pad

            timetableCell = row.insertCell(1); // Cell to contain the timetable
            timetableCell.width = "100%"; // Make cell full width

            timetableDiv = document.createElement("div"); // Create div to hold music timetable
            timetableDiv.id = "musicTimeTable"; // Give it an id

            timetableDiv.style.width = "95%";     // Arrange so it is in line with the timetable
            timetableDiv.style.marginLeft = "5%";

            timetableDiv.appendChild(table);        // Add to document
            timetableCell.appendChild(timetableDiv);
        }
    )
}

function removeDeprecated() { // Removes Unused things in the student intranet
    // Timetable
    timetable = document.getElementsByTagName("table")[3]

    timetable.tHead.deleteRow(0)
    for (day of timetable.tHead.querySelectorAll("a")) {
        parent = day.parentNode;
        parent.innerText = day.innerText
    }
}

function changeIntranetBackground(base64URL) {
    document.documentElement.style.backgroundImage = `url(${base64URL})`;
}

// Runtime

chrome.storage.sync.get(allFeaturesSync.concat(highlightColors), function (response) {
    if (response.doFixPeriodNumbers) {
        fixPeriodNumbers();
    }

    if (response.doOrderZoomMeetings) {
        orderZoomMeetings();
    }

    if (response.doAppendMusicTimetable) {
        appendMusicTimetable();
    }
    if (response.doSeperateTimetableBreaks) {
        seperateTimetableBreaks(response.highlightTimetableBreaksColor);
    }

    if (response.doHighlightMusicLessons) {
        highlightMusicLessons();
    }

    if (response.removeDeprecated) {
        removeDeprecated();
    }
})

// Local things

chrome.storage.local.get(allFeaturesLocal, function (storage) {
    if (storage.changeIntranetBackground[0]) {
        changeIntranetBackground(storage.changeIntranetBackground[1])
    }
})