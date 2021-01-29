let funds_idx = 0;

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
                console.log(fund.html)
                $(".fund_box").html(fund.html).css("background-color", "#FEFEFE")
            } else if (fund.description && fund.url) {
                $(".fund_box").html(`<b><a target="_blank" href="${fund.url}">${fund.description}</a></b>`)
                    .css("background-color", "#FEFEFE");
                fetch_preview(fund.url)
            } else {
                $(".fund_box").text(`Unable to fetch fund data for ${fund}`)
            }

            $(".fund_box_wrapper").css("visibility", "visible");
        })
        /* .hover(
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
        );*/
});