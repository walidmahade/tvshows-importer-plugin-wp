// console.log("Hello js");
(function ($) {
    const $resultContainer = $("#tv-shows-result");
    const $searchField = $(".mw-tv-shows #search-field");
    let apiKey = "5b538180b17e7bbdb9028e577080f931";
    let searchQuery = "love";
    let resultPage = 1;
    let url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;

    function truncate(str, no_words) {
        return str.split(" ").splice(0,no_words).join(" ");
    }

    // fetch tv shows (multiple) ajax
    function fetchTVshows(url) {
        $.ajax({
            url: url
        }).done(function(data) {
            console.log(data);
            let constructHTML = '';

            data.results.map(tvShow => {
                let tvShowDesc = truncate(tvShow.overview, 20) || "No description found.";

                let isDuplicate;
                // console.log(isDuplicate);
                    // ? " is-duplicate " : " "
                $.ajax({
                    url: `${magicalData.siteURL}/wp-json/tvshows/all?id=${tvShow.id}`,
                    async: false
                }).success(function(val) {
                    isDuplicate =  val;
                });

                constructHTML += `
                   <div class="tv-show-item  ${isDuplicate ? " is-duplicate " : " "}">
                        <img src="https://image.tmdb.org/t/p/w500/${tvShow.poster_path}" alt="" class="poster">
                        <div class="duplicate-badge">
                            Already Imported!!
                        </div>
                        <div class="content">
                            <div class="release-date">${tvShow.first_air_date}</div>
                            <h3 class="title">${tvShow.original_name}</h3>
                            <p class="para">${tvShowDesc}</p>
                            <div class="cta">
                                <button class="button button--import" data-show-id="${tvShow.id}">Import</button>
                            </div>
                        </div>
                   </div>                
                `
            });

            $resultContainer.html(constructHTML);
        });
    }

    /* =======================================================================
        // check if post is duplicate
        function checkDuplicate(id) {
            // console.log(`${magicalData.siteURL}/wp-json/tvshows/all?id=${id}`)
            $.ajax({
                url: `${magicalData.siteURL}/wp-json/tvshows/all?id=${id}`,
                async: false
            }).success(function(isDuplicate) {
                console.log(isDuplicate);
                return isDuplicate;
            });
        }
    =========================================================================== */

    // fetch tv show (single) ajax
    function fetchSingleTvShow(ID) {
        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${ID}?api_key=${apiKey}&language=en-US`
        }).done(function(data) {
            // console.log("------------------------- <br />");
            console.log(data);

            let TVshow = {
                "title": data.name,
                "content": data.overview,
                "status": "publish",
                "fields": {
                    "id": data.id,
                    // "tv_genres": data.genres.name,
                    "poster_url": data.poster_path ? "https://image.tmdb.org/t/p/w500/" + data.poster_path : " ",
                    "seasons_count": data.seasons.length, // now fetching only seasons
                    "seasons_list": []
                }
            };

            $.when(
                // fetch season for current tv show
                data.seasons.map(currSeason => {
                    // fetch season + episodes
                    let seasonEpisodeList = '';
                    let seasonObj = {};

                    $.when(
                        $.ajax({
                            url: `https://api.themoviedb.org/3/tv/${data.id}/season/${currSeason.season_number}?api_key=${apiKey}&language=en-US`,
                            async: false
                        }).done(function(seasonData) {
                            console.log("fetching season " + currSeason.season_number + " data");

                            seasonData.episodes.map((episode, key) => {
                                // return (
                                    seasonEpisodeList += `<div>${key+1}. ${episode.name}</div>`
                                // )
                            })
                        })
                    ).then(function () {
                        seasonObj["name"] = currSeason.name;
                        seasonObj["date"] = currSeason.air_date;
                        seasonObj["poster_url"] = currSeason.poster_path;
                        seasonObj["episode_count"] = currSeason.episode_count;
                        seasonObj["episode_list"] = seasonEpisodeList;

                        TVshow["fields"]["seasons_list"].push(seasonObj);
                    });

                    // console.log("----- season obj ------");
                    // console.log(seasonObj);

                    // return seasonObj;

                })
            ).then(function () {
                console.log("----- season list ------");
                console.log(TVshow);
                // console.log(typeof seasonsList);

                saveSingleTVshow(TVshow);
            });
        })
    }

    function saveSingleTVshow(show) {
        let url =  magicalData.siteURL  + "/wp-json/wp/v2/tvshows";
        console.log("*------ before saving post -------");
        console.log(JSON.stringify(show));
        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(show),
            contentType: "application/json",
            headers: {
                "Content-Type": 'application/json;charset=UTF-8',
                "X-WP-Nonce": magicalData.nonce
            }
        }).done(function() {
            // console.log(data);
            console.log("completed saving post");
        }).fail(function(e) {
            console.log("Error saving post");
        });
    }

    // search field functionality
    $searchField.keyup(function (e) {
        e.preventDefault();
        searchQuery = $searchField.val();
        url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;

        if (e.keyCode === 13) {
            console.log("fetching post");
            fetchTVshows(url);
        }
    });

    // import single tv show
    $resultContainer.on('click', $(".button--import"), function (e) {
        if ($(e.target).hasClass('button--import')) {
            console.log($(e.target));
            e.preventDefault();
            let showId = $(e.target).attr("data-show-id");
            console.log(showId);
            fetchSingleTvShow(showId);
        }
    });

})(jQuery);