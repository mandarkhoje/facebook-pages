/**
 * Created by mkhoje on 8/22/15.
 * This service is responsible for making API calls to the Facebook Graph API
 */
var FBService = (function () {

    /*
    *  Authenticate the user and retrieve all the pages that user manages along with page access tokens
    */
    var login = function () {

        FB.login(function (response) {
                FB.api('/me/accounts', function (response) {

                    if (response && !response.error) {
                        var pages = response.data;
                        app.pageCollection = new app.Models.PageCollection();

                        for (var i = 0; i < pages.length; i++) {
                            var data = pages[i];
                            app.page = new app.Models.Page(data);
                            app.pageCollection.add(app.page);

                            identityMap[data.id] = data.access_token;
                        }
                        app.sidebarView = new app.Views.SidebarView({collection: app.pageCollection}); // create side bar with pages
                        $("#sidebar").html(app.sidebarView.el);
                        console.log("response " + response.data[0]);

                        //$(document).trigger('getAllPosts', response.data[0].id); //passing the page id
                        getAllPagePosts(response.data[0].id);
                    }
                    else {
                        handleError(response);
                    }


                });
            },
            {scope: "manage_pages, publish_pages, publish_actions, read_insights"});
    }

    /*
    * Logs in the user
    */
    var loginAction = function (data) {
        if (data.status === 'connected') {
            FB.api('/me', function (response) {
                console.log(response);
                if (response && !response.error) {

                    app.user.set(response);
                    app.welcomeView.remove();
                    $(".container").css("background-color", "#F6F6F6");
                    app.navbarView = new app.Views.NavbarView();
                    $("#navigation").html(app.navbarView.el);

                    app.coverView = new app.Views.CoverView();
                    $("#page-cover").html(app.coverView.el);

                    app.publishPostView = new app.Views.PublishPostView();
                    $("#publish-post").html(app.publishPostView.el);
                    $("body").css("background-color","gray");
                }
                else {
                    handleError(response);
                }
            });
        }
        else {
            app.user.set(app.user.defaults);
            if (app.page != null || app.pages != undefined) {
                app.page.set(app.page.defaults);
                app.pages.set(); //set the collection of pages after user logs out
            }
        }
    }

    /*
    * Logs the user out, so next time the user will need to authenticate
    */
    var logout = function () {
        FB.logout();
        //go to the login view
        app.welcomeView = new app.Views.WelcomeView();
        $("#app-content").html(app.welcomeView.el);
        app.postsView.remove();
        app.coverView.remove();
        app.navbarView.remove();
        app.sidebarView.remove();
        app.postView.remove();
        app.publishPostView.remove();
        $("body").css("background-color","white");
        return false;
    }

    /*
     * Revokes the permissions for the app for given user
     */
    var revoke = function () {
        FB.logout();
        FB.api('/me/permissions', 'delete', function (response) {

            console.log(response); // true
            if (response && !response.error) {
                //go to the login view
                app.welcomeView = new app.Views.WelcomeView();
                $("#app-content").html(app.welcomeView.el);
                app.postsView.remove();
                app.coverView.remove();
                app.navbarView.remove();
                app.sidebarView.remove();
                app.postView.remove();
                app.publishPostView.remove();
                $("body").css("background-color","white");
                return false;
            }
            else {
                handleError(response);
            }
        });
    }

    /*
     * Creates a post on the 'feed' node of the page. This post will be published on the page's timeline
     */
    var createPublishedPost = function (data) {
        var entity = data.page_id;
        var message = data.message;
        var identity = identityMap[entity];
        var scheduled_date =  Math.round(new Date(data.scheduled_date) / 1000);
        var isPublished =  !data.isPublished;


        if(isPublished === true){
            FB.api('/' + entity + '/feed',
                'post',
                {message: message, access_token: identity, published: true}, function (response) {

                    if (response && !response.error) {
                        console.log(response);
                        $("#post-published-message").css("display", "inline-block").fadeIn().delay(2000).fadeOut();


                        //$(document).trigger('getAllPosts', entity);
                        addToTimeline(response.id);
                        $('#comment').val("");
                        $('#datepicker').val("");
                    }
                    else {
                        handleError(response);
                    }
                }
            );
        }
        else {

            var now = Math.round(new Date() / 1000);

            if(now >= scheduled_date + (10*60)){
                FB.api('/' + entity + '/feed',
                    'post',
                    {
                        message: message,
                        access_token: identity,
                        scheduled_publish_time: scheduled_date,
                        published: false
                    }, function (response) {

                        if (response && !response.error) {
                            console.log(response);
                            $("#post-published-message").css("display", "inline-block").fadeIn().delay(2000).fadeOut();


                            //$(document).trigger('getAllPosts', entity);
                            addToTimeline(response.id);
                            $('#comment').val("");
                            $('#datepicker').val("");
                        }
                        else {
                            handleError(response);
                        }
                    }
                );


            }
            else{
                FB.api('/' + entity + '/feed',
                    'post',
                    {
                        message: message,
                        access_token: identity,
                        published: false
                    }, function (response) {

                        if (response && !response.error) {
                            console.log(response);
                            $("#post-published-message").css("display", "inline-block").fadeIn().delay(2000).fadeOut();


                            //$(document).trigger('getAllPosts', entity);
                            addToTimeline(response.id);
                            $('#comment').val("");
                            $('#datepicker').val("");
                        }
                        else {
                            handleError(response);
                        }
                    }
                );
            }

        }
    }

    /*
     * Creates a post that is scheduled to publish at some later date.
     * This post will not be seen on the timeline of the page.
     */
    var createUnpublishedPost = function (data) {
        var page_id = data.page_id;
        var access_token = identityMap[page_id];
        var scheduled_date = data.scheduled_date;
        var message = data.message;
        FB.api(
            "/" + page_id + "/feed",
            "POST",
            {
                "message": message,
                "scheduled_publish_time": Math.round(new Date(scheduled_date) / 1000),
                "published": false,
                "access_token": access_token
            },
            function (response) {
                console.log(response);
                if (response && !response.error) {
                    $("#post-published-message").css("display", "inline-block").fadeIn().delay(2000).fadeOut();
                    addToTimeline(response.id);
                    $('#comment').val("");
                    $('#datepicker').val("");
                }
                else {
                    handleError(response);
                }
            });
    }

    /*
     *  Get all page posts including the published and un published posts
     */
    var getAllPagePosts = function (pageId) {

        $(".list-group li").removeClass("active");
        $("#" + pageId).addClass("active");

        var pageIdFeed = '/' + pageId + '/' + 'feed?limit=100&fields=id,message,actions,picture,created_time,is_published';

        FB.api(pageIdFeed, function (response) {

            if (response && !response.error) {
                app.postCollection = new app.Models.PostCollection();

                for (var i = 0; i < response.data.length; i++) {
                    var data = response.data[i];
                    app.post = new app.Models.Post(data);
                    app.postView = new app.Views.PostView({model: app.post});
                    app.postCollection.push(app.post);
                }
                console.log(app.postCollection);

                var token = identityMap[pageId];

                var request = '/' + pageId + '/' + 'promotable_posts/?limit=100&fields=id,message,actions,is_published&is_published=false&access_token=' + token;

                FB.api(request, function (response) {
                    console.log(response);

                    for (var i = 0; i < response.data.length; i++) {
                        var data = response.data[i];
                        app.post = new app.Models.Post(data);
                        app.postView = new app.Views.PostView({model: app.post});
                        app.postCollection.push(app.post);
                    }
                    console.log(app.postCollection);
                    app.postsView = new app.Views.PostsView({collection: app.postCollection});
                    $("#post-content").html(app.postsView.el);
                    //insights

                    var batches = [];


                    for (var i = 0; i < app.postCollection.models.length; i++) {
                        var insights = ['post_impressions, post_impressions_unique'];
                        var identity = (app.postCollection.models[i].attributes.id).split('_')[0];
                        var entity = app.postCollection.models[i].attributes.id;
                        var method = 'GET';

                        //var batch = singleBatch(method, entity, insights, identityMap[identity]);

                        var insightsUrl = "";

                        for (var j = 0; j < insights.length; j++) {
                            insightsUrl = insightsUrl + '/' + insights[j];
                        }
                        console.log(insightsUrl);
                        var relativeUrl = entity + '/insights/' + insights;


                        batches.push({
                            'method': method,
                            'relative_url': relativeUrl,
                            'access_token': token
                        });
                    }
                    getInsightsData(batches);
                    getUserProfile();
                    getPageData(pageId);

                });
            }
            else {
                handleError(response);
            }
        });
    }

    /*
    * Action handler when a page tab is selected
    */
    var pageSelect = function () {
        var page_id = page.id;
        var pageIdFeed = '/' + page_id + '/' + 'feed';


        FB.api(pageIdFeed, function (response) {
            console.log(response);

            if (response && !response.error) {
                app.postCollection = new app.ModeModels.PostCollection();
                for (var i = 0; i < response.dat.datagth; i++) {

                    var data = response.data[i];
                    app.post = new app.Models.Post(datadata);
                    app.postCollection.add(app.post);
                }

                app.postsView = new app.Views.PostsView({collection: app.postCollection});
                //$("#post-content").html(app.postsView.el);
            }
            else {
                handleError(response);
            }
        });
    }

    /*
    *   gets the insights data using a batch process for page posts
    */
    function getInsightsData(b) {
        FB.api('/', 'POST', {batch: b}, function (response) {
            console.log(response);
            if (response && !response.error) {
                app.pageInsightsMap = new Object();


                for (var i = 0; i < response.length; i++) {

                    app.insightValues = new Object();

                    var res = $.parseJSON(response[i].body);

                    for (var j = 0; j < res.data.length; j++) {

                        var insight = res.data[j];
                        var id = insight.id;
                        var value = insight.values[0].value;

                        var splitId = id.split('/');
                        var postId = splitId[0];
                        var insight_name = splitId[2];
                        var period = splitId[3];

                        // app.pageInsightsMap[postId] = insight_name;
                        app.insightValues[insight_name] = value;


                    }
                    app.pageInsightsMap[postId] = app.insightValues;
                }
                //populate in views

                for (var i = 0; i < app.postCollection.models.length; i++) {
                    var p = app.postCollection.models[i].id;
                    app.postCollection.models[i].set({'insights': app.pageInsightsMap[p]});
                }
            }
            else {
                handleError(response);
            }
        });
    }

    /*
    *   Get the user profile details
    */
    function getUserProfile() {
        FB.api('/me/picture?type=large', 'get', function (response) {
                console.log(response);
                if (response && !response.error) {
                    $('#user-profile').attr("src", response.data.url);
                }
                else {
                    handleError(response);
                }

            }
        );
    }

    /*
     *   Get the page details
     */
    function getPageData(pageId) {
        $("#page_id_select").val(pageId);
        var request = '/' + pageId + '?fields=cover,picture,name,likes'
        FB.api(request, 'get', function (response) {
                console.log(response);
                if (response && !response.error) {
                    $('.jumbotron').css('background', ' url(' + response.cover.source + ') no-repeat center center');
                    $(".page-title").text(response.name);
                    $(".page-impression-score").text(response.likes);
                }
                else {
                    handleError(response);
                }
            }
        );
    }

    /*
    *   Creates a page post and adds it to add page managers timeline
    */
    var addToTimeline = function (pagePostId) {

        var request = '/' + pagePostId + '?fields=picture,message,is_published'
        FB.api(request, 'get', function (response) {

                console.log(response);
                if (response && !response.error) {
                    var insights = new Object();
                    insights.post_impressions = 0;
                    insights.post_impressions_unique = 0;
                    response.insights = insights;

                    app.postsView.addToTimeline(response);
                }
                else {
                    handleError(response);
                }
            }
        );
    }

    /*
    *   Generic method to handle error for api call
    */
    var handleError = function (response) {
        console.log(response);
        // show an error message on the UI
        return;
    }

    /*
    * This map stores the entity and associated access tokens
    * */

    var identityMap = new Object();

    return {

        login: login,
        loginAction: loginAction,
        logout: logout,
        revoke: revoke,
        createPublishedPost: createPublishedPost,
        getAllPagePosts: getAllPagePosts,
        createUnpublishedPost: createUnpublishedPost,
        pageSelect: pageSelect,
        getUserProfile: getUserProfile,
        addToTimeline: addToTimeline,
        getIdentityMap: identityMap
    }
})();
