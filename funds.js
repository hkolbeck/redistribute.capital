window.twttr = (function (d, s, id) {
    let js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function (f) {
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"))

function loadCsv(url) {
    return new Promise(function (complete, error) {
        Papa.parse(url, {
            download: true,
            header: false,
            complete: complete,
            error: error
        });
    })
}

// Testing: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQkrQ7pErJ2m9Or6cuClYtcK4vsI3eusDj080BxWEpgXDIxXoTe6InbbaZaMX39-D6RAXSQS2k8thFR/pub?gid=0&single=true&output=csv"
async function fetchFunds() {
    return (await loadCsv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSb-RukXOxGXgb29ULm7RwI_927JsNIwcBcWwHTSrNV1xKa_N81PXzgRUnyIcxF8Kg1r2JPJcw2FC1_/pub?gid=0&single=true&output=csv"))
        .data
        .filter(line => line && line.length === 4)
        .map(line => {
            return {html: line[0], type: line[1], md5: line[2], time: line[3]}
        })
}

function shuffleFundsWeighted(funds) {
    let shuffled = []
    funds.forEach(fund => {
        let fund_time = Date.parse(fund.time)
        let now = Date.now();
        let weighted_fund = {fund: fund, weight: Math.random() * (now - fund_time)}
        shuffled.push(weighted_fund)
    })

    shuffled.sort((a, b) => a.weight - b.weight)

    return shuffled.map(f => f.fund)
}

function findPaymentLinks(tweet) {
    tweet = tweet.toString()

    let venmo = tweet.match(/v[e3]?nm[o0]:?\s*@?\s*\/?\s*([\w-]+)|v[e3]?nm[o0]:?\s*<a href="https:\/\/twitter.com[^>]>@([\w-]+)/i)
    if (venmo) {
        let venmoUser = venmo[1] || venmo[2];
        $(".payment_links")
            .append(`&nbsp;<a href="https://venmo.com/?txn=pay&audience=private&recipients=${venmoUser}" target="_blank" rel="noopener noreferrer"><img alt="Venmo ${venmoUser}" title="Venmo ${venmoUser}" height="64" width="64" src="https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg"/></a>&nbsp;`)
    }

    let cashapp = tweet.match(/(\$[a-zA-Z][\w-]*)|ca?sh[ -]?app:?\s*([a-zA-Z][\w-]+)|ca?sh[- ]?app:?\s*<a href="([^"]+)"/i)
    if (cashapp) {
        if (cashapp[3]) {
            $(".payment_links")
                .append(`&nbsp;<a href="${cashapp[3]}" target="_blank" rel="noopener noreferrer"><img alt="CashApp ${cashapp[3]}" title="CashApp ${cashapp[3]}" height="64" width="64" src="https://cash.app/icon-196.png"/></a>&nbsp;`)
        } else {
            let cashappUser = cashapp[2] || cashapp[1];
            $(".payment_links")
                .append(`&nbsp;<a href="https://cash.me/${cashappUser}" target="_blank" rel="noopener noreferrer"><img alt="CashApp ${cashappUser}" title="CashApp ${cashappUser}" height="64" width="64" src="https://cash.app/icon-196.png"/></a>&nbsp;`)
        }
    }

    let paypal = tweet.match(/pa?ypa?l:?\s*<a href="([^"]+)"/i)
    if (paypal) {
        $(".payment_links")
            .append(`&nbsp;<a href="${paypal[1]}" target="_blank" rel="noopener noreferrer"><img alt="PayPal" title="PayPal" height="64" width="64" src="https://www.paypalobjects.com/webstatic/paypalme/images/social/pplogo384.png"/></a>&nbsp;`)
    }

    return cashapp || venmo || paypal
}

function loadTweet(tweet) {
    let loading = $(".loading");
    let fundBox = $(".fund_box");
    let paymentBox = $(".payment_box");

    fundBox.css("visibility", "hidden").css("background-color", "#FEFEFE").removeAttr("height")
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
    let foundPayment = findPaymentLinks(tweet)

    twttr.events.bind(
        'rendered',
        () => {
            if (!timedOut) {
                clearTimeout(checkTimeout)
                loading.css("visibility", "hidden")
                fundBox.css("visibility", "visible")
                if (foundPayment) {
                    paymentBox.show()
                } else {
                    paymentBox.hide()
                }
            }
        }
    )

    fundBox.html(tweet)
    twttr.widgets.load(fundBox)
}

// GoFundMe's embed script assumes that embeds are static, and so doesn't work here
// This is a minor tweak to their script designed to work similarly to twttr.widgets.load()
function styleGoFundMe() {
    try {
        function n(t) {
            let n = document.createElement("iframe");
            n.setAttribute("class", "gfm-embed-iframe")
            n.setAttribute("width", "100%")
            n.setAttribute("height", "540")
            n.setAttribute("frameborder", "0")
            n.setAttribute("scrolling", "no")
            n.setAttribute("src", t)
            return n
        }

        window.addEventListener("message", function (t) {
            t.data && ((function (t) {
                return [].slice.call(document.getElementsByClassName("gfm-embed-iframe")).filter(function (e) {
                    return e.contentWindow === t.source
                })[0]
            }(t)).height = t.data.offsetHeight)
        }, !1)

        let gfms = document.getElementsByClassName("gfm-embed");
        for (let t = gfms, r = 0; r < t.length; r++) {
            let i = n(t[r].getAttribute("data-url"));
            t[r].appendChild(i)
        }
    } catch (t) {
    }
}

function loadGoFundMe(gofundme) {
    gofundme = gofundme.replaceAll(/<script.*<\/script>/g, '')

    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").html(gofundme)
    $(".loading").css("visibility", "visible")
    styleGoFundMe()

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

function loadFacebook(post) {
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").removeAttr("height").html(post)
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

function renderFund(fund) {
    $(".pitch").hide()
    $(".payment_box").hide()
    $(".payment_links").empty()

    if (fund.type === 'tweet') {
        loadTweet(fund.html)
    } else if (fund.type === 'gofundme') {
        loadGoFundMe(fund.html)
    } else if (fund.type === 'facebook') {
        loadFacebook(fund.html)
    } else {
        $(".fund_box").text(`Something went wrong. Please report this fund as broken by clicking the 💔 button in the lower left corner.`)
    }

    $(".report_bt").attr("href", `./report.html?fid=${fund.md5}`)
    updateShares(fund.md5)
    $(".fund_box_wrapper").css("visibility", "visible")
}

function getInitialState(funds) {
    let params = new URLSearchParams(window.location.search)
    let fid = params.get("fid")

    if (fid) {
        let idx = funds.findIndex(fund => fund.md5 === fid);
        if (idx < 0) {
            $(".fund_box")
                .html("<h2>The requested fund is no longer available, press the button to find another one</h2>")
            $(".fund_box_wrapper").css("visibility", "visible")
            return {idx: 0, show: false, query: ""}
        } else {
            return {idx: idx, show: true, query: `?fid=${fid}`};
        }
    } else {
        return {idx: 0, show: false, query: ""};
    }
}

function updateShares(fundMd5) {
    let encoded = encodeURIComponent(`https://redistribute.capital?fid=${fundMd5}`)
    $(".fb_share_link").attr("href", `https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=${encoded}&display=popup&ref=plugin&src=share_button"`)
    $(".twitter_share_link").attr("href", `https://twitter.com/intent/tweet?original_referer=https%3A%2F%2Fredistribute.capital%2F&ref_src=twsrc%5Etfw&text=Find%20people%20who%20need%20the%20%245%20you%20didn%27t%20spend%20on%20coffee%20today%20at&tw_p=tweetbutton&url=${encoded}`)
}

$(async function () {
    let button = $(".button");
    button.css("opacity", 0.5)
    const funds = await fetchFunds().then(funds => shuffleFundsWeighted(funds));

    if (funds && funds.length === 0) {
        $(".fund_box_wrapper").html("<h2>Couldn't load fundraisers.<br>Please refresh the page to try again.</h2>")
        return
    }

    let initialState = getInitialState(funds)
    let fundsIdx = initialState.idx
    window.history.replaceState({idx: initialState.idx, init: true}, null, initialState.query);

    if (initialState.show) {
        renderFund(funds[fundsIdx])
    } else {
        $(".pitch").show()
    }

    button.click(function () {
        if (fundsIdx >= funds.length) {
            fundsIdx = 0;
        }

        let fund = funds[fundsIdx];
        window.history.pushState({idx: fundsIdx, init: false}, null, `?fid=${fund.md5}`)
        fundsIdx++;

        renderFund(fund)
    })
    button.css("opacity", 1)

    $(window).on('popstate', function (event) {
        if (event.originalEvent.state && typeof event.originalEvent.state.idx == 'number') {
            fundsIdx = event.originalEvent.state.idx;

            if (event.originalEvent.state.init) {
                $(".fund_box").find("iframe").css("visibility", "hidden")
                $(".payment_links").css("visibility", "hidden")
                $(".report_bt").attr("href", `./report.html`)
                $(".pitch").show()
            } else {
                renderFund(funds[fundsIdx])
            }
        }
    })
});