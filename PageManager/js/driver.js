/**
 * Created by mkhoje on 8/19/15.
 */

var app = new App();

app.Router = Backbone.Router.extend({

    routes: {
        ""      :   "welcome",
        "home"  :   "home",
    },

    initialize: function(){
        app.welcomeView = new app.Views.WelcomeView();



    },

    welcome:    function(){
        $("#app-content").html(app.welcomeView.el);
    },

    home:   function(){}
});

$( document ).ready(function() {

    app.user = new app.Models.UserModel();
    var router = new app.Router();
    Backbone.history.start();
});

