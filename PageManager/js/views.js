/**
 * Created by mkhoje on 8/19/15.
 */
app.Views.PostView = Backbone.View.extend({

    defaults: {

        id: "",
        message:    "",
        post_impressions: "0",
        post_impressions_unique: "0",
        picture: "",
        created_time:"",
        is_published:"",
        class_name: "",
        total_viewCount: "0"

    },
    template: _.template( $('#single-post-view').html() ),

    initialize: function(){
        this.model.on('change', this.render, this);
        this.render();
    },

    render: function() {
        var output = this.template({'post':this.model.toJSON()});
        this.$el.html(output);
        return this;
    }
});

app.Views.PostsView = Backbone.View.extend({

    initialize: function(){
        this.render();
    },

    template: _.template( $('#post-view').html() ),

    events: {
        "addToTimeline": "addToTimeline"
    },

    render: function() {
        this.collection.each(function(model) {
            var postView = new app.Views.PostView({model: model});
            this.$el.append(postView.render().el);
        }, this);
        return this;
    },

    addToTimeline: function(data){
        app.post = new app.Models.Post(data);
        var postView = new app.Views.PostView({model: app.post});

        $(postView.render().el).hide().prependTo(this.$el).fadeIn(1000);

        return this;
    }
});


app.Views.SidebarView = Backbone.View.extend({

    initialize: function(){
        this.render();
    },

    template: _.template( $('#sidebar-view').html() ),

    render: function(){

        this.$el.html(this.template({ pages: this.collection.toJSON()
        }));
    },

    events: {
        'click .page-tab': 'tabChange'
    },

    tabChange: function(response){
        var page_id = response.target.id;
        app.service.getAllPagePosts(page_id);
        $("#post-content").html("");
    }
});

app.Views.WelcomeView = Backbone.View.extend({

    initialize: function(){
        this.render();
    },

    template: _.template( $('#welcome-view').html() ),

    render: function(){
        this.$el.html(this.template());
    },

    events: {
        'click .fb-login':  'login'
    },

    login: function(){
        app.service.login();
    }
});

app.Views.NavbarView = Backbone.View.extend({

    initialize: function(){
        this.render();
    },

    template: _.template($('#navbar-view').html()),

    render: function(){
        this.$el.html(this.template());
    },

    events: {
        'click #fb-logout': 'logout',
        'click #fb-revoke': 'revoke',
    },

    logout: function(){
        app.service.logout();
    },

    revoke: function(){
        app.service.revoke();
    }
});

app.Views.PublishPostView = Backbone.View.extend({
    initialize: function(){
        this.render();
        this.datePicker();
    },

    template: _.template( $('#publish-post-view').html() ),

    render: function(){
        this.$el.html(this.template());
    },

    events: {
        "click #add-post": 'publishPost',
        "click #datepicker": 'datePicker'
    },

    isPublishedCheck: function(){


    },

    datePicker: function(){

            $('#datepicker').datepicker({
                showOn: "button",
                buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
                buttonImageOnly: true,
                dateFormat: 'mm/dd/yy',
                onSelect: function(datetext){
                    var d = new Date(); // for now
                    datetext=datetext+" "+d.getHours()+": "+d.getMinutes()+": "+d.getSeconds();
                    $('#datepicker').val(datetext);
                },
            });
    },


    publishPost: function(){

        var data = new Object();
        var text = $('#comment').val();
        var page_id = $("#page_id_select").val();
        var scheduled_date = $("#datepicker").val();
        var check = $("#is_published_checkbox").val();


        if(text == null || text == ""){
            $("#post-error-message").css("display", "inline-block").fadeIn().delay(2000).fadeOut();
            return;
        }

        data.message = text;
        data.page_id = page_id;
        if(scheduled_date == null || scheduled_date == ""){
            scheduled_date = new Date();
        }
        data.scheduled_date = scheduled_date;
        data.isPublished = check;

        app.service.createPublishedPost(data);


       if(scheduled_date != null && scheduled_date != ""){
           if(check == true)
               app.service.createPublishedPost(data);
           else
               app.service.createUnpublishedPost(data);
       }

        else{
           if(check == true)
               app.service.createPublishedPost(data);
           else
               app.service.createUnpublishedPost(data);
       }

    }
});

app.Views.CoverView = Backbone.View.extend({

    initialize: function(){
        this.render();
    },

    template: _.template( $('#cover-view').html() ),
    render: function(){
        this.$el.html(this.template());
    }
});


