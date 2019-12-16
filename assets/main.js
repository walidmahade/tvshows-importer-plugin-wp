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
    let imgPrefix = "https://image.tmdb.org/t/p/w500";
    let selectedTVshows = [];
    let currentVisibleTVshows = [];
    let visibleTvshowType = '';

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

    function startProcess(html) {
        $status.html(html + '<div id="loading"></div>')
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
        }).done(function (resData) {
            let postId = resData.id;
            let showId = resData.acf.id;
            // console.log(data);
            // console.log("Completed saving post, ID=> " + postId);
            // console.log("Poster=> " + resData.acf.poster_url);
            // get featured image & save to DB
            getFeaturedImg(postId, resData.acf.poster_url);
            // get reviews and save them
            saveReviews(postId, showId);
            // get cast/people
            saveShowCast(postId, showId);
            // get video trailer
            saveVideos(postId, showId);
            // get gallery images
            saveGalleryImages(postId, showId);

            processDone();
        }).fail(function (e) {
            // console.log("Error saving post");
            processError();
        });
    }

    function getFeaturedImg(postId, imgUrl) {
        // START saving featured image
        $status.html(`<span>saving featured image(s). This may take a while.</span><div id="loader"></div>`);

        if (imgUrl) {
            let imgObj = {
                "imgurl": imgUrl
            };

            // console.log(imgObj);

            $.ajax({
                url: `${magicalData.siteURL}/wp-json/tvshows/add-image`,
                // async: false,
                type: "POST",
                data: JSON.stringify(imgObj),
                contentType: "application/json",
                headers: {
                    "Content-Type": 'application/json;charset=UTF-8',
                    "X-WP-Nonce": magicalData.nonce
                }
            }).done(function (featured_img_id) {
                let updateObj = {
                    "featured_media": featured_img_id
                }

                updateTVshow(updateObj, postId);
                // TVshow["featured_media"] = featured_img_id;
                // console.log("saved featured image");
            });
        } else {
            $status.html("No featured image found.");
        }
        // done saving featured image
    }

    function updateTVshow(data, showId) {
        $.ajax({
            url: `${magicalData.siteURL}/wp-json/wp/v2/tvshows/${showId}`,
            // async: false,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            headers: {
                "Content-Type": 'application/json;charset=UTF-8',
                "X-WP-Nonce": magicalData.nonce
            }
        }).done(function (resData) {
            // console.log("updated => " + resData.id);
            // console.log("update object => ", resData);
            processDone();
        });
    }

    function saveReviews(postId, showId) {
        startProcess("Looking for Reviews");

        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${showId}/reviews?api_key=${apiKey}&language=en-US&page=${resultPage}`
        }).done(function (data) {
            if (data.results.length) {
                startProcess("Reviews found, saving to DataBase");

                let reviewObj = {
                    "fields": {
                        "reviews": []
                    }
                }

                data.results.map(review => {
                    reviewObj["fields"]["reviews"].push({
                        "author": review.author,
                        "content": review.content
                    });
                });

                updateTVshow(reviewObj, postId);

                processDone();

            } else {
                // console.log("no re view found for => " + showId);
                // console.log("review arr length => " + data.results.length);
                startProcess("no re view found for: " + showId);
                processDone();
            }
        })
    }

    function saveGalleryImages(postId, showId) {
        startProcess("Looking for gallery images");

        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${showId}/images?api_key=${apiKey}`
        }).done(function (data) {
            if (data.posters.length) {
                // console.log("## ## Posters found ## ## ");
                startProcess("Gallery found, getting images");

                let galleryObj = {
                    "fields": {
                        "image_gallery": []
                    }
                }

                data.posters.map((img, i) => {
                    galleryObj["fields"]["image_gallery"].push({
                        "name": i,
                        "url": imgPrefix + img.file_path
                    });
                });

                updateTVshow(galleryObj, postId);

                processDone();

            } else {
                // console.log("No posters found");
                startProcess("No posters found");
                processDone();
            }
        })
    }

    function saveShowCast(postId, showId) {
        startProcess("Adding TVshow Cast");

        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${showId}/credits?api_key=${apiKey}&language=en-US`
        }).done(function (data) {
            // console.log("Got cast ", data);

            let castObj = {
                "fields": {
                    "series_cast": []
                }
            }

            data.cast.map(person => {
                castObj["fields"]["series_cast"].push({
                    "name": person.name,
                    "character": person.character,
                    "profile_image": (person.profile_path) ? (imgPrefix + person.profile_path) : ''
                });
            });

            updateTVshow(castObj, postId);

            processDone();
        });
    }

    function saveVideos(postId, showId) {
        startProcess("Adding trailer url");

        $.ajax({
            url: `https://api.themoviedb.org/3/tv/${showId}/videos?api_key=${apiKey}&language=en-US`
        }).done(function (data) {
            if (data.results.length) {

                let showObj = {
                    "fields": {
                        "videos": []
                    }
                };

                data.results.map(video => {
                    showObj["fields"]["videos"].push({
                        "url": "https://www.youtube.com/watch?v=" + video.key
                    });
                });

                updateTVshow(showObj, postId);
                console.log(showObj);
                processDone();
            } else {
                // console.log("** ** No videos found ** **");
                startProcess("No videos found");
                processDone();
            }
        });
    }

    function insertFetchedTVshowToDOM(tvShowsArr) {
        $resultContainer.html("");
        let constructHTML = '';

        tvShowsArr.map(tvShow => {
            let tvShowDesc = truncate(tvShow.overview, 20) || "No description found.";

            constructHTML += (`
                <div class="tv-show-item" data-item-id="${tvShow.id}">
                    ${tvShow.poster_path ? '<img src="https://image.tmdb.org/t/p/w500/' + tvShow.poster_path + '" alt="" class="poster">' : ' '}
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
            // console.log(data);
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
            // console.log(data);

            let singleTvGenresArr = data.genres.map(genre => {
                return genre.name
            });

            if (visibleTvshowType === "recent") {
                singleTvGenresArr.push("Recent");
            } else if (visibleTvshowType === "top-rated") {
                singleTvGenresArr.push("Top Rated");
            } else if (visibleTvshowType === "popular") {
                singleTvGenresArr.push("Popular");
            }

            let TVshow = {
                "title": data.name,
                "content": data.overview,
                "status": "publish",
                "fields": {
                    "id": data.id,
                    "rating": data.vote_average,
                    "poster_url": data.poster_path ? imgPrefix + data.poster_path : " ",
                    "seasons_count": data.seasons.length, // now fetching only seasons
                    "seasons_list": []
                },
                "terms": {
                    "tv_genres": singleTvGenresArr
                }
            };

            // console.log("-+-++---------+++++++++");
            // console.log(singleTvGenresArr);


            $.when(
                // ------------- fetch season for current tv show
                data.seasons.map(currSeason => {
                    // ------------- fetch season + episodes
                    let seasonEpisodeList = '';
                    let seasonObj = {};

                    $.when(
                        $.ajax({
                            url: `https://api.themoviedb.org/3/tv/${data.id}/season/${currSeason.season_number}?api_key=${apiKey}&language=en-US`,
                            async: false
                        }).done(function (seasonData) {
                            // console.log("fetching season " + currSeason.season_number + " data");

                            seasonData.episodes.map((episode, key) => {
                                seasonEpisodeList += `<div>${key + 1}. ${episode.name}</div>`
                            })
                        })
                    ).then(function () {
                        seasonObj["name"] = currSeason.name;
                        seasonObj["date"] = currSeason.air_date;
                        seasonObj["poster_url"] = currSeason.poster_path ? imgPrefix + currSeason.poster_path : " ";
                        seasonObj["episode_count"] = currSeason.episode_count;
                        seasonObj["episode_list"] = seasonEpisodeList;

                        TVshow["fields"]["seasons_list"].push(seasonObj);
                    });
                })
            ).then(function () {
                // console.log("----- season list ------");
                // console.log(TVshow);
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

    function resetSearch() {
        $searchField.val('');
    }

    // search field functionality
    $searchField.keyup(function (e) {
        e.preventDefault();
        searchQuery = $searchField.val();
        resultPage = 1;

        visibleTvshowType = "search";

        url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;

        if (e.keyCode === 13) {
            // $loader.show();
            // console.log("fetching post");
            // status update
            $status.html("<span>Fetching post</span><div id=\"loader\">Loading...</div>");
            // actual work
            fetchTVshows(url);
        }
    });

    // pagination functionality
    $currentResultPageDisplay.keyup(function (e) {
        // e.preventDefault();
        searchQuery = $searchField.val();
        resultPage = $currentResultPageDisplay.val();

        if (visibleTvshowType === "search") {
            url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&page=${resultPage}&query=${searchQuery}`;
        } else if (visibleTvshowType === "recent") {
            url = `https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        } else if (visibleTvshowType === "top-rated") {
            url = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        } else if (visibleTvshowType === "popular") {
            url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        }

        if (e.keyCode === 13) {
            // console.log("fetching post");
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
            // console.log(showId);
            // $loader.show();
            fetchSingleTvShow(showId);
        } else if ($(e.target).hasClass('button--import')) {
            // console.log($(e.target));
            e.preventDefault();

            $status.css('background', '#E91E63');
            $status.html(`<span>Importing.</span><div id="loader"></div>`);

            let showId = $(e.target).attr("data-show-id");
            // console.log(showId);
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
                // console.log("removed show ID => " + showId);
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
                // console.log("selected show ID => " + showId);
            }
            // console.log(selectedTVshows)

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

    // --------------- suggest button handlers
    const $recentBtn = $("#recent-btn");
    const $topRatedBtn = $("#top-rated-btn");
    const $mostPopularBtn = $("#most-popular-btn");

    $recentBtn.click(function () {
        resetSearch();
        visibleTvshowType = "recent";
        url = `https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        $status.html("<span>Fetching post</span><div id=\"loader\">Loading...</div>");
        // actual work
        fetchTVshows(url);
    });

    $topRatedBtn.click(function () {
        resetSearch();
        visibleTvshowType = "top-rated";
        url = `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        $status.html("<span>Fetching post</span><div id=\"loader\">Loading...</div>");
        // actual work
        fetchTVshows(url);
    });

    $mostPopularBtn.click(function () {
        resetSearch();
        visibleTvshowType = "popular";
        url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=${resultPage}`;
        $status.html("<span>Fetching post</span><div id=\"loader\">Loading...</div>");
        // actual work
        fetchTVshows(url);
    });

    // ---------- select all btn
    $("#select-all-btn").click(function (e) {
        e.preventDefault();
        const selectButtons = $(".button--select");

        if (selectButtons.length) {
            selectButtons.trigger('click');
        }
    })

})(jQuery);