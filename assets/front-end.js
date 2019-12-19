// -------------- video gallery START
new Glide('#tv-videos-slider', {
    autoplay: 3500,
    hoverpause: true,
    perView: 3,
    rewind: true,
    bound: true,
    breakpoints: {
        800: {
            perView: 2
        },
        425: {
            perView: 1
        }
    }
}).mount();
// -------------- video gallery END

// ------------- Image gallery START
new Glide('#image-gallery-slider', {
    autoplay: 3500,
    hoverpause: true,
    perView: 5,
    rewind: true,
    bound: true,
    swipeThreshold: false,
    dragThreshold: false,
    breakpoints: {
        800: {
            perView: 4
        },
        425: {
            perView: 2,
            swipeThreshold: true,
            dragThreshold: true
        }
    }
}).mount();

(function ($) {
    const lightBox = $("#light-box");
    const leftArrow = lightBox.find(".left").first();
    const rightArrow = lightBox.find(".right").first();
    // let clickedSlide = "";

    $("#image-gallery-slider").on('click', 'li.glide__slide', function (e) {
        // clickedSlide = $(this);
        $(this).addClass("light-box-item");
        let getClickedImg = $(this).children("img").attr("src");
        lightBox.addClass("show");
        lightBox.find("img").attr("src", getClickedImg);
    });

    leftArrow.click(function () {
        let currentItem = $(".glide__slide.light-box-item");
        let prevItem = currentItem.prev().length ? currentItem.prev() : $("li.glide__slide:last-child") ;

        currentItem.removeClass("light-box-item");
        prevItem.addClass("light-box-item");
        let prevImgSrc = prevItem.find("img").attr("src");
        lightBox.find("img").attr("src", prevImgSrc);

    });

    rightArrow.click(function () {
        let currentItem = $(".glide__slide.light-box-item");
        let nextItem = currentItem.next().length ? currentItem.next() : $("li.glide__slide:first-child");

        currentItem.removeClass("light-box-item");
        nextItem.addClass("light-box-item");
        let prevImgSrc = nextItem.find("img").attr("src");
        lightBox.find("img").attr("src", prevImgSrc);
    });

    $(".close").click(function () {
        lightBox.removeClass("show");
    });

    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            lightBox.removeClass("show");
        }
    });
})(jQuery);
// ------------- Image gallery END

// ------------- seasons tab content START
(function ($) {
    $("#seasons-tab .tab-nav .tab-nav-item:first-child").addClass("show");
    $("#seasons-tab .tab-content .tab-content-item:first-child").addClass("show");

    $(".tab-nav-item").click(function (e) {
        e.preventDefault();
        let activeNavId = $(this).attr("data-tab-id");
        console.log(activeNavId);
        // handle nav
        $(this).siblings().removeClass("show");
        $(this).addClass("show");

        // handle content
        $(".tab-content-item").siblings()
            .addClass("hide").removeClass("show");
        $(".tab-content-item[data-tab-id=" + activeNavId +"]")
            .removeClass("hide").addClass("show");
    });
})(jQuery);
// ------------- seasons tab content END