function stringArray2dFromTable (table, ignoreEmpty=true, startAt, endAt, inclusive=false, minCells=0) {
    tableArray = [];
    going = false
    if (startAt == undefined) {
        going = true
    }

    for (row of table.rows) {
        rowArray = [];
        for (cell of row.cells) {
            if (inclusive && cell.innerText==startAt) {
                going = true
            }
            if (!inclusive && cell.innerText==endAt) {
                going = false
            }
            if (!(ignoreEmpty && cell.innerText.replace(/[^\x21-\x7E]/g, '') == "") && going) {
                rowArray.push(cell.innerText)
            }

            if (!inclusive && cell.innerText==startAt) {
                going = true
            }
            if (inclusive && cell.innerText==endAt) {
                going = false
            }

        }
        if (rowArray.length >= minCells) {
            tableArray.push(rowArray);
        }
        
    }
    return tableArray;
}

function stringArray1dFromTable (table, ignoreEmpty=true, startAt, endAt, inclusive=false) {
    tableArray = [];
    going = false
    if (startAt == undefined) {
        going = true
    }

    for (row of table.rows) {
        run = true
        if (inclusive && row.innerText==startAt) {
            going = true
        }
        if (!inclusive && row.innerText==endAt) {
            going = false
        }
        if (!(ignoreEmpty && row.innerText.replace(/[^\x21-\x7E]/g, '') == "") && going) {
            tableArray.push(row.innerText)
        }

        if (!inclusive && row.innerText==startAt) {
            going = true
        }
        if (inclusive && row.innerText==endAt) {
            going = false
        }
        
    }
    return tableArray;
}