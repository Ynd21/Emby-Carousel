define([
    "exports",
    "./../emby-apiclient/connectionmanager.js",
    "./../dom.js",
    "./../common/globalize.js",
    "./../approuter.js",
    "./../layoutmanager.js",
    "./../emby-apiclient/events.js",
    "./../common/servicelocator.js",
    "./../common/pluginmanager.js",
    "./../listview/listview.js",
    "./../emby-elements/emby-button/paper-icon-button-light.js",
    "./../emby-elements/emby-itemscontainer/emby-itemscontainer.js",
    "./../viewmanager/viewmanager.js",
    "./../common/inputmanager.js",
    "./../input/keyboard.js",
    "./../focusmanager.js",
    "./../cardbuilder/cardbuilder.js",
    "./../common/itemmanager/itemmanager.js",
], function (
    _exports,
    _connectionmanager,
    _dom,
    _globalize,
    _approuter,
    _layoutmanager,
    _events,
    _servicelocator,
    _pluginmanager,
    _listview,
    _paperIconButtonLight,
    _embyItemscontainer,
    _viewmanager,
    _inputmanager,
    _keyboard,
    _focusmanager,
    _cardbuilder,
    _itemmanager
) {
    Object.defineProperty(_exports, "__esModule", { value: !0 }), (_exports.default = void 0);
    var navDrawerContentElement,
        currentServerId,
        embyCollapseLoaded,
        currentListItems,
        currentViewEvent,
        renderAbortController,
        currentDrawerType = 0,
        navDrawerScroller = document.querySelector(".mainDrawer"),
        enableLazyLoadingDrawerContents = !1;
    function loadEmbyInput() {
        return Emby.importModule("./modules/emby-elements/emby-input/emby-input.js");
    }
    function getNavDrawerContentElement() {
        return (navDrawerContentElement = navDrawerContentElement || document.querySelector(".mainDrawerScrollSlider"));
    }
    function addPluginPagesToMainMenu(links, pluginItems, section, user) {
        for (var i = 0, length = pluginItems.length; i < length; i++) {
            var href,
                pluginItem = pluginItems[i];
            if (_pluginmanager.default.allowPluginPages(pluginItem.PluginId)) {
                if (user) {
                    if (!pluginItem.EnableInUserMenu) continue;
                } else if (!pluginItem.EnableInMainMenu) continue;
                (!user && pluginItem.MenuSection !== section) ||
                    ((href = pluginItem.Href || _pluginmanager.default.getConfigurationPageUrl(pluginItem.Name)),
                    user && (href += "&userId=" + user.Id),
                    links.push({ Name: pluginItem.DisplayName, Icon: pluginItem.MenuIcon || "folder", href: href, navMenuId: pluginItem.NavMenuId || "/" + href }));
            }
        }
    }
    function getAdminMenuItems(apiClient, user, signal) {
        return _approuter.default.getRouteInfo(_approuter.default.getRouteUrl("manageserver")) && user.Policy.IsAdministrator
            ? apiClient.getConfigurationPages({ EnableInMainMenu: !0, UserId: user.Id }, signal).then(
                  function (items) {
                      return (
                          (items = items),
                          (links = [
                              { Name: _globalize.default.translate("Server") },
                              { Name: _globalize.default.translate("Dashboard"), href: _approuter.default.getRouteUrl("manageserver"), Icon: "dashboard" },
                              { Name: _globalize.default.translate("Settings"), href: "/dashboard/settings", Icon: "settings" },
                              { Name: _globalize.default.translate("Users"), href: "/users", Icon: "people" },
                              { Name: "Emby Premiere", href: "/embypremiere", Icon: "star" },
                              { Name: _globalize.default.translate("Library"), href: "/librarysetup/libraries", Icon: "folder" },
                          ]).push({ Name: _globalize.default.translate("LiveTV"), href: "/livetvsetup", Icon: "dvr" }),
                          links.push({ Name: _globalize.default.translate("Network"), Icon: "wifi", href: "/network" }),
                          links.push({ Name: _globalize.default.translate("Transcoding"), Icon: "transform", href: "/transcoding" }),
                          links.push({ Name: _globalize.default.translate("Database"), href: "/database", Icon: "storage" }),
                          links.push({ Name: _globalize.default.translate("Conversions"), Icon: "sync", href: "/conversions?mode=convert" }),
                          links.push({ Name: _globalize.default.translate("HeaderScheduledTasks"), href: "/scheduledtasks", Icon: "schedule" }),
                          links.push({ Name: _globalize.default.translate("Logs"), href: "/logs", Icon: "folder_open" }),
                          addPluginPagesToMainMenu(links, items, "server"),
                          links.push({ divider: !0, Name: _globalize.default.translate("Devices") }),
                          links.push({ Name: _globalize.default.translate("Devices"), href: "/devices", Icon: "devices" }),
                          links.push({ Name: _globalize.default.translate("Downloads"), Icon: "&#xe5db;", href: "/serverdownloads" }),
                          links.push({ Name: _globalize.default.translate("HeaderCameraUpload"), href: "/devices/cameraupload.html", Icon: "photo_camera" }),
                          addPluginPagesToMainMenu(links, items, "devices"),
                          links.push({ divider: !0, Name: _globalize.default.translate("Advanced") }),
                          links.push({ Name: _globalize.default.translate("Plugins"), Icon: "add_shopping_cart", href: "/plugins" }),
                          links.push({ Name: _globalize.default.translate("HeaderApiKeys"), href: "/apikeys", Icon: "vpn_key" }),
                          links.push({ Name: _globalize.default.translate("MetadataManager"), href: "/metadatamanager", Icon: "edit" }),
                          addPluginPagesToMainMenu(links, items),
                          links
                      );
                      var links;
                  },
                  function (err) {
                      return [];
                  }
              )
            : Promise.resolve([]);
    }
    function sortRoutes(a, b) {
        var aOrder = null == a.order ? 1e3 : a.order,
            bOrder = null == b.order ? 1e3 : b.order;
        return bOrder < aOrder
            ? 1
            : aOrder < bOrder
            ? -1
            : ((aOrder = (aOrder = a.title) && _globalize.default.translate(aOrder)), (bOrder = (bOrder = b.title) && _globalize.default.translate(bOrder)) < aOrder ? 1 : aOrder < bOrder ? -1 : 0);
    }
    function getUserSettingsRoutes(user, apiClient, loggedInUser) {
        var routes = _approuter.default.getRoutes().filter(function (r) {
                return (function (route, user, loggedInUser) {
                    return "settings" === route.type && "user" === route.settingsType && _approuter.default.validateUserAccessToRoute(route, user, loggedInUser);
                })(r, user, loggedInUser);
            }),
            restrictedFeatures = user.Policy.RestrictedFeatures || [];
        return (routes = (routes = routes.filter(function (r) {
            return !((r.featureId && restrictedFeatures.includes(r.featureId)) || (r.minServerVersion && !apiClient.isMinServerVersion(r.minServerVersion)));
        })).sort(sortRoutes));
    }
    function mapRouteToMenuItem(route, user) {
        var path = route.path;
        return path && "settings" === route.type && "user" === route.settingsType && (path = (path += "?userId=" + user.Id) + "&serverId=" + user.ServerId), { Name: _globalize.default.translate(route.title), href: path, Icon: route.icon };
    }
    function getAppSettingsMenuItems(options) {
        var items = [],
            user = options.user,
            routes =
                (!1 !== options.home &&
                    (items.push({ Name: _globalize.default.translate("Home"), Icon: "&#xe88a;", ItemClass: "drawer-home", href: _approuter.default.getRouteUrl("home") }),
                    items.push({ Name: _globalize.default.translate("Search"), Icon: "&#xe8b6;", href: "#", onclick: "search", ItemClass: "drawer-search" })),
                items.push({ Name: user.Name, section: "user" }),
                _approuter.default
                    .getRoutes()
                    .filter(function (r) {
                        return "settings" === r.type && "user" !== r.settingsType;
                    })
                    .sort(sortRoutes));
        if (routes.length) {
            items.push({ Name: _servicelocator.appHost.appName() });
            for (var i = 0, length = routes.length; i < length; i++) items.push(mapRouteToMenuItem(routes[i], user));
        }
        return Promise.resolve(items);
    }
    function loadEmbyCollapse() {
        return embyCollapseLoaded ? Promise.resolve() : ((embyCollapseLoaded = !0), Emby.importModule("./modules/emby-elements/emby-collapse/emby-collapse.js"));
    }
    function getItemsSection(options, title, expanded, listType) {
        var html = "",
            headerClass = "navMenuHeader secondaryText";
        return (
            options.itemClass && (headerClass += " navMenuHeader-" + options.itemClass),
            options.headerClass && (headerClass += " " + options.headerClass),
            _layoutmanager.default.tv && (headerClass += " navMenuHeader-tv"),
            (html +=
                '<div is="emby-collapse" title="' +
                title +
                '" data-expanded="' +
                expanded +
                '" class="navDrawerCollapseSection focuscontainer-x navDrawerItemsSection" data-headerclass="' +
                headerClass +
                '" data-buttonclass="navDrawerCollapseButton noautofocus" data-iconclass="navDrawerCollapseIcon">') +
                ('<div is="emby-itemscontainer" class="navDrawerItemsContainer itemsContainer vertical-list collapseContent navDrawerCollapseContent" data-fromserver="true" data-listtype="' + listType + '">') +
                "</div></div>"
        );
    }
    function getItemsHtml(items, options) {
        options.isGlobalList ? (currentListItems = items) : (options.listItems = items);
        for (
            var icon,
                title,
                buttonClass,
                menuHtml = "",
                collapsible =
                    (!1 === options.header ||
                        _layoutmanager.default.tv ||
                        (_layoutmanager.default.tv
                            ? (menuHtml +=
                                  '<div class="navDrawerHeader navDrawerHeader-tv flex flex-direction-row align-items-center"><div class="flex-grow"><h2 class="navDrawerLogo navDrawerLogo-tv pageTitleWithLogo pageTitleWithDefaultLogo flex-grow"></h2>')
                            : ((menuHtml += '<div class="navDrawerHeader flex flex-direction-row align-items-center">'),
                              !1 !== options.drawerOptions &&
                                  (menuHtml += '<button type="button" is="paper-icon-button-light" class="btnToggleNavDrawer noautofocus" title="" style="font-size:80%;margin-inline-end:0;"><i class="md-icon">menu</i></button>'),
                              (menuHtml =
                                  menuHtml +
                                  ('<a is="emby-linkbutton" class="noautofocus btnNavDrawerLogo flex-grow" href="' +
                                      _approuter.default.getRouteUrl("home") +
                                      '" title="' +
                                      _globalize.default.translate("Home") +
                                      '" aria-label="' +
                                      _globalize.default.translate("Home")) +
                                  '"><h2 class="navDrawerLogo pageTitleWithLogo pageTitleWithDefaultLogo flex-grow"></h2>')),
                        _layoutmanager.default.tv ? (menuHtml += "</div>") : (menuHtml += "</a>"),
                        _layoutmanager.default.tv ||
                            ((buttonClass = enableLazyLoadingDrawerContents
                                ? ((icon = "view_sidebar"), (title = _globalize.default.translate("HeaderPinSidebar")), " btnPinNavDrawer-iconpin")
                                : ((icon = "close"), (title = _globalize.default.translate("Close")), " btnPinNavDrawer-hovershow")),
                            !1 !== options.drawerOptions
                                ? (menuHtml +=
                                      '<button type="button" is="paper-icon-button-light" class="btnPinNavDrawer noautofocus secondaryText' +
                                      buttonClass +
                                      '" title="' +
                                      title +
                                      '" aria-label="' +
                                      title +
                                      '"><i class="md-icon btnPinNavDrawerIcon autortl">' +
                                      icon +
                                      "</i></button>")
                                : (menuHtml += '<div style="visibility:hidden;" class="btnPinNavDrawer secondaryText paper-icon-button-light' + buttonClass + '"><i class="md-icon btnPinNavDrawerIcon autortl">' + icon + "</i></div>")),
                        (menuHtml += "</div></div>")),
                    !1 !== options.collapsible && !_layoutmanager.default.tv),
                sectionClose = collapsible ? "</div></div>" : "</div>",
                isSectionOpen = !1,
                serverId = options.serverId,
                userId = null == (title = options.user) ? void 0 : title.Id,
                defaultItemsContainerClass = ("navDrawerItemsContainer " + (options.itemsContainerClass || "")).trim(),
                i = 0,
                length = items.length;
            i < length;
            i++
        ) {
            var headerClass,
                itemsContainerClass,
                item = items[i];
            item.section && isSectionOpen && ((isSectionOpen = !1), (menuHtml += sectionClose)),
                "playlists" === item.section
                    ? (menuHtml += getItemsSection(options, _globalize.default.translate("Playlists"), !0, "playlists"))
                    : "collections" === item.section
                    ? (menuHtml += getItemsSection(options, _globalize.default.translate("Collections"), !1, "collections"))
                    : item.href
                    ? isSectionOpen || ((isSectionOpen = !0), (menuHtml += '<div is="emby-itemscontainer" class="' + defaultItemsContainerClass + ' itemsContainer vertical-list" data-listindex="' + i + '"></div>'))
                    : item.Name &&
                      (isSectionOpen && ((isSectionOpen = !1), (menuHtml += sectionClose)),
                      (headerClass = "navMenuHeader secondaryText"),
                      options.itemClass && (headerClass += " navMenuHeader-" + options.itemClass),
                      options.headerClass && (headerClass += " " + options.headerClass),
                      _layoutmanager.default.tv && (headerClass += " navMenuHeader-tv"),
                      0 === i && (headerClass += " navMenuHeader-first"),
                      (itemsContainerClass = defaultItemsContainerClass + " itemsContainer vertical-list"),
                      collapsible
                          ? (loadEmbyCollapse(),
                            (menuHtml +=
                                '<div is="emby-collapse" title="' +
                                item.Name +
                                '" data-expanded="true" class="navDrawerCollapseSection focuscontainer-x" data-headerclass="' +
                                headerClass +
                                '" data-buttonclass="navDrawerCollapseButton noautofocus" data-iconclass="navDrawerCollapseIcon">'),
                            (itemsContainerClass += " collapseContent navDrawerCollapseContent"))
                          : ((menuHtml += '<h3 class="' + headerClass + '">'),
                            item.imageUrl && (menuHtml += '<img src="' + item.imageUrl + '" class="navMenuHeaderImage" />'),
                            (menuHtml = menuHtml + item.Name + "</h3>"),
                            (itemsContainerClass += " focuscontainer-x")),
                      (menuHtml += '<div is="emby-itemscontainer" class="' + itemsContainerClass + '" data-listindex="' + (i + 1) + '"'),
                      serverId && (menuHtml += ' data-serverid="' + serverId + '"'),
                      userId && (menuHtml += ' data-userid="' + userId + '"'),
                      item.section && (menuHtml += ' data-section="' + item.section + '"'),
                      (menuHtml += ">"),
                      (isSectionOpen = !0));
        }
        return isSectionOpen && ((isSectionOpen = !1), (menuHtml += sectionClose)), menuHtml;
    }
    function getSettingsDrawerHtml(options) {
        return (function (options) {
            var apiClient = options.apiClient,
                user = options.user,
                signal = options.signal,
                promises = [];
            return (
                !1 !== options.appSettings && promises.push(getAppSettingsMenuItems(options)),
                !1 !== options.serverSettings && promises.push(getAdminMenuItems(apiClient, user, signal)),
                Promise.all(promises).then(function (responses) {
                    var items = responses[0];
                    return (items = 0 < responses.length ? items.concat(responses[1]) : items);
                })
            );
        })(options).then(function (items) {
            return (options.drawerOptions = !1), getItemsHtml(items, options);
        });
    }
    function getLibraryDrawerHtml(apiClient, signal) {
        return apiClient.getCurrentUser({ signal: signal }).then(function (user) {
            return (function (apiClient) {
                return apiClient.getUserViews({}, apiClient.getCurrentUserId()).then(function (result) {
                    for (var items = result.Items, list = [], i = 0, length = items.length; i < length; i++) {
                        var view = items[i];
                        list.push(view);
                    }
                    return list;
                });
            })(apiClient).then(function (result) {
                var items = result,
                    menuItems = [];
                _layoutmanager.default.tv || menuItems.push({ Name: _globalize.default.translate("Expand"), Icon: "&#xe5d2;", href: "#", onclick: "menu", Id: "btnExpandMiniDrawer" }),
                    _layoutmanager.default.tv &&
                        (menuItems.push({
                            Name: user.Name,
                            Icon: _itemmanager.default.getDefaultIcon({ Type: "User" }),
                            href: "#",
                            onclick: "changeuser",
                            ImageUrl: (function (user, apiClient, options) {
                                return ((options = options || {}).type = "Primary"), user.PrimaryImageTag ? ((options.tag = user.PrimaryImageTag), apiClient.getUserImageUrl(user.Id, options)) : null;
                            })(user, apiClient),
                        }),
                        _servicelocator.appHost.supports("multiserver")) &&
                        menuItems.push({ Name: apiClient.serverName(), Icon: _itemmanager.default.getDefaultIcon({ Type: "Server" }), href: "#", onclick: "selectserver" }),
                    _layoutmanager.default.tv || menuItems.push({ Name: _globalize.default.translate("Home"), Icon: "&#xe88a;", ItemClass: "drawer-home", href: _approuter.default.getRouteUrl("home") }),
                    menuItems.push({ Name: _globalize.default.translate("Search"), Icon: "&#xe8b6;", href: "#", onclick: "search", ItemClass: "drawer-search", navMenuId: "search" }),
                    // Add the new "Request Media" button here
                    menuItems.push({ Name: _globalize.default.translate("Request Media"), Icon: "&#xe148;", href: "#", ItemClass: "drawer-request" }),
                    _layoutmanager.default.tv && menuItems.push({ Name: _globalize.default.translate("Home"), Icon: "&#xe88a;", ItemClass: "drawer-home", href: _approuter.default.getRouteUrl("home") }),
                    _layoutmanager.default.tv && menuItems.push({ Name: _globalize.default.translate("Settings"), Icon: "&#xe8B8;", href: "#", onclick: "settings" }),
                    menuItems.push({ Name: _globalize.default.translate("HeaderMyMedia") }),
                    user.Policy.EnableContentDownloading &&
                        _servicelocator.appHost.supports("sync") &&
                        menuItems.push({ Name: _globalize.default.translate("Downloads"), href: _approuter.default.getRouteUrl("downloads"), Icon: "&#xe2C7;" });
                for (var i = 0, length = items.length; i < length; i++) {
                    var item = items[i],
                        url = _approuter.default.getRouteUrl(item);
                    (item.href = url), menuItems.push(item);
                }
                return (
                    user.Policy.IsAdministrator &&
                        _approuter.default.getRouteInfo(_approuter.default.getRouteUrl("manageserver")) &&
                        !_layoutmanager.default.tv &&
                        menuItems.push({ Name: _globalize.default.translate("MetadataManager"), href: "/metadatamanager", Icon: "&#xe2C7;" }),
                    _layoutmanager.default.tv || (menuItems.push({ section: "playlists" }), menuItems.push({ section: "collections" })),
                    getItemsHtml(menuItems, { isGlobalList: !0 })
                );
            }).then(function (html) {
                var container = document.querySelector('.mainDrawerScrollSlider');
                container.innerHTML = html;
    
                // Add event listener to open "Request Media" in a new tab
                document.querySelectorAll('.drawer-request').forEach(function (element) {
                    element.addEventListener('click', function (event) {
                        event.preventDefault();
                        window.open('https://YOUR.LINK.HERE', '_blank', 'noopener noreferrer');
                    });
                });
    
                return container;
            });
        });
    }
    function getDrawerHtml(type, signal) {
        var apiClient = currentServerId ? _connectionmanager.default.getApiClient(currentServerId) : _connectionmanager.default.currentApiClient();
        return 1 === type && currentServerId
            ? getLibraryDrawerHtml(apiClient, signal)
            : 2 === type
            ? (function (apiClient, signal) {
                  return apiClient.getCurrentUser({ signal: signal }).then(function (user) {
                      return getSettingsDrawerHtml({ apiClient: apiClient, user: user, loggedInUser: user, signal: signal, isGlobalList: !0 });
                  });
              })(apiClient, signal)
            : Promise.resolve("");
    }
    function getListOptions(items) {
        var _options$itemClass = null == (_options$itemClass = this.itemClass) ? void 0 : _options$itemClass.includes("settings");
        return {
            renderer: _listview.default,
            options: {
                action: "link",
                image: !0,
                fields: ["Name"],
                enableUserDataButtons: !1,
                moreButton: !1,
                highlight: !1,
                mediaInfo: !1,
                dropTarget: !0,
                itemClass: ("navMenuOption navDrawerListItem " + (this.itemClass || "")).trim(),
                contentWrapperClass: _layoutmanager.default.tv && !_options$itemClass ? "navMenuOption-listItem-content-reduceleftpadding" : "navMenuOption-listItem-content",
                listItemBodyClassName: ("navDrawerListItemBody " + (_layoutmanager.default.tv ? "navDrawerListItemBody-tv " : "") + (this.listItemBodyClass || "")).trim(),
                imageContainerClass: "navDrawerListItemImageContainer navDrawerListItemImageContainer-transparent",
                hoverPlayButton: !1,
                multiSelect: !1,
                draggable: !1,
                draggableXActions: !1,
                iconClass: "navDrawerListItemIcon" + (_layoutmanager.default.tv ? " navDrawerListItemIcon-tv" : ""),
                imagePlayButton: !1,
                largeFont: !1,
                enableSideMediaInfo: !1,
                iconSpacing: !0,
                noTextWrap: !0,
                allowBorderXOffset: !1,
            },
            virtualScrollLayout: "vertical-list",
        };
    }
    function getUserMenuItems(serverId, userId, includeFromServer) {
        var apiClient = _connectionmanager.default.getApiClient(serverId);
        return apiClient.getUser(userId).then(function (user) {
            return apiClient.getCurrentUser().then(function (loggedInUser) {
                return (includeFromServer
                    ? (function (apiClient, user, signal) {
                          return apiClient.getConfigurationPages({ EnableInUserMenu: !0, UserId: user.Id }, signal).then(
                              function (items) {
                                  var links = [];
                                  return addPluginPagesToMainMenu(links, items, null, user), links;
                              },
                              function (err) {
                                  return [];
                              }
                          );
                      })(apiClient, user)
                    : Promise.resolve([])
                ).then(function (serverItems) {
                    var items = (items = getUserSettingsRoutes(user, apiClient, loggedInUser).map(function (i) {
                        return mapRouteToMenuItem(i, user);
                    })).concat(serverItems);
                    return (
                        _connectionmanager.default.isLoggedIntoConnect() &&
                            "ios" === globalThis.appMode &&
                            items.push({ Name: _globalize.default.translate("DeleteEmbyConnectAccount"), href: "#", Icon: "&#xef66;", onclick: "deleteembyconnectaccount" }),
                        items
                    );
                });
            });
        });
    }
    function getNavMenuItemsResult() {
        var serverId,
            allListItems = this.listItems,
            itemsContainer = this.itemsContainer;
        return ("user" === itemsContainer.getAttribute("data-section")
            ? getUserMenuItems(
                  (serverId = itemsContainer.getAttribute("data-serverid") || _connectionmanager.default.currentApiClient().serverId()),
                  itemsContainer.getAttribute("data-userid") || _connectionmanager.default.getApiClient(serverId).getCurrentUserId(),
                  "true" === itemsContainer.getAttribute("data-fromserver")
              )
            : Promise.resolve(
                  (function (index, allListItems) {
                      for (var items = allListItems.slice(index), i = 0, length = items.length; i < length; i++) if (!items[i].href) return (items.length = i), items;
                      return items;
                  })(parseInt(itemsContainer.getAttribute("data-listindex")), allListItems)
              )
        ).then(function (items) {
            return { Items: items, TotalRecordCount: items.length };
        });
    }
    function getNavMenuListOptionsInternal(items, options, enableOverview) {
        var fields = ["Name"];
        if ((enableOverview && fields.push("ShortOverview"), options.asideIcon)) for (var i = 0, length = items.length; i < length; i++) items[i].asideIcon = "&#xe5cc;";
        var _items$ = null != (_items$ = items[0]) && _items$.ServerId ? _connectionmanager.default.getApiClient(items[0]) : null,
            _items$ = null == _items$ ? void 0 : _items$.getCurrentUserCached(),
            _options$itemClass2 = (items.length, null == (_options$itemClass2 = options.itemClass) ? void 0 : _options$itemClass2.includes("settings"));
        return {
            renderer: _listview.default,
            options: {
                action: "custom",
                fields: fields,
                enableUserDataButtons: !1,
                moreButton: !1,
                highlight: null != options.highlight && options.highlight,
                border: options.border,
                mediaInfo: !1,
                dropTarget: !1,
                itemClass: ("navMenuOption navDrawerListItem " + (options.itemClass || "")).trim(),
                contentWrapperClass: _layoutmanager.default.tv && !_options$itemClass2 ? "navMenuOption-listItem-content-reduceleftpadding" : "navMenuOption-listItem-content",
                listItemBodyClassName: ("navDrawerListItemBody " + (_layoutmanager.default.tv ? "navDrawerListItemBody-tv " : "") + (options.listItemBodyClass || "")).trim(),
                imageContainerClass: "navDrawerListItemImageContainer" + (_layoutmanager.default.tv ? " navDrawerListItemImageContainer-tv" : "") + (enableOverview ? " navDrawerListItemImageContainer-padded" : ""),
                hoverPlayButton: !1,
                multiSelect: !1,
                contextMenu: 0 < items.length && null != _items$ && 0 < _itemmanager.default.getCommands({ items: [items[0]], user: _items$ }).length,
                draggable: !1,
                draggableXActions: !1,
                iconClass: "navDrawerListItemIcon" + (_layoutmanager.default.tv ? " navDrawerListItemIcon-tv" : ""),
                imagePlayButton: !1,
                tooltip: !0,
                preferIcon: !enableOverview,
                addImageSizeToUrl: !0,
                enableSideMediaInfo: !1,
                iconSpacing: !0,
                noTextWrap: !0,
                allowBorderXOffset: !0 === options.allowBorderXOffset,
                itemBackground: options.itemBackground,
            },
            virtualScrollLayout: "vertical-list",
        };
    }
    function getFirstNavMenuListOptions(items) {
        return getNavMenuListOptionsInternal.call(this, items, this, _layoutmanager.default.tv);
    }
    function getNavMenuListOptions(items) {
        return getNavMenuListOptionsInternal.call(this, items, this);
    }
    function onItemsContainerUpgrade() {
        return this.resume({ refresh: !0 });
    }
    function initItemsContainers(elem, options) {
        var apiClient = currentServerId ? _connectionmanager.default.getApiClient(currentServerId) : _connectionmanager.default.currentApiClient(),
            itemsContainers = elem.querySelectorAll(".itemsContainer"),
            promises = [];
        (options = options || {}), _layoutmanager.default.tv || promises.push(loadEmbyInput());
        for (var i = 0, length = itemsContainers.length; i < length; i++) {
            var itemsContainer = itemsContainers[i],
                type = itemsContainer.getAttribute("data-listtype");
            if ("playlists" === type)
                (itemsContainer.fetchData = (function (serverId) {
                    return function () {
                        var apiClient = _connectionmanager.default.getApiClient(serverId);
                        return apiClient.getItems(apiClient.getCurrentUserId(), { Fields: "PrimaryImageAspectRatio", Recursive: !0, IncludeItemTypes: "Playlist" });
                    };
                })(apiClient.serverId())),
                    (itemsContainer.getListOptions = getListOptions.bind(options)),
                    (itemsContainer.parentContainer = itemsContainer.closest(".navDrawerCollapseSection"));
            else if ("collections" === type)
                (itemsContainer.fetchData = (function (serverId) {
                    return function () {
                        var apiClient = _connectionmanager.default.getApiClient(serverId);
                        return apiClient.getItems(apiClient.getCurrentUserId(), { Fields: "PrimaryImageAspectRatio", Recursive: !0, IncludeItemTypes: "BoxSet" });
                    };
                })(apiClient.serverId())),
                    (itemsContainer.getListOptions = getListOptions.bind(options)),
                    (itemsContainer.parentContainer = itemsContainer.closest(".navDrawerCollapseSection"));
            else {
                if (!itemsContainer.hasAttribute("data-listindex") && !itemsContainer.hasAttribute("data-section")) continue;
                (itemsContainer.fetchData = getNavMenuItemsResult.bind({ itemsContainer: itemsContainer, listItems: options.listItems || currentListItems })),
                    "0" === itemsContainer.getAttribute("data-listindex")
                        ? (itemsContainer.getListOptions = options.getNavMenuListOptions || getFirstNavMenuListOptions.bind(options))
                        : (itemsContainer.getListOptions = options.getNavMenuListOptions || getNavMenuListOptions.bind(options)),
                    itemsContainer.addEventListener("action-null", onItemAction);
            }
            (itemsContainer.afterRefresh = afterItemsContainerRefresh),
                itemsContainer.resume
                    ? promises.push(onItemsContainerUpgrade.call(itemsContainer))
                    : promises.push(
                          (function (itemsContainer) {
                              return new Promise(function (resolve, reject) {
                                  _dom.default.addEventListener(
                                      itemsContainer,
                                      "upgraded",
                                      function () {
                                          onItemsContainerUpgrade.call(itemsContainer).then(resolve);
                                      },
                                      { once: !0 }
                                  );
                              });
                          })(itemsContainer)
                      );
        }
        return (elem.itemsContainers = itemsContainers), Promise.all(promises);
    }
    function triggerSearch(e, txtNavDrawerSearch) {
        txtNavDrawerSearch = txtNavDrawerSearch.value;
        _inputmanager.default.trigger("search", { sourceElement: _viewmanager.default.currentView(), originalEvent: e, value: txtNavDrawerSearch });
    }
    function onTxtSearchInput(e) {
        switch (e.detail.command) {
            case "select":
                triggerSearch(e, this);
                break;
            case "down":
                this.focusSelectionDialog(), e.preventDefault();
        }
    }
    function onTxtSearchKeydown(e) {
        "Enter" !== _keyboard.default.normalizeKeyFromEvent(e) || e.repeat || (this.closeSelectionDialog(), triggerSearch(e, this));
    }
    function onTextSearchFocus(e) {
        this._selectionOpen || triggerSearch(e, this);
    }
    function onTextSearchInput(e) {
        this.value || triggerSearch(e, this);
    }
    function onTextSearchItemSelected(e) {
        _approuter.default.showItem(e.detail.item);
    }
    function onTextSearchItemSelectionOpen(e) {
        this._selectionOpen = !0;
    }
    function onTextSearchItemSelectionClose(e) {
        this._selectionOpen = !1;
    }
    function onTextSearchItemSelectionCancelled(e) {
        _focusmanager.default.focus(this);
    }
    function afterItemsContainerRefresh() {
        var searchTextHtml;
        currentViewEvent && updateSelectedItemForItemsContainer(this, currentViewEvent),
            "true" !== this.getAttribute("data-fromserver")
                ? (this.setAttribute("data-fromserver", "true"), this.refreshItems())
                : this.querySelector(".drawer-home") &&
                  ((searchTextHtml = '<div class="inputContainer navDrawerSearchFieldContainer">'),
                  (searchTextHtml =
                      (searchTextHtml += '<i class="md-icon navDrawerSearchIcon secondaryText">search</i>') +
                      '<input is="emby-input" type="search" labelclass="navDrawerSearchFieldContainer-label" label="" placeholder="' +
                      _globalize.default.translate("Search") +
                      '" title="' +
                      _globalize.default.translate("Search") +
                      '" data-autocompleteitems="true" class="txtNavDrawerSearch" data-refocus="false" />'),
                  this.insertAdjacentHTML("afterbegin", (searchTextHtml += "</div>")),
                  (searchTextHtml = this.querySelector(".txtNavDrawerSearch")),
                  _inputmanager.default.on(searchTextHtml, onTxtSearchInput),
                  _dom.default.addEventListener(searchTextHtml, "keydown", onTxtSearchKeydown, {}),
                  searchTextHtml.addEventListener("focus", onTextSearchFocus),
                  searchTextHtml.addEventListener("input", onTextSearchInput),
                  searchTextHtml.addEventListener("itemselected", onTextSearchItemSelected),
                  searchTextHtml.addEventListener("selectionopen", onTextSearchItemSelectionOpen),
                  searchTextHtml.addEventListener("selectionclose", onTextSearchItemSelectionClose),
                  searchTextHtml.addEventListener("selectioncancel", onTextSearchItemSelectionCancelled),
                  (searchTextHtml.getItems = function (query) {
                      var apiClient = currentServerId ? _connectionmanager.default.getApiClient(currentServerId) : _connectionmanager.default.currentApiClient();
                      return (
                          ((query = Object.assign({ SearchTerm: this.value, Recursive: !0, Fields: "PrimaryImageAspectRatio,PremiereDate,ProductionYear", EnableUserData: !1, GroupProgramsBySeries: !0 }, query)).Limit = 30),
                          apiClient.getItems(apiClient.getCurrentUserId(), query)
                      );
                  }.bind(searchTextHtml)));
    }
    function onSetInnerHtmlCallback(html) {
        var elem;
        null != html &&
            (html || (currentDrawerType = 0),
            (elem = getNavDrawerContentElement()),
            _layoutmanager.default.tv
                ? (elem.classList.remove("mainDrawerScrollSlider-autofont"), navDrawerScroller.classList.add("mainDrawer-tv"))
                : (elem.classList.add("mainDrawerScrollSlider-autofont"), navDrawerScroller.classList.remove("mainDrawer-tv")),
            (elem.innerHTML = html),
            initItemsContainers(elem),
            (elem.scrollTop = 0));
    }
    function onRequestError(e) {
        console.log("error filling drawer: " + e + e.stack);
    }
    function updateSelectedItemForItemsContainer(itemsContainer, e) {
        var itemFromNavOption,
            currentNavMenuId = e.detail.navMenuId,
            navDrawerElement = getNavDrawerContentElement(),
            newSelectedOption = currentNavMenuId ? navDrawerElement.querySelector('.navMenuOption[data-navmenuid="' + currentNavMenuId + '"]') : null;
        return (
            (newSelectedOption =
                itemsContainer.hasAttribute("data-listindex") &&
                -1 !==
                    (currentNavMenuId = (function (itemsContainer, currentNavMenuId) {
                        currentNavMenuId = (currentNavMenuId || "").toLowerCase();
                        for (var items = itemsContainer.items || [], i = 0, length = items.length; i < length; i++) {
                            var routeInfo,
                                item = items[i],
                                navMenuId = item.navMenuId;
                            if (currentNavMenuId === ((navMenuId = !navMenuId && item.href ? ((routeInfo = _approuter.default.getRouteInfo(item.href)) && routeInfo.navMenuId) || item.href : navMenuId) || "").toLowerCase()) return i;
                        }
                        return -1;
                    })(itemsContainer, currentNavMenuId))
                    ? itemsContainer.getElement(currentNavMenuId)
                    : newSelectedOption) ||
                (e.detail.params &&
                    e.detail.params.id &&
                    e.detail.params.serverId &&
                    -1 !== (currentNavMenuId = itemsContainer.indexOfItemId(e.detail.params.id)) &&
                    (itemFromNavOption = itemsContainer.getItem(currentNavMenuId)) &&
                    itemFromNavOption.ServerId === e.detail.params.serverId &&
                    (newSelectedOption = itemsContainer.getElement(currentNavMenuId))),
            (newSelectedOption && newSelectedOption.classList.contains("navMenuOption-selected")) ||
                (newSelectedOption
                    ? ((itemFromNavOption = navDrawerElement.querySelector(".navMenuOption-selected")) && itemFromNavOption.classList.remove("navMenuOption-selected"),
                      newSelectedOption.classList.add("navMenuOption-selected"),
                      e.detail.requiresDynamicTitle &&
                          (function (newSelectedOption) {
                              (newSelectedOption = newSelectedOption.querySelector(".listItemBodyText") || newSelectedOption), (newSelectedOption = (newSelectedOption.innerText || newSelectedOption.textContent).trim());
                              _events.default.trigger(navDrawerContent, "dynamic-title", [newSelectedOption]);
                          })(newSelectedOption),
                      navDrawerScroller.scrollToElement(newSelectedOption, { behavior: "instant" }),
                      1)
                    : void 0)
        );
    }
    function onViewShowInternal(e, loadContent, autoFocusAfterLoad) {
        var drawerType = (function (e) {
            return (e = e.detail), currentServerId && !1 !== e.drawer ? (e.settingsTheme ? 2 : 1) : 0;
        })(e);
        drawerType !== currentDrawerType
            ? loadContent
                ? (function (type, signal, autoFocusAfterLoad) {
                      (type = [getDrawerHtml((currentDrawerType = type), signal), _layoutmanager.default.tv ? Promise.resolve() : loadEmbyCollapse(), _layoutmanager.default.tv ? Promise.resolve() : loadEmbyInput()]),
                          Promise.all(type).then(function (responses) {
                              responses = responses[0];
                              signal.aborted || (onSetInnerHtmlCallback(responses), autoFocusAfterLoad && setTimeout(autoFocus, 100));
                          }, onRequestError);
                  })(drawerType, (renderAbortController && renderAbortController.abort(), (drawerType = new AbortController()), (renderAbortController = drawerType).signal), autoFocusAfterLoad)
                : (onSetInnerHtmlCallback(""), autoFocusAfterLoad && autoFocus())
            : currentDrawerType &&
              (loadContent &&
                  (function (e) {
                      for (var itemsContainers = getNavDrawerContentElement().itemsContainers || [], i = 0, length = itemsContainers.length; i < length && !updateSelectedItemForItemsContainer(itemsContainers[i], e); i++);
                  })(e),
              autoFocusAfterLoad) &&
              setTimeout(autoFocus, 100);
    }
    function autoFocus(options) {
        var navDrawerElement = getNavDrawerContentElement(),
            elem = navDrawerElement.querySelector(".navMenuOption-selected");
        return elem ? (_focusmanager.default.focus(elem, { instantScroll: !0 }), elem) : (((options = options || {}).instantScroll = !0), _focusmanager.default.autoFocus(navDrawerElement, options));
    }
    _events.default.on(_connectionmanager.default, "localusersignedin", function (e, serverId, userId) {
        (currentServerId = serverId), (currentDrawerType = 0);
    }),
        _events.default.on(_connectionmanager.default, "localusersignedout", function () {
            currentServerId = null;
        });
    var navDrawerContent = {
        onViewShow: function (e) {
            onViewShowInternal((currentViewEvent = e), !(enableLazyLoadingDrawerContents = !e.detail.drawerInline));
        },
        onBeforeOpen: function (autoFocusAfterLoad) {
            enableLazyLoadingDrawerContents && onViewShowInternal(currentViewEvent, !0, autoFocusAfterLoad);
        },
        autoFocus: autoFocus,
        getSettingsDrawerHtml: getSettingsDrawerHtml,
        getAppSettingsMenuItems: getAppSettingsMenuItems,
        getItemsHtml: getItemsHtml,
        initItemsContainers: initItemsContainers,
    };
    function deleteEmbyConnectAccount() {
        var options,
            prefix = _servicelocator.appHost.supports("externallinks") && _servicelocator.appHost.supports("targetblank") ? '<a is="emby-linkbutton" href="https://emby.media/community" target="_blank" class="button-link">' : "",
            suffix = _servicelocator.appHost.supports("externallinks") && _servicelocator.appHost.supports("targetblank") ? "</a>" : "",
            prefix = _globalize.default.translate("DeleteEmbyConnectAccountHelp", prefix, suffix, prefix + "https://emby.media/community" + suffix);
        (options = { html: prefix, title: _globalize.default.translate("DeleteEmbyConnectAccount") }),
            Emby.importModule("./modules/common/dialogs/alert.js").then(function (alert) {
                return alert(options);
            });
    }
    function onNavigated() {
        _events.default.trigger(navDrawerContent, "navigated");
    }
    function onItemAction(e) {
        var apiClient,
            item = e.detail.item,
            onclick = item.onclick;
        "logout" === onclick
            ? ((apiClient = currentServerId ? _connectionmanager.default.getApiClient(currentServerId) : _connectionmanager.default.currentApiClient()), _approuter.default.logout(apiClient))
            : "exit" === onclick
            ? _servicelocator.appHost.exit()
            : "sleep" === onclick
            ? _servicelocator.appHost.sleep()
            : "shutdown" === onclick
            ? _servicelocator.appHost.shutdown()
            : "restart" === onclick
            ? _servicelocator.appHost.restart()
            : "settings" === onclick
            ? _approuter.default.showSettings()
            : "selectserver" === onclick
            ? _approuter.default.showSelectServer()
            : "changeuser" === onclick
            ? ((apiClient = currentServerId ? _connectionmanager.default.getApiClient(currentServerId) : _connectionmanager.default.currentApiClient()), _approuter.default.showServerLogin({ apiClient: apiClient }))
            : "search" === onclick
            ? _inputmanager.default.trigger("search", { sourceElement: _viewmanager.default.currentView(), originalEvent: e })
            : "menu" === onclick
            ? _events.default.trigger(navDrawerContent, "open-requested")
            : "deleteembyconnectaccount" === onclick
            ? deleteEmbyConnectAccount()
            : (apiClient = item.href) && _approuter.default.show(apiClient).then(onNavigated);
    }
    _exports.default = navDrawerContent;
});
