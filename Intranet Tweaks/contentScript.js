d = document;

elems = d.getElementsByClassName("timetable-background")[0].children[1].children[1].children
arr = [].slice.call(elems,1);

function sortTable(table) {
    rows = [].slice.call(table.rows,1);
    toprow = table.rows[0]
    rows1 = []
    rows2 = []
    for (row in rows) {
        row = rows[row]
        time = row.cells[0].innerText;
        if (time.endsWith("AM") || time.startsWith("12")) {
            time = time.slice(0,-3)
            time = (parseInt(time) * 60) + parseInt(time.slice(3))
        }
        else if (time.endsWith("PM")) {
            time = time.slice(0,-3)
            time = ((parseInt(time)+12) * 60) + parseInt(time.slice(3))
        }
        rows1.push(time)
    }
    rows12 = rows1.slice(0).sort()
    for (row in rows12) {
        row = rows12[row]
        rows2.push(rows[rows1.indexOf(row)])
    }
    table.tBodies[0].innerHTML = '';
    table.tBodies[0].appendChild(toprow);
    for (row in rows2) {
        row = rows2[row]
        table.tBodies[0].appendChild(row);
    }
}

for (var elem in arr) {
    field = arr[elem].children[0];
    field.innerText = parseInt(field.innerText)-1
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

iframe_parent = d.getElementById("holds-the-iframe");
iframe = iframe_parent.children[0];
new_iframe = d.createElement("iframe");
userId = /scheduled\.php\?u=(\d+)/g.exec(iframe.src)[1];
new_iframe.height = iframe.height;
new_iframe.width = iframe.width;
new_iframe.frameBorder = iframe.frameBorder;
iframe_parent.removeChild(iframe);
iframe_parent.appendChild(new_iframe);

chrome.runtime.sendMessage(
    {contentScriptQuery: "queryMeetings", userId: userId},
    html => {new_iframe.contentWindow.document.write(html); 
        iframe_parent.style.backgroundImage = "none";
        setTimeout(function (frame){
            table = frame.contentWindow.document.getElementsByTagName("table")[0];
            sortTable(table);
        },100,new_iframe)
    });