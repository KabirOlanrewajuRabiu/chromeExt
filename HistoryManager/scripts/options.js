const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24 * 1;
const MAX_RESULTS = 100000;
const HEADERS = ['hostname', 'frequency', 'visitCount'];
const $ = document.getElementById.bind(document);
/*
    key: value
    baseURL: [{
        items:[historyItem]
        count: count
        visitCount: visitCount
    }]

    Table of objects
    BaseURL, visitCount, 
*/

function transformHistoryItems(historyItems) {
    let transformed = {};
    for (let item of historyItems) {
        let url = new URL(item.url);
        let hostname = url.hostname;
        let entry = transformed[hostname];
        if (entry) {
            entry.frequency++;
            entry.visitCount += item.visitCount;
            entry.items.push(item);
        } else {
            transformed[hostname] = {
                hostname,
                frequency: 1,
                visitCount: item.visitCount,
                items: [item]
            }
        }
    }

    return Object.values(transformed);
}

function getHistory(startTime) {
    chrome.history.search(
        {
            text: '',
            startTime: startTime,
            maxResults: MAX_RESULTS,
        }, function (data) {
            let transformed = transformHistoryItems(data);
            new Tabulator("#historyTable", {
                layout: "fitColumns",
                data: transformed,
                pagination: "local",
                paginationSize: 20,
                paginationSizeSelector: [10, 20, 50],
                movableColumns: true,
                paginationCounter: "rows",
                columns: [
                    { title: "Name", field: "hostname" },
                    { title: "Frequency", field: "frequency", sorter: "number" },
                    { title: "Visit Count", field: "visitCount", sorter: "number" },
                ],
                initialSort: [
                    { column: "visitCount", dir: "desc" },
                    { column: "frequency", dir: "desc" },
                ],
                sortOrderReverse: true,
            });
        });
}

let getLookBackStartTime = function (days) {
    if (!Number.isFinite(days)) {
        days = 1;
    }

    const elapsedMilliseconds = MILLISECONDS_PER_DAY * days;
    const startTime = (new Date).getTime() - elapsedMilliseconds;
    return startTime;
}

let buttons = $('buttons').getElementsByTagName('button');
for (const button of buttons) {
    button.onclick = () => {
        let days = parseInt(button.dataset.days, 10);
        let startTime = getLookBackStartTime(days);
        getHistory(startTime);
    };
}

getHistory();