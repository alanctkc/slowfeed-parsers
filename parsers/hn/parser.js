'use strict';

var request = require('request');

module.exports = {
  title: 'Hacker News',
  description: 'Hacker News Top Stories',
  filterDescription: 'Hacker News stories over {{points}} points',

  filter: {
    schema: {
      points: {
        title: 'Point Threshold',
        description: 'Minimum point value to include',
        type: 'integer'
      }
    },

    validate: filter => {
      var errors = {};

      if (filter.points < 5) {
        errors.points = 'Point threshold must be 5 or higher.'
      }

      return errors;
    },

    test: (filter, link) => {
      return (link.meta.points >= filter.points);
    }
  },

  collect: (source, done) => {
    request({
      url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points%3E=5',
      json: true
    }, (err, res, body) => {
      if (err) {
        return done(err);
      }

      if (res.statusCode === 200) {
        var items = body.hits;
        var links = [];

        items.forEach(item => {
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

          links.push(link);
        });

        done(null, links);
      }
    });
  }
};
