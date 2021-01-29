let funds_idx = 0;

let fetch_preview = function (url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        let preview = null;
        let metas = this.responseXML.getElementsByTagName("meta");
        for (let i = 0; i < metas.length; i++) {
            if (metas[i].getAttribute("property") === "og:image") {
                preview = metas[i].getAttribute("content");
                break;
            }
        }

        if (preview) {
            $(".fund_box").append(`<img src="${preview}" alt="link preview">`)
        }
    };

    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
};

let load_tweet = function (tweet) {
    $(".fund_box").css("visibility", "hidden").css("background-color", "#FEFEFE").html(tweet)
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
                $(".fund_box").css("visibility", "visible")
            }, 500)
        }
    }, 500)

}

$(function () {
    $(".button")
        .click(function () {
            if (funds_idx >= funds.length) {
                funds_idx = 0;
            }

            let fund = funds[funds_idx];
            funds_idx++;

            if (fund.html) {
                load_tweet(fund.html)
            } else if (fund.description && fund.url) {
                $(".fund_box").html(`<b><a target="_blank" href="${fund.url}">${fund.description}</a></b>`)
                    .css("background-color", "#FEFEFE");
                fetch_preview(fund.url)
            } else {
                $(".fund_box").text(`Unable to fetch fund data for ${fund}`)
            }

            $(".fund_box_wrapper").css("visibility", "visible");
        })
});