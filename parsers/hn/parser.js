'use strict';

var request = require('request');

module.exports = {
  title: 'Hacker News',
  sourceDescription: 'Hacker News Top Stories',
  filterDescription: 'Hacker News stories over {{points}} points',

  source: {
    schema: {},
  },

  filter: {
    schema: {
      points: {
        title: 'Point Threshold',
        description: 'Minimum point value to include',
        type: 'integer'
      }
    },

    validate: function(filter) {
      var errors = {};

      if (filter.points < 5) {
        errors.points = 'Point threshold must be 5 or higher.'
      }

      return errors;
    },

    test: function(filter, link) {
      return (link.meta.points >= filter.points);
    }
  },

  worker: function(source, save) {
    request({
      url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points%3E=5',
      json: true
    }, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var items = body.hits;
        for (var i = 0; i < items.length; i ++) {
          var item = items[i];
          if (!item.url) {
            item.url = 'https://news.ycombinator.com/item?id=' + item.objectID;
          }

          var link = {
            identifier: item.objectID,
            title: item.title,
            url: item.url,
            discussionUrl: 'https://news.ycombinator.com/item?id=' + item.objectID,
            postTime: item.created_at_i,
            meta: {
              points: item.points
            }
          };

          save(link);
        }
      }
    });
  }
};
