let funds = []
let funds_idx = 0
window.history.replaceState({idx: 0}, null, "")

window.onpopstate = function (event) {
    if (event.state) {
        let state_idx = event.state.idx - 1
        if (state_idx < 0) {
            state_idx = funds.length - 1
        }

        funds_idx = state_idx
    }

    render_fund(funds[funds_idx])
    funds_idx++
}

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

async function fetch_funds() {
    await Papa.parsePromise("https://docs.google.com/spreadsheets/d/e/2PACX-1vSb-RukXOxGXgb29ULm7RwI_927JsNIwcBcWwHTSrNV1xKa_N81PXzgRUnyIcxF8Kg1r2JPJcw2FC1_/pub?gid=0&single=true&output=csv")
        .then(result => result.data.forEach(line => {
            console.log(JSON.stringify(line))
            funds.push({html: line[0], type: line[1], sha: line[2]})
        }))
}

function shuffle_funds() {
    for (let i = funds.length - 1; i >= 0; i--) {
        let new_idx = Math.floor(Math.random() * (i + 1));
        let previous = funds[new_idx];
        funds[new_idx] = funds[i];
        funds[i] = previous;
    }
}

function find_payment_links(tweet) {
    tweet = tweet.toString()

    let venmo = tweet.match(/[Vv][Ee][Nn][Mm][Oo]:?\s*@?\s*([\w-]+)/)
    if (venmo) {
        $(".payment_links")
            .append(`<a href="https://venmo.com/?txn=pay&audience=private&recipients=${venmo[1]}" target="_blank" rel="noopener noreferrer"><img alt="Venmo" height="64" width="64" src="https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg"/></a>`)
    }

    let cashapp = tweet.match(/(\$[a-zA-Z][\w-]+)|[Cc][Aa][Ss][Hh]-?[Aa][Pp][Pp]:?\s*([a-zA-Z][\w-]+)/)
    if (cashapp) {
        $(".payment_links")
            .append(`<a href="https://cash.me/${cashapp[2] || cashapp[1]}" target="_blank" rel="noopener noreferrer"><img alt="CashApp" height="64" width="64" src="https://cash.app/icon-196.png"/></a>`)
    }

    if (cashapp || venmo) {
        $(".payment_links").css("visibility", "visible")
    }
}

function load_tweet(tweet) {
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").html(tweet)
    $(".payment_links").empty().css("visibility", "hidden")
    $(".loading").css("visibility", "visible")

    let checkLoaded = null

    let checkTimeout = setTimeout(() => {
        clearInterval(checkLoaded)
        $(".loading").css("visibility", "hidden")
        $(".fund_box").html("<b>Couldn't load fund 😩<br>Please try again!</b>").css("visibility", "visible")
    }, 5000)

    checkLoaded = setInterval(() => {
        let rendered = $(".fund_box").find(".twitter-tweet-rendered");
        if (rendered) {
            clearTimeout(checkTimeout)
            clearInterval(checkLoaded)
            $(".loading").css("visibility", "hidden")
            setTimeout(() => {
                find_payment_links(tweet)
                $(".fund_box").css("visibility", "visible")
            }, 500)
        }
    }, 500)
}

function render_fund(fund) {
    //

    if (fund.html) {
        load_tweet(fund.html)
    } else {
        $(".fund_box").text(`Unable to fetch fund data for ${fund}`)
    }

    $(".report_bt").attr("href", `https://docs.google.com/forms/d/e/1FAIpQLSc_kpPJmD5VVRlh1OXjise7EiBEhJKVEaLJqYZLCI_nirHi2Q/viewform?usp=pp_url&entry.1420691641=${fund.sha}`)
    $(".fund_box_wrapper").css("visibility", "visible")
}

$(function () {
    $(".button")
        .click(function () {
            if (funds_idx >= funds.length) {
                funds_idx = 0;
            }

            let fund = funds[funds_idx];
            funds_idx++;
            window.history.pushState({idx: funds_idx}, null, "")

            render_fund(fund)
        })
});