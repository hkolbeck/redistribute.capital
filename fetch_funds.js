let funds = []

let fetch_funds = function() {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        xhr.response.split('\n')
            .filter(value => value.toString().length > 1)
            .forEach(line => funds.push({html: line.substring(1, line.length - 1).replaceAll('""', '"')}))

        for (let i = funds.length - 1; i >= 0; i--) {
            let new_idx = Math.floor(Math.random() * (i + 1));
            let previous = funds[new_idx];
            funds[new_idx] = funds[i];
            funds[i] = previous;
        }
    };

    xhr.open("GET", "https://docs.google.com/spreadsheets/d/e/2PACX-1vTS4kW1Z4_14OBGebIDZLXeXWBpuHuAhtzhECJ1L_7FqXgO64uQgiukG6VfWqlpxs-CKMA5-8tyOH7K/pub?gid=0&single=true&output=csv");
    xhr.send();
};

fetch_funds()