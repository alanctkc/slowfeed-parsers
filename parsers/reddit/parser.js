var request = require('request');
var Entities = require('html-entities').AllHtmlEntities;

var entities = new Entities();

module.exports = {
  title: 'Reddit',
  sourceDescription: '{{subreddit}} subreddit',
  filterDescription: '/r/{{subreddit}} posts over {{points}} points {{#unless selfPosts}}(no self posts){{/unless}}',

  source: {
    schema: {
      subreddit: {
        title: 'Subreddit',
        description: 'Subreddit name',
        type: 'string'
      }
    },

    validate: function(source) {
      // subreddit is required
      return {};
    },

    clean: function(source) {
      // lowercase to standardize
      source.subreddit = source.subreddit.replace('/r/', '');
      return source;
    }
  },

  filter: {
    schema: {
      points: {
        title: 'Point Threshold',
        description: 'Minimum point value to include',
        type: 'integer'
      },
      selfPost: {
        title: 'Include Self Posts',
        type: 'boolean',
      }
    },

    validate: function(filter) {
      // points > 5
      return {};
    },

    clean: function(filter) {
      // selfpost default false
      return filter;
    }
  },

  worker: function(source, callback) {
    request({
      url: 'http://www.reddit.com/r/' + source.subreddit + '/top.json',
      json: true
    }, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var items = body.data.children;
        for (var i = 0; i < items.length; i ++) {         
          item = items[i].data;         
          if (item.score >= source.points) {
            if (!source.selfPosts && item.is_self) {
              continue;
            }
            addCallback(item.permalink, source.name, entities.decode(item.title),
                        item.url, 'http://www.reddit.com' + item.permalink, item.created_utc, 'reddit');
          }
        }
      }
    });
  }
};
