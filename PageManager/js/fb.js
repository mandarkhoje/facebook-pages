/**
 * Created by mkhoje on 8/19/15.
 */
window.fbAsyncInit = function() {
    FB.init({
        appId      : '166154220382998',
        xfbml      : true,
        version    : 'v2.4',
    });

    FB.Event.subscribe('auth.statusChange', function (response) {
        app.service.loginAction(response);
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));