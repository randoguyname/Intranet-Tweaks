// Necessary Functions

function getMinutesFromTime() {
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
    if (text.length < 3) {
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
    else if (text.startswith("Lunch")) {
        return 1;
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
        if (text.startswith("Lunch")) {
            return 4;
        }
        else if (text.startswith("Lunch")) {
            return 7;
        }
    }
}

function highlightMusicCells(timetable, musicLessons, backgroundColor) {
    musicLessonIds = ["mus", "mub", "mut"] // Possible text "id"s of lessons that show up on both the regular and music timetable

    for (musicLesson of musicLessons) { // Iterate all music lessons
        timetableLessonCell = timetable.rows[musicLesson[0]].cells[musicLesson[1]]; // Cell for lesson marked on timetable
        timetableLesson = timetableLessonCell.innerText.split('-')[0] // Gets the text "id" for the lesson

        if (!musicLessonIds.includes(timetableLesson.toLowerCase())) { // If music lesson is not marked on regular timetable
            timetableLessonCell.style.backgroundColor = backgroundColor // Change background color
        }
    }
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

function seperateTimetableBreaks(highlightTimetableBreaks) {
    tBody = document.getElementsByTagName("table")[3].tBodies[0] // Gets the timetable
    
    // Break for Recess
    recessBreak = tBody.insertRow(4);  // Insert row
    recessBreak.style.backgroundColor = highlightTimetableBreaks; // Highlight Background
    recessCell = recessBreak.insertCell(0); // Make cell to say "Recess"
    recessCell.innerText = "Recess"
    recessCell.style.textAlign = "center" // Align text to center
    recessCell.colSpan = 5 // Fill all five columns
    recessLeftCell = recessBreak.insertCell(0); // move to the right
    recessLeftCell.style.borderRight = "none"; // Get rid of boundry between two cells
    recessCell.style.borderLeft = "none";

    // Break for Lunch
    lunchBreak = tBody.insertRow(7);  // Insert row
    lunchBreak.style.backgroundColor = highlightTimetableBreaks; // Highlight Background
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

                musicLessonsRows = musicDocument.getElementsByTagName("table")[2].rows[1].cells[0].children[1].rows; // Locate the main part of the music timetable, that contains the lesson times

                musicLessons = []; // All music lessons on your music timetable
                atLessons = false; // If at the point in the document when lessons occur
                parsingDay = 1; // The day of the lesson, ie. 1=Monday, 2=Tuesday, etc.
                for (lesson of musicLessonsRows) {
                    if (atLessons) { // If passed point of music lessons
                        if (dayIndex = parseDayIndex(lesson.innerText)) {
                            parsingDay = dayIndex
                        }
                        else if (periodIndex = parsePeriodIndex(lesson.innerText, response.doSeperateTimetableBreaks)) {
                            musicLessons.push([periodIndex, parsingDay])
                        }
                    }
                    if (lesson.innerText.startsWith("My Timetable")) { // If at point of music lessons
                        atLessons = true; // Allow the rest of the code to run
                    }
                }
                
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

    userId = /scheduled\.php\?u=(\d+)/g.exec(iframe.src)[1]; // Extract the "userId" from the iframes src url

    new_iframe.height = iframe.height; // Style the iframe
    new_iframe.width = iframe.width;
    new_iframe.frameBorder = iframe.frameBorder;

    iframe_parent.removeChild(iframe); // Replace the existing iframe with our new one
    iframe_parent.appendChild(new_iframe);

    chrome.runtime.sendMessage(
        {contentScriptQuery: "queryMeetings", userId: userId}, // Send message to backend script, 
                                                               // tell it to retrieve the url for the iframe
        html => {
            new_iframe.contentDocument.write(html); // Write the html to out new iframe
            iframe_parent.style.backgroundImage = "none"; // Hide the loading gif
            setTimeout(function (frame){ // Ensure iframe is loaded (maybe redundant)
                table = frame.contentDocument.getElementsByTagName("table")[0]; // Get the table of meetings
                sortTable(table); // Sort the table
            },100,new_iframe)
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


// Runtime

chrome.storage.sync.get(["doFixPeriodNumbers", "doSeperateTimetableBreaks", "highlightTimetableBreaks", "doOrderZoomMeetings", "doAppendMusicTimetable", "doHighlightMusicLessons"], function (response) {
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
        seperateTimetableBreaks(response.highlightTimetableBreaks);
    }

    if (response.doHighlightMusicLessons) {
        highlightMusicLessons();
    }
})