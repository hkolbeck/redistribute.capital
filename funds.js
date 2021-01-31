function loadCsv(url) {
    return new Promise(function(complete, error) {
        Papa.parse(url, {
            download: true,
            header: false,
            complete: complete,
            error: error
        });
    });
};

async function fetchFunds() {
    // Load funds
    let funds = (await loadCsv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTS4kW1Z4_14OBGebIDZLXeXWBpuHuAhtzhECJ1L_7FqXgO64uQgiukG6VfWqlpxs-CKMA5-8tyOH7K/pub?gid=0&single=true&output=csv"))
        .data
        // Take the first column
        .map(line => line && line[0])
        // Remove empty lines
        .filter(line => line);

    // Shuffle funds by sorting them randomly
    funds.sort(() => Math.random() - 0.5);
    
    return funds;
}

function findPaymentLinks(tweet) {
    let venmo = tweet.match(/venmo:?\s*@?\s*([\w-]+)/i)
    if (venmo) {
        $(".payment_links")
            .append(`<a href="https://venmo.com/${venmo[1]}" target="_blank" rel="noopener noreferrer"><img alt="Venmo" height="64" width="64" src="https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg"/></a>`)
    }

    let cashapp = tweet.match(/(\$[a-zA-Z][\w-]+)|cash-?app:?\s*([a-zA-Z][\w-]+)/i)
    if (cashapp) {
        $(".payment_links")
            .append(`<a href="https://cash.me/${cashapp[2] || cashapp[1]}" target="_blank" rel="noopener noreferrer"><img alt="CashApp" height="64" width="64" src="https://cash.app/icon-196.png"/></a>`)
    }

    if (cashapp || venmo) {
        $(".payment_links").css("visibility", "visible")
    }
}

async function loadTweet(tweet) {
    $(".fund_box_wrapper").css("visibility", "visible")
    const tweetElement = $(tweet);
    tweetElement.remove('script');
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").html(tweetElement)
    $(".payment_links").empty().css("visibility", "hidden")
    findPaymentLinks(tweet)
    $(".fund_box").css("visibility", "visible")
}

$(async function () {
    let funds_idx = 0;
    $(".button").css("opacity", 0.5)
    const funds = await fetchFunds();
    $(".button").css("opacity", 1)
    window.history.replaceState({idx: 0}, null, "");
    
    $(".button")
        .click(function () {
            funds_idx++;
            if (funds_idx >= funds.length) {
                funds_idx = 0;
            }
            loadTweet(funds[funds_idx])
            window.history.pushState({idx: funds_idx}, null, "")
        })
        
    $(window).on('popstate', function (event) {
        if (event.originalEvent.state && typeof event.originalEvent.state.idx == 'number') {
            funds_idx = event.originalEvent.state.idx;
            loadTweet(funds[funds_idx])
        }
    })
});