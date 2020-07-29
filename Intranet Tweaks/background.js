chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.contentScriptQuery == "queryMeetings") {
        var url = "https://portal.cgs.vic.edu.au/Calendar/Zoom/scheduled.php?u=" +
                encodeURIComponent(parseInt(request.userId));
            console.log(url) //temp
        fetch(url)
            .then(response => response.text())
            .then(text => sendResponse(text))
        return true;  // Will respond asynchronously.
      }
    });