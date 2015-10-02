/**
 * Created by mkhoje on 8/19/15.
 */
app.Models.UserModel = Backbone.Model.extend({

    defaults: {
        "id":  "",
        "first_name": "",
        "last_name": "",
        "gender": "",
        "link": ""
    }
});

app.Models.Page = Backbone.Model.extend({

    defaults:   {
        page_id:    "",
        page_name:  "",
        image_url:  "",
        access_token: "",
        category: "",
        name: ""
    }
});

app.Models.PageCollection = Backbone.Collection.extend({

    model:  app.Models.Page
});

app.Models.Post = Backbone.Model.extend({

    default:{
        id:    "",
        message:    "",
        url:    "",
        actions: new Array(),
        insights: new Object(),
        post_impressions: "0",
        post_impressions_unique:"0",
        total_viewCount: "0",
        picture: "",
        created_time: "",
        is_published:"",
        class_name:""
    },

    toJSON: function(){
        var json = Backbone.Model.prototype.toJSON.apply(this, arguments);

        if(this.attributes.insights != null) {
            json.post_impressions = this.attributes.insights.post_impressions;
        }
        else{
            json.post_impressions = 0;
        }
        if(this.attributes.insights != null) {
            json.post_impressions_unique = this.attributes.insights.post_impressions_unique;
        }
        else{
            json.post_impressions_unique = 0;
        }

        if(this.attributes.insights != null) {
            json.post_impressions_unique = this.attributes.insights.post_impressions_unique;
        }
        else{
            json.post_impressions_unique = 0;
        }

        json.total_viewCount = json.post_impressions_unique + json.post_impressions;

        if(this.attributes.is_published === true){
                json.class_name = "published_post";
        }
        else{
                json.class_name = "unpublished_post";
        }

        return json;
    }
});

app.Models.PostCollection = Backbone.Collection.extend({

    model: app.Models.Post,

    comparator: function(post) {
        return -post.get('created_time');
    }
});