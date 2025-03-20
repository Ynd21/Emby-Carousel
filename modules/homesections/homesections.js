define([
    "exports",
    "./../common/servicelocator.js",
    "./../layoutmanager.js",
    "./../common/globalize.js",
    "./../cardbuilder/cardbuilder.js",
    "./../common/usersettings/usersettings.js",
    "./../emby-apiclient/connectionmanager.js",
    "./../common/appsettings.js",
    "./../registrationservices/registrationservices.js",
    "./../approuter.js",
    "./../emby-elements/emby-button/emby-button.js",
    "./../emby-elements/emby-button/paper-icon-button-light.js",
    "./../emby-elements/emby-itemscontainer/emby-itemscontainer.js",
    "./../emby-elements/emby-scroller/emby-scroller.js",
], function (_exports, _servicelocator, _layoutmanager, _globalize, _cardbuilder, _usersettings, _connectionmanager, _appsettings, _registrationservices, _approuter, _embyButton, _paperIconButtonLight, _embyItemscontainer, _embyScroller) {

    // Variables to cache Movies and TV Shows data
    let cachedMovies = null;
    let cachedTVShows = null;

    function resume(elem, options) {
        for (var elems = elem.querySelectorAll(".itemsContainer"), promises = [], i = 0, length = elems.length; i < length; i++) promises.push(elems[i].resume(options));
        elem = Promise.all(promises);
        return options && !1 === options.returnPromise ? promises[0] : elem;
    }

    function getUserViews(apiClient, userId) {
        return apiClient.getUserViews({}, userId || apiClient.getCurrentUserId()).then(function (result) {
            return result.Items;
        });
    }

    function getHorizontalScrollerStartTag(scrollButtons) {
        return (
            '<div is="emby-scroller" data-mousewheel="false" data-focusscroll="true"' +
            (!1 === scrollButtons ? ' data-scrollbuttons="false"' : "") +
            ' class="padded-top-focusscale padded-bottom-focusscale padded-left padded-left-page padded-right">'
        );
    }

    function loadLibraryTiles(elem, apiClient, index, useSmallButtons, requestedItemFields, enableFocusPreview) {
        var serverId,
            html = "",
            itemsContainerClass =
                ((html =
                    (html += '<div class="sectionTitleContainer sectionTitleContainer-cards">') +
                    ('<h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">' + _globalize.default.translate("HeaderMyMedia") + "</h2>")),
                "itemsContainer scrollSlider focusable focuscontainer-x"),
            index =
                (!_layoutmanager.default.tv && index < 2 && (itemsContainerClass += " itemsContainer-finepointerwrap"),
                useSmallButtons && (itemsContainerClass += " itemsContainer-sideFooters itemsContainer-smallSideFooters"),
                (html = (html = html + "</div>" + (getHorizontalScrollerStartTag() + '<div data-focusabletype="nearest" is="emby-itemscontainer" class="' + itemsContainerClass + '">')) + "</div>" + "</div>"),
                elem.classList.add("hide"),
                (elem.innerHTML = html),
                useSmallButtons && (_layoutmanager.default.tv ? elem.classList.add("padded-bottom") : elem.classList.add("verticalSection-extrabottompadding")),
                elem.querySelector(".itemsContainer"));
        (index.fetchData =
            ((serverId = apiClient.serverId()),
            function () {
                var apiClient = _connectionmanager.default.getApiClient(serverId);
                return getUserViews(apiClient, apiClient.getCurrentUserId());
            })),
            (index.getListOptions = (useSmallButtons
                ? function (enableFocusPreview) {
                      return function (items) {
                          return {
                              renderer: _cardbuilder.default,
                              options: {
                                  fields: ["Name"],
                                  centerText: !1,
                                  transition: !1,
                                  hoverPlayButton: !1,
                                  sideFooter: !0,
                                  image: !1,
                                  smallSideFooter: !0,
                                  multiSelect: !1,
                                  focusTransformTitleAdjust: !0,
                                  bottomPadding: enableFocusPreview ? "focuspreview" : null,
                              },
                              virtualScrollLayout: "horizontal-grid",
                          };
                      };
                  }
                : function (enableFocusPreview) {
                      return function (items) {
                          var fields = [];
                          return (
                              fields.push("Name"),
                              {
                                  renderer: _cardbuilder.default,
                                  options: { shape: "backdrop", fields: fields, transition: !1, hoverPlayButton: !1, focusTransformTitleAdjust: !0, bottomPadding: enableFocusPreview ? "focuspreview" : null },
                                  virtualScrollLayout: "horizontal-grid",
                              }
                          );
                      };
                  })(enableFocusPreview)),
            (index.parentContainer = elem),
            useSmallButtons ? index.classList.remove("cardSizeSmaller-mymedia") : index.classList.add("cardSizeSmaller-mymedia");
    }

    // Function to handle Watch Now button click
    function watchNow(event) {
        event.preventDefault();
        const url = event.target.href;
        window.location.href = url;
        window.location.reload(); // Ensures the page refreshes
    }

    // Function to get color based on the movie rating
    function getRatingColor(rating) {
        switch (rating) {
            case 'G':
                return 'green';
            case 'PG':
                return 'orange';
            case 'PG-13':
                return 'purple';
            case 'R':
                return 'red';
            case 'NC-17':
                return 'blue';
            default:
                return 'teal';
        }
    }

    // Function to get a rating string with a rocket emoji for high ratings
    function getStarRatingWithRocket(starRating) {
        const ratingValue = parseFloat(starRating.split(' ')[1]);
        if (ratingValue > 7.5) {
            return `${starRating} 🚀`;
        }
        return starRating;
    }

    // Function to safely extract runtime from item
    function getFormattedRuntime(item) {
        if (!item || !item.RunTimeTicks) return 'N/A';
        
        const minutes = Math.floor(item.RunTimeTicks / (10000 * 1000 * 60));
        if (minutes < 1) return 'N/A';
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
        }
        return `${minutes}m`;
    }

    // Function to safely extract seasons count from item
    function getSeasonsInfo(item) {
        if (!item) return 'N/A';
        return item.ChildCount ? `${item.ChildCount} Season${item.ChildCount !== 1 ? 's' : ''}` : 'N/A';
    }

    // Function to get TV show status (Running, Ended, etc.)
    function getSeriesStatus(item) {
        if (!item || !item.Status) return 'N/A';
        return item.Status;
    }

    // Function to get the premiere year
    function getPremiereYear(item) {
        if (!item || !item.PremiereDate) return 'N/A';
        return new Date(item.PremiereDate).getFullYear();
    }

    // Function to create carousel HTML
    function createCarousel(items) {
        let html = '<div class="carousel" id="latestMoviesCarousel">';
        items.forEach((item, index) => {
            // Get additional details
            let starRating = item.CommunityRating ? `⭐ ${item.CommunityRating.toFixed(1)}` : 'N/A';
            const movieRating = item.OfficialRating ? item.OfficialRating : 'N/A';
            const customRating = item.CustomRating ? item.CustomRating : 'N/A';
            const genres = item.Genres ? item.Genres.join(', ') : 'N/A';
            const ratingColor = getRatingColor(movieRating); // Get the color based on the rating
            
            // Modify starRating to include a rocket if it's above 7.5
            starRating = getStarRatingWithRocket(starRating);
            
            // Determine the emoji based on item type
            const isMovie = item.Type === 'Movie';
            const switchEmoji = isMovie ? '📺' : '🍿';
            const switchTo = isMovie ? 'Series' : 'Movie';
            
            // TV show specific info or Movie specific info
            let specializedInfo = '';
            if (isMovie) {
                // For movies, show video format, audio format, and runtime
                let videoFormat = 'N/A';
                let audioFormat = 'N/A';
                const runtime = getFormattedRuntime(item);
                
                // Check MediaSources and MediaStreams for video and audio formats
                if (item.MediaSources && item.MediaSources.length > 0) {
                    item.MediaSources.forEach(source => {
                        source.MediaStreams.forEach(stream => {
                            if (stream.Type === 'Video') {
                                videoFormat = stream.DisplayTitle || stream.VideoCodec || 'N/A';
                            } else if (stream.Type === 'Audio') {
                                audioFormat = stream.DisplayTitle || stream.AudioCodec || 'N/A';
                            }
                        });
                    });
                }
                
                specializedInfo = `
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-video" style="color: #00BFFF; margin-right: 5px;"></i>${videoFormat}</span>
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-volume-up" style="color: #FF4500; margin-right: 5px;"></i>${audioFormat}</span>
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-clock" style="color: #32CD32; margin-right: 5px;"></i>${runtime}</span>
                `;
            } else {
                // For TV shows, show seasons count, series status, and premiere year
                const seasonsInfo = getSeasonsInfo(item);
                const seriesStatus = getSeriesStatus(item);
                const premiereYear = getPremiereYear(item);
                
                specializedInfo = `
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-layer-group" style="color: #FFD700; margin-right: 5px;"></i>${seasonsInfo}</span>
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-info-circle" style="color: #1E90FF; margin-right: 5px;"></i>${seriesStatus}</span>
                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-calendar" style="color: #FF69B4; margin-right: 5px;"></i>${premiereYear}</span>
                `;
            }

            html += `<div>
                        <div class="carousel-image-container" style="position: relative;">
                            <img src="/emby/Items/${item.Id}/Images/Backdrop?maxWidth=3000" alt="${item.Name}" class="carousel-image">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.2) 100%);"></div>
                            <div class="carousel-caption" style="background: rgba(0,0,0,0.6); border-radius: 8px; padding: 25px; width: 85%; max-width: 800px; text-align: left; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                                <h5 class="carousel-logo" style="margin-bottom: 20px; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                                    <img src="/emby/Items/${item.Id}/Images/Logo?maxWidth=500" alt="${item.Name}" style="max-height: 200px; margin-bottom: 15px; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.7));" onerror="this.style.display='none'; this.parentNode.innerHTML = '<span style=\\'font-size: 38px; font-weight: bold; text-shadow: 2px 2px 4px #000;\\'>${item.Name}</span>';">
                                </h5>
                                <div class="carousel-details" style="display: flex; flex-wrap: wrap; margin-bottom: 15px; gap: 10px;">
                                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${starRating}</span>
                                    <span class="media-info" style="background-color: ${ratingColor}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${movieRating}</span>
                                    <span class="media-info" style="background: rgba(0,0,0,0.7); padding: 6px 12px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-tags" style="color: #FFD700; margin-right: 5px;"></i>${genres}</span>
                                    ${specializedInfo}
                                </div>         
                                <p class="carousel-tagline" style="margin-bottom: 20px; max-height: 100px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; font-size: 15px; line-height: 1.4; color: rgba(255,255,255,0.95); text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${item.Overview || ''}</p>
                                <div class="carousel-buttons" style="margin-top: 15px;">
                                    <a href="#" class="carousel-button more-info-button" onclick="moreInfo(event, '${item.Id}', '${item.ServerId}')" style="background: rgba(255,255,255,0.25); color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; transition: background 0.3s ease; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">More Info</a>
                                </div>
                            </div>
                            <!-- Emoji switcher positioned in the bottom right corner -->
                            <div class="carousel-emoji-switch" onclick="switchCarouselContent('${switchTo}')" style="position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 22px; color: white; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: transform 0.2s ease, background 0.3s ease; display: flex; align-items: center; justify-content: center;">${switchEmoji}</div>
                        </div>
                     </div>`;
        });
        html += '</div>';
        return html;
    }

    // Function to initialize Slick Carousel
    function initializeCarousel() {
        $('#latestMoviesCarousel').slick({
            centerMode: true,
            centerPadding: '0px', // No padding to ensure full width
            slidesToShow: 1,
            dots: true, // Enable dots
            customPaging: function(slider, i) {
                return '<div class="slick-dot" style="width: 12px; height: 12px; background: rgba(255,255,255,0.5); border-radius: 50%; margin: 0 5px;"></div>'; // Custom dot element
            },
            autoplay: true, // Enable autoplay
            autoplaySpeed: 8000, // Slide every 8 seconds (more reasonable)
            arrows: false, // Disable navigation arrows
            speed: 500, // Animation speed
            cssEase: 'cubic-bezier(0.23, 1, 0.32, 1)', // Smooth animation
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '0px',
                        slidesToShow: 1
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        arrows: false,
                        centerMode: true,
                        centerPadding: '0px',
                        slidesToShow: 1
                    }
                }
            ]
        });

        // Add CSS to improve carousel appearance
        const style = document.createElement('style');
        style.textContent = `
            .carousel-container {
                margin-bottom: 30px;
                position: relative;
            }
            .carousel-image-container {
                position: relative;
                overflow: hidden;
            }
            .carousel-image {
                width: 100%;
                height: auto;
                max-height: 70vh;
                object-fit: cover;
            }
            .carousel-emoji-switch {
                text-align: center;
                line-height: 40px; /* Match height for vertical centering */
            }
            .carousel-emoji-switch:hover {
                transform: scale(1.1);
                background: rgba(0,0,0,0.9) !important;
            }
            .carousel-buttons a:hover {
                background: rgba(255,255,255,0.4) !important;
            }
            .slick-dots {
                bottom: 15px;
                z-index: 20;
            }
            .slick-active .slick-dot {
                background: rgba(255,255,255,1) !important;
            }
            /* Removed arrow styles */
        `;
        document.head.appendChild(style);
    }

    // Function to switch carousel content between Movies and TV Shows
    function switchCarouselContent(contentType) {
        const carouselElem = document.querySelector('.carousel-container');
        if (!carouselElem) return;

        // Determine which content to load from cache
        const contentItems = contentType === 'Movie' ? cachedMovies : cachedTVShows;
        
        if (contentItems && contentItems.length > 0) {
            const carouselHtml = createCarousel(contentItems);
            carouselElem.innerHTML = carouselHtml;
            initializeCarousel(); // Re-initialize Slick carousel after updating the carousel HTML

            // Add event listeners to switch content emojis
            document.querySelectorAll('.carousel-emoji-switch').forEach(emoji => {
                emoji.onclick = () => switchCarouselContent(contentType === 'Movie' ? 'Series' : 'Movie');
            });
        }
    }

    // Function to fetch latest Movies
    function fetchLatestMovies(apiClient) {
        var userId = apiClient.getCurrentUserId();
        return apiClient.getItems(userId, {
            Fields: "PrimaryImageAspectRatio,ProductionYear,Overview,CommunityRating,OfficialRating,MediaSources,Genres,CustomRating",
            IncludeItemTypes: "Movie",
            Recursive: true,
            SortBy: "DateCreated",
            SortOrder: "Descending",
            Limit: 10
        });
    }

    // Function to fetch latest TV Shows
    function fetchLatestTVShows(apiClient) {
        var userId = apiClient.getCurrentUserId();
        return apiClient.getItems(userId, {
            Fields: "PrimaryImageAspectRatio,ProductionYear,Overview,CommunityRating,OfficialRating,MediaSources,Genres,CustomRating,ChildCount,Status,PremiereDate",
            IncludeItemTypes: "Series",
            Recursive: true,
            SortBy: "DateCreated",
            SortOrder: "Descending",
            Limit: 10
        });
    }

    _exports.default = {
        loadSections: function (options) {
            var elem = options.element,
                apiClient = options.apiClient,
                user = options.user,
                requestedItemFields = options.requestedItemFields,
                enableFocusPreview = options.enableFocusPreview,
                requestedImageTypes = options.requestedImageTypes,
                sections = _usersettings.default.getHomeScreenSections(),
                html = "",
                i = 0,
                length = sections.length;

            for (i; i < length; i++) {
                html += '<div class="verticalSection verticalSection-cards hide section' + i + '"></div>';
                if (i === 0) {
                    html += '<div class="verticalSection verticalSection-cards section-downloads hide"></div>';
                    html += '<div class="verticalSection verticalSection-cards section-appinfo hide"></div>';
                }
            }
            elem.innerHTML = html += '<div class="padded-bottom-page"></div>';
            elem.classList.add("homeSectionsContainer");

            // Insert Carousel Here
            var carouselElem = document.createElement('div');
            carouselElem.className = 'carousel-container';
            elem.insertBefore(carouselElem, elem.firstChild);

            // Fetch Latest Movies and TV Shows on Initial Load
            Promise.all([
                fetchLatestMovies(apiClient),
                fetchLatestTVShows(apiClient)
            ]).then(function(results) {
                cachedMovies = results[0].Items;
                cachedTVShows = results[1].Items;

                // Initially load Movies into the carousel
                if (cachedMovies.length) {
                    const carouselHtml = createCarousel(cachedMovies);
                    carouselElem.innerHTML = carouselHtml;
                    initializeCarousel(); // Initialize Slick carousel after adding the carousel HTML

                    // Add event listeners to switch content emojis
                    document.querySelectorAll('.carousel-emoji-switch').forEach(emoji => {
                        emoji.onclick = () => switchCarouselContent('Series'); // Initially switch to TV Shows
                    });
                }
            });

            var promises = [];
            for (i = 0, length = sections.length; i < length; i++)
                promises.push(
                    (function (page, apiClient, user, requestedItemFields, enableFocusPreview, requestedImageTypes, allSections, index) {
                        var section = allSections[index],
                            elem = (apiClient.getCurrentUserId(), page.querySelector(".section" + index));
                        switch (section) {
                            case "latestmedia":
                                return (function (elem, apiClient, user, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                    return getUserViews(apiClient, apiClient.getCurrentUserId()).then(function (userViews) {
                                        elem.classList.remove("verticalSection", "verticalSection-cards", "hide");
                                        for (var excludeViewTypes = ["playlists", "livetv", "boxsets", "channels"], i = 0, length = userViews.length; i < length; i++) {
                                            var frag,
                                                item = userViews[i];
                                            user.Configuration.LatestItemsExcludes.includes(item.Id) ||
                                                (item.Guid && user.Configuration.LatestItemsExcludes.includes(item.Guid)) ||
                                                excludeViewTypes.includes(item.CollectionType || []) ||
                                                ((frag = document.createElement("div")).classList.add("hide", "verticalSection", "verticalSection-cards"),
                                                elem.appendChild(frag),
                                                (function (elem, apiClient, parent, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                                    var html = "";
                                                    (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">'),
                                                        _layoutmanager.default.tv
                                                            ? (html += '<h2 class="sectionTitle sectionTitle-cards">' + _globalize.default.translate("LatestFromLibrary", parent.Name) + "</h2>")
                                                            : (html =
                                                                  (html =
                                                                      (html =
                                                                          html +
                                                                          ('<a is="emby-sectiontitle" href="' + _approuter.default.getRouteUrl(parent, { section: "latest" })) +
                                                                          '" class="more button-link  button-link-color-inherit sectionTitleTextButton"><h2 class="sectionTitle sectionTitle-cards">') +
                                                                      _globalize.default.translate("LatestFromLibrary", parent.Name)) + "</h2></a>");
                                                    html += "</div>";
                                                    var monitor = "music" === parent.CollectionType || "audiobooks" === parent.CollectionType ? "markplayed" : "videoplayback,markplayed",
                                                        monitor =
                                                            ((html =
                                                                (html +=
                                                                    getHorizontalScrollerStartTag() +
                                                                    '<div data-parentid="' +
                                                                    parent.Id +
                                                                    '" is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-monitor="' +
                                                                    monitor +
                                                                    '" data-virtualscrolllayout="horizontal-grid">') + "</div></div>"),
                                                            (elem.innerHTML = html),
                                                            elem.querySelector(".itemsContainer"));
                                                    (monitor.fetchData = (function (serverId, parentId, collectionType, requestedItemFields, requestedImageTypes) {
                                                        return function (query) {
                                                            var apiClient = _connectionmanager.default.getApiClient(serverId),
                                                                fields = requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear";
                                                            return (
                                                                (collectionType && "tvshows" !== collectionType) || (fields += ",Status,EndDate"),
                                                                apiClient.getLatestItems({ Limit: 16, Fields: fields, ImageTypeLimit: 1, EnableImageTypes: requestedImageTypes, ParentId: parentId })
                                                            );
                                                        };
                                                    })(apiClient.serverId(), parent.Id, parent.CollectionType, requestedItemFields, requestedImageTypes)),
                                                        (monitor.getListOptions = (function (viewType, enableFocusPreview) {
                                                            return function (items) {
                                                                var fields = [],
                                                                    lines = null;
                                                                return (
                                                                    enableFocusPreview ||
                                                                        ("photos" !== viewType && fields.push("Name"),
                                                                        ("movies" !== viewType && "tvshows" !== viewType && "musicvideos" !== viewType && viewType) || fields.push("ProductionYear"),
                                                                        ("music" !== viewType && "audiobooks" !== viewType && "tvshows" !== viewType && "musicvideos" !== viewType && viewType) || fields.push("ParentName"),
                                                                        (lines = "musicvideos" !== viewType && viewType ? 2 : 3)),
                                                                    {
                                                                        renderer: _cardbuilder.default,
                                                                        options: {
                                                                            shape: "autooverflow",
                                                                            preferThumb: "audiobooks" !== viewType && "music" !== viewType ? null : "auto",
                                                                            showChildCountIndicator: !0,
                                                                            context: "home",
                                                                            overlayPlayButton: "photos" !== viewType,
                                                                            fields: fields,
                                                                            lines: lines,
                                                                            focusTransformTitleAdjust: !0,
                                                                            bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                                        },
                                                                        virtualScrollLayout: "horizontal-grid",
                                                                    }
                                                                );
                                                            };
                                                        })((parent.Type, parent.CollectionType), enableFocusPreview)),
                                                        (monitor.parentContainer = elem);
                                                })(frag, apiClient, item, requestedItemFields, requestedImageTypes, enableFocusPreview));
                                        }
                                    });
                                })(elem, apiClient, user, requestedItemFields, requestedImageTypes, enableFocusPreview);
                            case "smalllibrarytiles":
                                return loadLibraryTiles(elem, apiClient, index, !1, 0, enableFocusPreview);
                            case "librarybuttons":
                                return loadLibraryTiles(elem, apiClient, index, !0, 0, enableFocusPreview);
                            case "resume":
                                return (function (elem, apiClient, allSections, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                    var html = "",
                                        html =
                                            ((html =
                                                (html =
                                                    (html =
                                                        (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">') +
                                                        '<h2 class="sectionTitle sectionTitle-cards">' +
                                                        _globalize.default.translate("HeaderContinueWatching") +
                                                        "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-monitor="videoplayback,markplayed" data-virtualscrolllayout="horizontal-grid">') +
                                                "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (html.fetchData = (function (serverId, allSections, requestedItemFields, requestedImageTypes) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId),
                                                query = Object.assign(
                                                    {
                                                        Recursive: !0,
                                                        Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear",
                                                        ImageTypeLimit: 1,
                                                        EnableImageTypes: requestedImageTypes,
                                                        MediaTypes: "Video",
                                                        IncludeNextUp: !allSections.includes("nextup") && null,
                                                    },
                                                    query
                                                );
                                            return apiClient.getResumableItems(apiClient.getCurrentUserId(), query);
                                        };
                                    })(apiClient.serverId(), allSections, requestedItemFields, requestedImageTypes)),
                                        (html.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [],
                                                    lines = null;
                                                return (
                                                    enableFocusPreview || (fields.push("Name"), fields.push("ProductionYear"), fields.push("ParentName"), (lines = 2)),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: {
                                                            preferThumb: !0,
                                                            shape: "backdrop",
                                                            fields: fields,
                                                            overlayPlayButton: !0,
                                                            context: "home",
                                                            centerText: !0,
                                                            cardLayout: !1,
                                                            lines: lines,
                                                            focusTransformTitleAdjust: !0,
                                                            animateProgressBar: !0,
                                                            bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                        },
                                                        virtualScrollLayout: "horizontal-grid",
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (html.parentContainer = elem);
                                })(elem, apiClient, allSections, requestedItemFields, requestedImageTypes, enableFocusPreview);
                            case "resumeaudio":
                                return (function (elem, apiClient, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                    var html = "",
                                        html =
                                            ((html =
                                                (html =
                                                    (html =
                                                        (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">') +
                                                        '<h2 class="sectionTitle sectionTitle-cards">' +
                                                        _globalize.default.translate("HeaderContinueListening") +
                                                        "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="itemsContainer focusable focuscontainer-x scrollSlider" data-monitor="audioplayback,markplayed" data-virtualscrolllayout="horizontal-grid">') +
                                                "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (html.fetchData = (function (serverId, requestedItemFields, requestedImageTypes) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId),
                                                query = Object.assign(
                                                    { Recursive: !0, Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear", ImageTypeLimit: 1, EnableImageTypes: requestedImageTypes, MediaTypes: "Audio" },
                                                    query
                                                );
                                            return apiClient.getResumableItems(apiClient.getCurrentUserId(), query);
                                        };
                                    })(apiClient.serverId(), requestedItemFields, requestedImageTypes)),
                                        (html.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [];
                                                return (
                                                    enableFocusPreview || (fields.push("Name"), fields.push("Album"), fields.push("ParentName")),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: {
                                                            preferThumb: "auto",
                                                            shape: "auto",
                                                            fields: fields,
                                                            overlayPlayButton: !0,
                                                            context: "home",
                                                            centerText: !0,
                                                            cardLayout: !1,
                                                            albumFirst: !0,
                                                            focusTransformTitleAdjust: !0,
                                                            animateProgressBar: !0,
                                                            bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                        },
                                                        virtualScrollLayout: "horizontal-grid",
                                                        commandOptions: { removeFromResume: !0 },
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (html.parentContainer = elem);
                                })(elem, apiClient, requestedItemFields, requestedImageTypes, enableFocusPreview);
                            case "latestmoviereleases":
                                return (function (elem, apiClient, requestedItemFields, enableFocusPreview) {
                                    var title = _globalize.default.translate("RecentlyReleasedMovies"),
                                        html = "",
                                        title =
                                            ((html =
                                                (html =
                                                    (html = '<div class="sectionTitleContainer sectionTitleContainer-cards"><h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">' + title + "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-virtualscrolllayout="horizontal-grid">') + "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (title.fetchData = (function (serverId, requestedItemFields) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId),
                                                minPremiereDate = new Date(Date.now());
                                            return (
                                                minPremiereDate.setFullYear(minPremiereDate.getFullYear() - 1),
                                                apiClient.getItems(
                                                    apiClient.getCurrentUserId(),
                                                    Object.assign(
                                                        {
                                                            Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear",
                                                            IncludeItemTypes: "Movie",
                                                            Recursive: !0,
                                                            SortBy: "ProductionYear,PremiereDate,SortName",
                                                            SortOrder: "Descending",
                                                            MinPremiereDate: minPremiereDate.toISOString(),
                                                        },
                                                        query
                                                    )
                                                )
                                            );
                                        };
                                    })(apiClient.serverId(), requestedItemFields)),
                                        (title.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [];
                                                return (
                                                    enableFocusPreview || (fields.push("Name"), fields.push("ProductionYear")),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: { shape: "autooverflow", fields: fields, cardLayout: !1, focusTransformTitleAdjust: !0, bottomPadding: enableFocusPreview ? "focuspreview" : null },
                                                        virtualScrollLayout: "horizontal-grid",
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (title.parentContainer = elem);
                                })(elem, apiClient, requestedItemFields, enableFocusPreview);
                            case "playlists":
                                return (function (elem, apiClient, requestedItemFields, enableFocusPreview) {
                                    var title = _globalize.default.translate("Playlists"),
                                        html = "",
                                        title =
                                            ((html =
                                                (html =
                                                    (html = '<div class="sectionTitleContainer sectionTitleContainer-cards"><h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">' + title + "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-virtualscrolllayout="horizontal-grid">') + "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (title.fetchData = (function (serverId, requestedItemFields) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId);
                                            return apiClient.getItems(
                                                apiClient.getCurrentUserId(),
                                                Object.assign({ Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear", IncludeItemTypes: "Playlist", Recursive: !0 }, query)
                                            );
                                        };
                                    })(apiClient.serverId(), requestedItemFields)),
                                        (title.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [];
                                                return (
                                                    enableFocusPreview || fields.push("Name"),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: { shape: "autooverflow", fields: fields, cardLayout: !1, focusTransformTitleAdjust: !0, bottomPadding: enableFocusPreview ? "focuspreview" : null },
                                                        virtualScrollLayout: "horizontal-grid",
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (title.parentContainer = elem);
                                })(elem, apiClient, requestedItemFields, enableFocusPreview);
                            case "collections":
                                return (function (elem, apiClient, requestedItemFields, enableFocusPreview) {
                                    var title = _globalize.default.translate("Collections"),
                                        html = "",
                                        title =
                                            ((html =
                                                (html =
                                                    (html = '<div class="sectionTitleContainer sectionTitleContainer-cards"><h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">' + title + "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-virtualscrolllayout="horizontal-grid">') + "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (title.fetchData = (function (serverId, requestedItemFields) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId);
                                            return apiClient.getItems(
                                                apiClient.getCurrentUserId(),
                                                Object.assign({ Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear", IncludeItemTypes: "BoxSet", Recursive: !0 }, query)
                                            );
                                        };
                                    })(apiClient.serverId(), requestedItemFields)),
                                        (title.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [];
                                                return (
                                                    enableFocusPreview || fields.push("Name"),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: { shape: "autooverflow", fields: fields, cardLayout: !1, focusTransformTitleAdjust: !0, bottomPadding: enableFocusPreview ? "focuspreview" : null },
                                                        virtualScrollLayout: "horizontal-grid",
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (title.parentContainer = elem);
                                })(elem, apiClient, requestedItemFields, enableFocusPreview);
                            case "activerecordings":
                                return (function (elem, activeRecordingsOnly, apiClient, requestedItemFields, enableFocusPreview) {
                                    var title = activeRecordingsOnly ? _globalize.default.translate("HeaderActiveRecordings") : _globalize.default.translate("HeaderLatestRecordings"),
                                        html = "",
                                        title =
                                            ((html =
                                                (html =
                                                    (html = '<div class="sectionTitleContainer sectionTitleContainer-cards"><h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">' + title + "</h2>") +
                                                    "</div>" +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-monitor="RecordingStarted,RecordingEnded" data-virtualscrolllayout="horizontal-grid">') +
                                                "</div></div>"),
                                            elem.classList.add("hide"),
                                            (elem.innerHTML = html),
                                            elem.querySelector(".itemsContainer"));
                                    (title.fetchData = (function (serverId, activeRecordingsOnly, requestedItemFields) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId);
                                            return apiClient.getLiveTvRecordings(
                                                Object.assign(
                                                    {
                                                        userId: apiClient.getCurrentUserId(),
                                                        Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear",
                                                        IsLibraryItem: !!activeRecordingsOnly && null,
                                                        IsInProgress: !!activeRecordingsOnly || null,
                                                    },
                                                    query
                                                )
                                            );
                                        };
                                    })(apiClient.serverId(), activeRecordingsOnly, requestedItemFields)),
                                        (title.getListOptions = (function (enableFocusPreview) {
                                            return function (items) {
                                                var fields = [],
                                                    lines = null;
                                                return (
                                                    enableFocusPreview || (fields.push("Name"), fields.push("ProductionYear"), fields.push("ParentName"), (lines = 2)),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: {
                                                            shape: "autooverflow",
                                                            fields: fields,
                                                            lines: lines,
                                                            preferThumb: !0,
                                                            cardLayout: !1,
                                                            focusTransformTitleAdjust: !0,
                                                            bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                        },
                                                        virtualScrollLayout: "horizontal-grid",
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (title.parentContainer = elem),
                                        (title.maxTotalRecordCount = 24);
                                })(elem, !0, apiClient, requestedItemFields, enableFocusPreview);
                            case "nextup":
                                return (function (elem, apiClient, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                    var html = "";
                                    (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">'),
                                        _layoutmanager.default.tv
                                            ? (html += '<h2 class="sectionTitle sectionTitle-cards">' + _globalize.default.translate("HeaderNextUp") + "</h2>")
                                            : (html =
                                                  (html =
                                                      (html =
                                                          html +
                                                          ('<a is="emby-sectiontitle" href="' + _approuter.default.getRouteUrl("nextup", { serverId: apiClient.serverId() })) +
                                                          '" class="button-link  button-link-color-inherit sectionTitleTextButton"><h2 class="sectionTitle sectionTitle-cards">') + _globalize.default.translate("HeaderNextUp")) +
                                                  "</h2></a>");
                                    (html =
                                        (html =
                                            html +
                                            "</div>" +
                                            getHorizontalScrollerStartTag() +
                                            '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-monitor="videoplayback,markplayed" data-virtualscrolllayout="horizontal-grid">') +
                                        "</div></div>"),
                                        elem.classList.add("hide"),
                                        (elem.innerHTML = html);
                                    html = elem.querySelector(".itemsContainer");
                                    (html.fetchData = (function (serverId, requestedItemFields, requestedImageTypes) {
                                        return function (query) {
                                            var apiClient = _connectionmanager.default.getApiClient(serverId);
                                            return apiClient.getNextUpEpisodes(
                                                Object.assign(
                                                    {
                                                        LegacyNextUp: !0,
                                                        Fields: requestedItemFields + ",PrimaryImageAspectRatio,ProductionYear,SeriesInfo,DateCreated",
                                                        ImageTypeLimit: 1,
                                                        EnableImageTypes: requestedImageTypes,
                                                        UserId: apiClient.getCurrentUserId(),
                                                    },
                                                    query
                                                )
                                            );
                                        };
                                    })(apiClient.serverId(), requestedItemFields, requestedImageTypes)),
                                        (html.getListOptions = (function (enableFocusPreview) {
                                            return function () {
                                                var fields = [];
                                                return (
                                                    enableFocusPreview || (fields.push("Name"), fields.push("ParentName")),
                                                    {
                                                        renderer: _cardbuilder.default,
                                                        options: {
                                                            preferThumb: !0,
                                                            shape: "backdrop",
                                                            fields: fields,
                                                            overlayPlayButton: !0,
                                                            context: "home",
                                                            centerText: !0,
                                                            cardLayout: !1,
                                                            focusTransformTitleAdjust: !0,
                                                            bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                        },
                                                        virtualScrollLayout: "horizontal-grid",
                                                        commandOptions: { removeFromNextUp: !0 },
                                                    }
                                                );
                                            };
                                        })(enableFocusPreview)),
                                        (html.parentContainer = elem);
                                })(elem, apiClient, requestedItemFields, requestedImageTypes, enableFocusPreview);
                            case "livetv":
                                return (function (elem, apiClient, user, requestedItemFields, requestedImageTypes, enableFocusPreview) {
                                    return user.Policy.EnableLiveTvAccess
                                        ? ((user = []).push(
                                              _registrationservices.default.validateFeature("livetv", { viewOnly: !0, showDialog: !1 }).then(
                                                  function () {
                                                      return Promise.resolve(!0);
                                                  },
                                                  function () {
                                                      return Promise.resolve(!1);
                                                  }
                                              )
                                          ),
                                          Promise.all(user).then(function (responses) {
                                              var html = "";
                                              responses[0]
                                                  ? (elem.classList.remove("padded-left", "padded-left-page"),
                                                    elem.classList.remove("padded-right"),
                                                    elem.classList.remove("padded-bottom"),
                                                    elem.classList.remove("verticalSection", "verticalSection-cards"),
                                                    (html =
                                                        (html =
                                                            (html =
                                                                (html =
                                                                    (html =
                                                                        (html =
                                                                            (html +=
                                                                                '<div class="verticalSection verticalSection-cards"><div class="sectionTitleContainer sectionTitleContainer-cards sectionTitleContainer-extrafocuspreviewmargin padded-left padded-left-page padded-right">') +
                                                                            '<h2 class="sectionTitle sectionTitle-cards">' +
                                                                            _globalize.default.translate("LiveTV") +
                                                                            "</h2></div>") +
                                                                        getHorizontalScrollerStartTag(!1) +
                                                                        '<div style="padding-bottom:1.5em;padding-inline-start:.4em;flex-wrap:nowrap;" data-focusabletype="nearest" class="focusable buttonItems focuscontainer-x scrollSlider padded-top padded-bottom flex align-items-center">') +
                                                                    '<a is="emby-linkbutton" href="' +
                                                                    _approuter.default.getRouteUrl("livetv", { serverId: apiClient.serverId(), section: "programs" }) +
                                                                    '" class="raised justify-content-center buttonItems-item"><i class="md-icon button-icon button-icon-left">&#xe639;</i><span>' +
                                                                    _globalize.default.translate("Programs") +
                                                                    "</span></a>") +
                                                                '<a is="emby-linkbutton" href="' +
                                                                _approuter.default.getRouteUrl("livetv", { serverId: apiClient.serverId(), section: "guide" }) +
                                                                '" class="raised justify-content-center buttonItems-item"><i class="md-icon button-icon button-icon-left autortl">&#xe1b2;</i><span>' +
                                                                _globalize.default.translate("Guide") +
                                                                "</span></a>") +
                                                            '<a is="emby-linkbutton" href="' +
                                                            _approuter.default.getRouteUrl("recordedtv", { serverId: apiClient.serverId() }) +
                                                            '" class="raised justify-content-center buttonItems-item"><i class="md-icon button-icon button-icon-left">folder</i><span>' +
                                                            _globalize.default.translate("Recordings") +
                                                            "</span></a>") +
                                                        '<a is="emby-linkbutton" href="' +
                                                        _approuter.default.getRouteUrl("livetv", { serverId: apiClient.serverId(), section: "dvrschedule" }) +
                                                        '" class="raised justify-content-center buttonItems-item"><i class="md-icon button-icon button-icon-left">&#xe916;</i><span>' +
                                                        _globalize.default.translate("Schedule") +
                                                        '</span></a></div></div></div></div><div class="verticalSection verticalSection-cards"><div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">'),
                                                    _layoutmanager.default.tv
                                                        ? (html += '<h2 class="sectionTitle sectionTitle-cards">' + _globalize.default.translate("HeaderOnNow") + "</h2>")
                                                        : (html =
                                                              (html =
                                                                  html +
                                                                  ('<a is="emby-sectiontitle" href="' + _approuter.default.getRouteUrl("livetv", { serverId: apiClient.serverId(), section: "onnow" })) +
                                                                  '" class="more button-link  button-link-color-inherit sectionTitleTextButton"><h2 class="sectionTitle sectionTitle-cards">') + _globalize.default.translate("HeaderOnNow") +
                                                              "</h2></a>"),
                                                    (html =
                                                        html +
                                                        "</div>" +
                                                        getHorizontalScrollerStartTag() +
                                                        '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-refreshinterval="300000" data-virtualscrolllayout="horizontal-grid">'),
                                                    (elem.innerHTML = html = (html += "</div>") + "</div>" + "</div>"),
                                                    ((responses = elem.querySelector(".itemsContainer")).parentContainer = elem),
                                                    (responses.fetchData = (function (serverId, requestedItemFields, requestedImageTypes) {
                                                        return function (query) {
                                                            var apiClient = _connectionmanager.default.getApiClient(serverId);
                                                            return (
                                                                (query = Object.assign(
                                                                    {
                                                                        userId: apiClient.getCurrentUserId(),
                                                                        IsAiring: !0,
                                                                        ImageTypeLimit: 1,
                                                                        EnableImageTypes: requestedImageTypes,
                                                                        Fields: requestedItemFields + ",ProgramPrimaryImageAspectRatio,PrimaryImageAspectRatio",
                                                                        EnableUserData: !1,
                                                                    },
                                                                    query
                                                                )),
                                                                _usersettings.default.addLiveTvChannelSortingToQuery(query, _globalize.default),
                                                                apiClient.getLiveTvChannels(query)
                                                            );
                                                        };
                                                    })(apiClient.serverId(), requestedItemFields, requestedImageTypes)),
                                                    (responses.getListOptions = (function (enableFocusPreview) {
                                                        return function (items) {
                                                            var fields = [];
                                                            return (
                                                                enableFocusPreview || (fields.push("CurrentProgramName"), fields.push("CurrentProgramParentName"), fields.push("CurrentProgramTime")),
                                                                {
                                                                    renderer: _cardbuilder.default,
                                                                    options: {
                                                                        preferThumb: "auto",
                                                                        inheritThumb: !1,
                                                                        shape: "autooverflow",
                                                                        fields: fields,
                                                                        showCurrentProgramImage: !0,
                                                                        showAirDateTime: !1,
                                                                        overlayPlayButton: !0,
                                                                        defaultShape: "portrait",
                                                                        action: "programlink",
                                                                        multiSelect: !1,
                                                                        focusTransformTitleAdjust: !0,
                                                                        bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                                    },
                                                                    virtualScrollLayout: "horizontal-grid",
                                                                    commandOptions: { createRecording: !1 },
                                                                }
                                                            );
                                                        };
                                                    })(enableFocusPreview)))
                                                  : (elem.classList.add("hide"),
                                                    elem.classList.add("padded-left", "padded-left-page"),
                                                    elem.classList.add("padded-right"),
                                                    elem.classList.add("padded-bottom"),
                                                    (html =
                                                        (html =
                                                            html +
                                                            ('<h2 class="sectionTitle sectionTitle-cards">' + _globalize.default.translate("DvrSubscriptionRequired", "", "")) +
                                                            '</h2><button is="emby-button" type="button" class="raised btnUnlock" style="margin: 1em 0;"><i class="md-icon md-icon-fill button-icon button-icon-left">&#xe838;</i>') +
                                                        "<span>" +
                                                        _globalize.default.translate("HeaderBecomeProjectSupporter") +
                                                        "</span>"),
                                                    (elem.innerHTML = html += "</button>"),
                                                    (function (elem, apiClient) {
                                                        apiClient
                                                            .getLiveTvChannels({ userId: apiClient.getCurrentUserId(), limit: 1, ImageTypeLimit: 1, EnableTotalRecordCount: !1, EnableImages: !1, EnableUserData: !1 })
                                                            .then(function (result) {
                                                                result.Items.length ? elem.classList.remove("hide") : elem.classList.add("hide");
                                                            });
                                                    })(elem, apiClient)),
                                                  (function (elem) {
                                                      var btnUnlock = elem.querySelector(".btnUnlock");
                                                      btnUnlock &&
                                                          btnUnlock.addEventListener("click", function (e) {
                                                              _registrationservices.default.validateFeature("livetv", { viewOnly: !0 }).then(function () {
                                                                  elem.closest(".homeSectionsContainer").dispatchEvent(new CustomEvent("settingschange", { cancelable: !1 }));
                                                              });
                                                          });
                                                  })(elem);
                                          }))
                                        : (elem.classList.add("hide"), Promise.resolve());
                                })(elem, apiClient, user, requestedItemFields, requestedImageTypes, enableFocusPreview);
                            default:
                                return (elem.innerHTML = ""), Promise.resolve();
                        }
                    })(elem, apiClient, user, requestedItemFields, enableFocusPreview, requestedImageTypes, sections, i)
                ),
                    0 === i &&
                        (promises.push(
                            (function (elem, apiClient, enableFocusPreview) {
                                elem.classList.add("hide");
                                var html = "";
                                (html =
                                    (html =
                                        (html =
                                            (html += '<div class="sectionTitleContainer sectionTitleContainer-cards padded-left padded-left-page padded-right">') +
                                            '<a is="emby-sectiontitle" href="' +
                                            _approuter.default.getRouteUrl("downloads") +
                                            '" class="more button-link  button-link-color-inherit sectionTitleTextButton"><h2 class="sectionTitle sectionTitle-cards">') + _globalize.default.translate("Downloads")) + "</h2></a>"),
                                    _layoutmanager.default.tv || (html += '<a is="emby-linkbutton" href="' + _approuter.default.getRouteUrl("managedownloads") + '" class="sectionTitleIconButton"><i class="md-icon">&#xe8B8;</i></a>');
                                (html =
                                    (html =
                                        html +
                                        "</div>" +
                                        getHorizontalScrollerStartTag() +
                                        '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider" data-virtualscrolllayout="horizontal-grid">') + "</div></div>"),
                                    (elem.innerHTML = html);
                                html = elem.querySelector(".itemsContainer");
                                (html.fetchData = (function (serverId) {
                                    return function () {
                                        var apiClient;
                                        return _servicelocator.appHost.supports("sync")
                                            ? (apiClient = _connectionmanager.default.getApiClient(serverId)).getCurrentUser().then(function (user) {
                                                  return user.Policy.EnableContentDownloading && apiClient.getLatestOfflineItems ? apiClient.getLatestOfflineItems({ Limit: 20, Filters: "IsNotFolder" }) : Promise.resolve([]);
                                              })
                                            : Promise.resolve([]);
                                    };
                                })(apiClient.serverId())),
                                    (html.getListOptions = (function (enableFocusPreview) {
                                        return function (items) {
                                            var fields = [];
                                            return (
                                                fields.push("Name"),
                                                fields.push("ProductionYear"),
                                                fields.push("ParentName"),
                                                {
                                                    renderer: _cardbuilder.default,
                                                    options: {
                                                        preferThumb: "auto",
                                                        inheritThumb: !1,
                                                        shape: "autooverflow",
                                                        fields: fields,
                                                        overlayPlayButton: !0,
                                                        context: "home",
                                                        lines: 2,
                                                        focusTransformTitleAdjust: !0,
                                                        bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                    },
                                                    virtualScrollLayout: "horizontal-grid",
                                                }
                                            );
                                        };
                                    })(enableFocusPreview)),
                                    (html.parentContainer = elem);
                            })(elem.querySelector(".section-downloads"), apiClient, enableFocusPreview)
                        ),
                        promises.push(
                            (function (elem, apiClient, enableFocusPreview) {
                                elem.classList.add("hide"),
                                    (elem.innerHTML = (function () {
                                        var html = "";
                                        return (html =
                                            (html =
                                                (html =
                                                    (html += '<div class="sectionTitleContainer sectionTitleContainer-cards">') +
                                                    '<h2 class="sectionTitle sectionTitle-cards padded-left padded-left-page padded-right">Discover Emby Premiere</h2></div>') +
                                                    '<p class="sectionTitle-cards padded-left padded-left-page padded-right">Enjoy Emby DVR, get free access to Emby apps, and more.</p>' +
                                                    getHorizontalScrollerStartTag() +
                                                    '<div is="emby-itemscontainer" data-focusabletype="nearest" class="focusable focuscontainer-x itemsContainer scrollSlider">') + "</div></div>");
                                    })()),
                                    (function (elem) {
                                        elem = elem.querySelector(".itemsContainer");
                                        elem &&
                                            elem.addEventListener("action-null", function (e) {
                                                e.target.closest(".card") && _registrationservices.default.showPremiereInfo();
                                            });
                                    })(elem);
                                var itemsContainer = elem.querySelector(".itemsContainer");
                                return (
                                    (itemsContainer.fetchData = function () {
                                        var apiClient = this,
                                            cacheKey = "lastappinfopresent5",
                                            lastDatePresented = parseInt(_appsettings.default.get(cacheKey) || "0");
                                        if (!lastDatePresented) return _appsettings.default.set(cacheKey, Date.now()), Promise.resolve([]);
                                        if (Date.now() - lastDatePresented < 1728e5) return Promise.resolve([]);
                                        return _registrationservices.default.validateFeature("dvr", { showDialog: !1, viewOnly: !0 }).then(
                                            function () {
                                                return _appsettings.default.set(cacheKey, Date.now()), [];
                                            },
                                            function () {
                                                return (
                                                    _appsettings.default.set(cacheKey, Date.now()),
                                                    (function (apiClient) {
                                                        var items = [];
                                                        return (
                                                            items.push({
                                                                Name: "",
                                                                Id: "PremiereInfo1",
                                                                ImageUrl: "https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater1.png",
                                                                PrimaryImageAspectRatio: 16 / 9,
                                                                ServerId: apiClient.serverId(),
                                                            }),
                                                            items.push({
                                                                Name: "",
                                                                Id: "PremiereInfo2",
                                                                ImageUrl: "https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater2.png",
                                                                PrimaryImageAspectRatio: 16 / 9,
                                                                ServerId: apiClient.serverId(),
                                                            }),
                                                            items.push({
                                                                Name: "",
                                                                Id: "PremiereInfo3",
                                                                ImageUrl: "https://raw.githubusercontent.com/MediaBrowser/Emby.Resources/master/apps/theater3.png",
                                                                PrimaryImageAspectRatio: 16 / 9,
                                                                ServerId: apiClient.serverId(),
                                                            }),
                                                            Promise.resolve({ Items: items, TotalRecordCount: items.length })
                                                        );
                                                    })(apiClient)
                                                );
                                            }
                                        );
                                    }.bind(apiClient)),
                                    (itemsContainer.getListOptions = (function (enableFocusPreview) {
                                        return function (items) {
                                            return {
                                                renderer: _cardbuilder.default,
                                                options: {
                                                    shape: "autooverflow",
                                                    fields: ["Name"],
                                                    contextMenu: !1,
                                                    action: "custom",
                                                    multiSelect: !1,
                                                    focusTransformTitleAdjust: !0,
                                                    bottomPadding: enableFocusPreview ? "focuspreview" : null,
                                                },
                                                virtualScrollLayout: "horizontal-grid",
                                            };
                                        };
                                    })(enableFocusPreview)),
                                    (itemsContainer.parentContainer = elem),
                                    Promise.resolve()
                                );
                            })(elem.querySelector(".section-appinfo"), apiClient, enableFocusPreview)
                        ));
            return Promise.all(promises).then(function () {
                return resume(elem, { refresh: !0, returnPromise: !1 });
            });
        },
        pause: function (elem) {
            for (var elems = elem.querySelectorAll(".itemsContainer"), i = 0, length = elems.length; i < length; i++) elems[i].pause();
        },
        resume: resume,
    };
});
