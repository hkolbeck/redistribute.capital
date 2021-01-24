let funds_idx = 0;

$(document).ready(function () {
    for (let i = funds.length - 1; i >= 0; i--) {
        let new_idx = Math.floor(Math.random() * (i + 1));
        let previous = funds[new_idx];
        funds[new_idx] = funds[i];
        funds[i] = previous;
    }
});

let fetch_preview = function(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
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

$(function () {
    $(".button")
        .click(function () {
            if (funds_idx >= funds.length) {
                funds_idx = 0;
            }

            let fund = funds[funds_idx];
            funds_idx++;

            if (fund.html) {
                $(".fund_box").html(fund.html).css("background-color", "black")
            } else if (fund.description && fund.url) {
                $(".fund_box").html(`<b><a target="_blank" href="${fund.url}">${fund.description}</a></b>`)
                    .css("background-color", "white");
                fetch_preview(fund.url)
            } else {
                $(".fund_box").text(`Unable to fetch fund data for ${fund}`)
            }

            $(".fund_box_wrapper").css("visibility", "visible");
        })
        .hover(
            function () {
                $(this).css("background-image", "linear-gradient(167deg, red 50%, black 51%)")
                    .css("color", "white")
                    .css("box-shadow", "0px 0px 4px 4px #AAAAAA");
            },
            function () {
                $(this).css("background-image", "none")
                    .css("color", "black")
                    .css("box-shadow", "none");
            }
        );
});