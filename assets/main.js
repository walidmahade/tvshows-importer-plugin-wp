// console.log("Hello js");
(function ($) {
    // const $loader = $("#loader");
    // $loader.hide();
    const $status = $("#ui-update");
    const $resultContainer = $("#tv-shows-result");
    const $searchField = $(".mw-tv-shows #search-field");
    const $currentResultPageDisplay = $("#result-page-no");
    const $totalPagesDisplay = $("#total-pages");

    let apiKey = "5b538180b17e7bbdb9028e577080f931";
    let searchQuery = "love";
    let resultPage = 1;
    let url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;
    let selectedTVshows = [];
    let currentVisibleTVshows = [];

    function truncate(str, no_words) {
        return str.split(" ").splice(0, no_words).join(" ");
    }

    function processDone() {
        $status.css('background', '#009688');
        $status.html("<span>Done</span><svg id=\"m-check-mark\" width=\"245px\" height=\"173px\" viewBox=\"0 0 245 173\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
            "    <g id=\"Page-1\" stroke=\"none\" stroke-width=\"2\" fill=\"none\" fill-rule=\"evenodd\" stroke-opacity=\"1\">\n" +
            "        <polyline id=\"checkmark\" stroke=\"#fff\" stroke-width=\"30\" points=\"5.640625 83.7607422 83.2539062 161.663086 238.97168 6.11328125\"></polyline>\n" +
            "    </g>\n" +
            "</svg>");
    }

    function processError() {
        $status.css('background', '#961618');
        $status.html("Something went wrong!!");
    }

    function saveTvShowRequest(show, reqUrl) {

        $.ajax({
            type: "POST",
            url: reqUrl,
            data: JSON.stringify(show),
            contentType: "application/json",
            headers: {
                "Content-Type": 'application/json;charset=UTF-8',
                "X-WP-Nonce": magicalData.nonce
            }
        }).done(function () {
            // console.log(data);
            console.log("Completed saving post");
            processDone();
        }).fail(function (e) {
            console.log("Error saving post");
            processError()
        });
    }

    function insertFetchedTVshowToDOM(tvShowsArr) {
        $resultContainer.html("");
        let constructHTML = '';

        tvShowsArr.map(tvShow => {
            let tvShowDesc = truncate(tvShow.overview, 20) || "No description found.";

            constructHTML += (`
                <div class="tv-show-item" data-item-id="${tvShow.id}">
                    <img src="https://image.tmdb.org/t/p/w500/${tvShow.poster_path}" alt="" class="poster">
                    <div class="duplicate-badge">
                        Already Imported!!
                    </div>
                    <div class="content">
                        <h3 class="title">${tvShow.original_name}</h3>
                        <p class="para">${tvShowDesc}...</p>
                        <p class="line-item"><b>Date: </b>${tvShow.first_air_date}</p>
                        <p class="line-item"><b>Rating: </b>${tvShow.vote_average}</p>
                        <p class="line-item"><b>Pupularity: </b>${tvShow.popularity}</p>
                        <div class="cta">
                            <button class="button button--import" data-show-id="${tvShow.id}">Import</button>
                            <button class="button button--select" data-select-id="${tvShow.id}">Select</button>
                        </div>
                    </div>
                </div>
            `);
        });

        $resultContainer.html(constructHTML);
    }

    // fetch tv shows (multiple) ajax
    function fetchTVshows(url) {
        $resultContainer.html("");

        $.ajax({
            url: url
        }).success(function (data) {
            console.log(data);
            currentVisibleTVshows = data.results;

            // console.log(data.results.length);
            $currentResultPageDisplay.val(data.page);
            $totalPagesDisplay.html(data.total_pages);

            if (data.results.length === 0) {
                $status.css('background', '#E91E63');
                $status.html("Sorry, No TV-Show matched your search.");
            } else {

                insertFetchedTVshowToDOM(data.results);

                // status update
                processDone();

                // status update
                setTimeout(function () {
                    $status.css('background', '#E91E63');
                    $status.html("<span>Please wait, Checking for duplicates.</span><div id='loader'></div>");
                }, 800);

                // check duplicate
                checkForDuplicateShows();
            }
        });
    }


    // check if post is duplicate
    function checkForDuplicateShows() {

        $.each($(".tv-show-item"), function (i, elem) {
            // console.log($(elem).hasClass("show"));
            let showID = $(elem).attr("data-item-id");

            $.ajax({
                url: `${magicalData.siteURL}/wp-json/tvshows/all?id=${showID}`,
                // async: false
            }).success(function (isDuplicate) {
                // console.log(isDuplicate);
                // return isDuplicate;
                if (isDuplicate) {
                    $(elem).addClass("is-duplicate");
                    $(elem).find(".button.button--import").first().html("Update");
                    $(elem).find(".button.button--import").first().addClass("button--update");
                }
            });
        });
        // console.log($(".tv-show-item"))

        // status update
        setTimeout(function () {
            processDone();
        }, 1500);
    }


    // fetch tv show (single) ajax
    function fetchSingleTvShow(ID) {
        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${ID}?api_key=${apiKey}&language=en-US`
        }).done(function (data) {
            // console.log("------------------------- <br />");
            console.log(data);

            let TVshow = {
                "title": data.name,
                "content": data.overview,
                "status": "publish",
                "fields": {
                    "id": data.id,
                    // "tv_genres": data.genres.name,
                    "poster_url": data.poster_path ? "https://image.tmdb.org/t/p/w500" + data.poster_path : " ",
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
                        }).done(function (seasonData) {
                            console.log("fetching season " + currSeason.season_number + " data");

                            seasonData.episodes.map((episode, key) => {
                                // return (
                                seasonEpisodeList += `<div>${key + 1}. ${episode.name}</div>`
                                // )
                            })
                        })
                    ).then(function () {
                        seasonObj["name"] = currSeason.name;
                        seasonObj["date"] = currSeason.air_date;
                        seasonObj["poster_url"] = currSeason.poster_path ? "https://image.tmdb.org/t/p/w500" + currSeason.poster_path : " ";
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
        // console.log("------ before saving post -------");
        // console.log(JSON.stringify(show));

        $.ajax({
            url: `${magicalData.siteURL}/wp-json/tvshows/all?id=${show.fields.id}`,
            // async: false
        }).success(function (isDuplicate) {
            // console.log(isDuplicate);
            // return isDuplicate;
            if (isDuplicate) {
                $status.html("Updating post");
                show.id = isDuplicate; // set post id to matched id
                let newUrl = magicalData.siteURL + "/wp-json/wp/v2/tvshows/" + isDuplicate;
                saveTvShowRequest(show, newUrl);
            } else {
                let newUrl = magicalData.siteURL + "/wp-json/wp/v2/tvshows";
                // $status.html("Importing post");
                saveTvShowRequest(show, newUrl);
            }
        });
    }

    // search field functionality
    $searchField.keyup(function (e) {
        e.preventDefault();
        searchQuery = $searchField.val();
        url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;

        if (e.keyCode === 13) {
            // $loader.show();
            console.log("fetching post");
            // status update
            $status.html("<span>Fetching post</span><div id=\"loader\">Loading...</div>");
            // actual work
            fetchTVshows(url);
        }
    });

    // import single tv show
    $resultContainer.on('click', $(".button--import"), function (e) {
        if ($(e.target).hasClass('button--import') && $(e.target).hasClass('button--update')) {
            // console.log($(e.target));
            e.preventDefault();

            $status.css('background', '#E91E63');
            $status.html(`<span>Updating. </span><div id="loader"></div>`);

            let showId = $(e.target).attr("data-show-id");
            console.log(showId);
            // $loader.show();
            fetchSingleTvShow(showId);
        } else if ($(e.target).hasClass('button--import')) {
            // console.log($(e.target));
            e.preventDefault();

            $status.css('background', '#E91E63');
            $status.html(`<span>Importing.</span><div id="loader"></div>`);

            let showId = $(e.target).attr("data-show-id");
            console.log(showId);
            // $loader.show();
            fetchSingleTvShow(showId);
        }
    });

    // select to import multiple tv shows
    $resultContainer.on('click', $(".button--select"), function (e) {
        if ($(e.target).hasClass('button--select')) {
            // console.log($(e.target));
            e.preventDefault();
            let showId = $(e.target).attr("data-select-id");

            if ($(e.target).hasClass('selected')) {
                console.log("removed show ID => " + showId);
                $(e.target).removeClass("selected");
                $(e.target).html("Select");
                let index = selectedTVshows.indexOf(showId);
                if (index > -1) {
                    selectedTVshows.splice(index, 1);
                }
            } else {
                selectedTVshows.push(showId);
                $(e.target).addClass("selected");
                $(e.target).html("Selected");
                $(".cta-2 .button").removeAttr("disabled");
                console.log("selected show ID => " + showId);
            }
            console.log(selectedTVshows)

            // if array is empty, disable load button
            if (selectedTVshows.length < 1) {
                $(".cta-2 .button").prop("disabled", true);
            }
        }
    });

    // sort tv shows
    $("#sort-tvshows").change(function (e) {
        let sortedResult = [];

        if ($(e.target).val() == "popularity") {
            sortedResult = currentVisibleTVshows.sort((a, b) => {
                if (a.popularity > b.popularity) {
                    return -1;
                }
            });
        } else if ($(e.target).val() == "vote_average") {
            sortedResult = currentVisibleTVshows.sort((a, b) => {
                if (a.vote_average > b.vote_average) {
                    return -1;
                }
            });
        } else if ($(e.target).val() == "first_air_date") {
            sortedResult = currentVisibleTVshows.sort((a, b) => {
                if (a.first_air_date > b.first_air_date) {
                    return -1;
                }
            });
        } else if ($(e.target).val() == "default") {
            sortedResult = currentVisibleTVshows;
        }

        insertFetchedTVshowToDOM(sortedResult);

    });

    // fetchMultipleTvShow(showId);
    $(".cta-2 .button").click(function (e) {
        $status.html(`<span>Importing ${selectedTVshows.length} TV-Shows.</span><div id="loader"></div>`);
        fetchMultipleTvShow(selectedTVshows);
    });

    function fetchMultipleTvShow(showArray) {
        showArray.map(async showId => {
            fetchSingleTvShow(showId);
        });

        // updateSearchResult();
    }

    // function updateSearchResult() {
    //     searchQuery = $searchField.val();
    //     url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;
    //
    //     $status.html("<span>Refreshing search result </span><div id=\"loader\">Loading...</div>");
    //     // actual work
    //     fetchTVshows(url);
    // }

})(jQuery);