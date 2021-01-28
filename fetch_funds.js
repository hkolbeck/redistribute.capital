let funds = []

Papa.parsePromise = function(url) {
    return new Promise(function(complete, error) {
        Papa.parse(url, {
            download: true,
            header: false,
            complete: complete,
            error: error
        });
    });
};


let fetch_funds = async function () {
    await Papa.parsePromise("https://docs.google.com/spreadsheets/d/e/2PACX-1vTS4kW1Z4_14OBGebIDZLXeXWBpuHuAhtzhECJ1L_7FqXgO64uQgiukG6VfWqlpxs-CKMA5-8tyOH7K/pub?gid=0&single=true&output=csv")
        .then(result => result.data.forEach(line => funds.push({html: line})))
};

let shuffle_funds = function () {
    for (let i = funds.length - 1; i >= 0; i--) {
        let new_idx = Math.floor(Math.random() * (i + 1));
        let previous = funds[new_idx];
        funds[new_idx] = funds[i];
        funds[i] = previous;
    }
}
