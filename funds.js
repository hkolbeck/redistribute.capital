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

window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
    t._e.push(f);
};

    return t;
}(document, "script", "twitter-wjs"))

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
            funds.push({html: line[0], type: line[1], md5: line[2], time: line[3]})
        }))
}

function shuffle_funds_weighted() {
    let shuffled = []
    funds.forEach(fund => {
        let fund_time = Date.parse(fund.time)
        let now = Date.now();
            let weighted_fund = {fund: fund, weight: Math.random() * (now - fund_time)}
            shuffled.push(weighted_fund)
    })

    shuffled.sort((a, b) => a.weight - b.weight)

    funds = shuffled.map(f => f.fund)
}

function find_payment_links(tweet) {
    tweet = tweet.toString()

    let venmo = tweet.match(/[Vv][Ee][Nn][Mm][Oo]:?\s*@?\s*([\w-]+)/)
    if (venmo) {
        $(".payment_links")
            .append(`&nbsp;<a href="https://venmo.com/?txn=pay&audience=private&recipients=${venmo[1]}" target="_blank" rel="noopener noreferrer"><img alt="Venmo" height="64" width="64" src="https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg"/></a>&nbsp;`)
    }

    let cashapp = tweet.match(/(\$[a-zA-Z][\w-]+)|[Cc][Aa][Ss][Hh]-?[Aa][Pp][Pp]:?\s*([a-zA-Z][\w-]+)/)
    if (cashapp) {
        $(".payment_links")
            .append(`&nbsp;<a href="https://cash.me/${cashapp[2] || cashapp[1]}" target="_blank" rel="noopener noreferrer"><img alt="CashApp" height="64" width="64" src="https://cash.app/icon-196.png"/></a>&nbsp;`)
    }

    return cashapp || venmo
}

function load_tweet(tweet) {
    let loading = $(".loading");
    let fundBox = $(".fund_box");
    let paymentLinks = $(".payment_links");

    fundBox.css("visibility", "hidden").css("background-color", "#FEFEFE").removeAttr("height")
    paymentLinks.empty().css("visibility", "hidden")
    loading.css("visibility", "visible")

    let timedOut = false

    let checkTimeout = setTimeout(() => {
        timedOut = true
        loading.css("visibility", "hidden")
        fundBox.html("<p><b>Couldn't load fund<br>Please try again!</b>")
            .css("color", "#5C5C5C")
            .css("visibility", "visible")
    }, 5000)

    tweet = tweet.replaceAll(/<script.*<\/script>/g, '')
    let foundPayment = find_payment_links(tweet)

    twttr.events.bind(
        'rendered',
        () => {
            if (!timedOut) {
                clearTimeout(checkTimeout)
                loading.css("visibility", "hidden")
                if (foundPayment) {
                    paymentLinks.css("visibility", "visible")
                }
            }
        }
    )

    fundBox.html(tweet)
    twttr.widgets.load()
}

function load_gofundme(gofundme) {
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").html(gofundme)
    $(".payment_links").empty().css("visibility", "hidden")
    $(".loading").css("visibility", "visible")

    let checkLoaded = null

    let checkTimeout = setTimeout(() => {
        clearInterval(checkLoaded)
        $(".loading").css("visibility", "hidden")
        $(".fund_box").html("<b>Couldn't load fund 😩<br>Please try again!</b>").css("visibility", "visible")
    }, 5000)

    checkLoaded = setInterval(() => {
        let rendered = $(".fund_box").find(".gfm-embed-iframe");
        if (rendered) {
            clearTimeout(checkTimeout)
            clearInterval(checkLoaded)
            $(".loading").css("visibility", "hidden")
            setTimeout(() => {
                $(".fund_box").css("visibility", "visible").attr("height", "500px")
                $(".gfm-embed").attr("height", "450px")
            }, 500)
        }
    }, 500)
}

function load_facebook(post) {
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").removeAttr("height").html(post)
    $(".payment_links").empty().css("visibility", "hidden")
    $(".loading").css("visibility", "visible")

    let checkLoaded = null

    let checkTimeout = setTimeout(() => {
        clearInterval(checkLoaded)
        $(".loading").css("visibility", "hidden")
        $(".fund_box").html("<b>Couldn't load fund 😩<br>Please try again!</b>").css("visibility", "visible")
    }, 5000)

    checkLoaded = setInterval(() => {
        let rendered = $(".fund_box").find("iframe").find("html");
        if (rendered) {
            clearTimeout(checkTimeout)
            clearInterval(checkLoaded)
            $(".loading").css("visibility", "hidden")
            setTimeout(() => {
                $(".fund_box").css("visibility", "visible")
            }, 500)
        }
    }, 500)
}

function render_fund(fund) {
    if (fund.type === 'tweet') {
        load_tweet(fund.html)
    } else if (fund.type === 'gofundme') {
        load_gofundme(fund.html)
    } else if (fund.type === 'facebook') {
        load_facebook(fund.html)
    } else {
        $(".fund_box").text(`Something went wrong. Please report this fund as broken by clicking the 💔 button in
        the lower left corner.`)
    }

    $(".report_bt").attr("href", `./report.html?fid=${fund.md5}`)
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