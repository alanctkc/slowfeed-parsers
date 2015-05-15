var request = require('request');
var FeedParser = require('feedparser');

module.exports = {
  title: 'RSS',
  sourceDescription: 'RSS feed at {{url}}',
  filterDescription: 'RSS feed at {{url}}',

  source: {
    schema: {
      url: {
        title: 'URL',
        description: 'Enter full RSS or Atom URL',
        type: 'string'
      }
    },

    validate: function(source) {
      var errors = {};

      if (!source.url) {
        errors.url = 'URL is required.';
      }

      return errors;
    },

    clean: function(source) {
      // parser rss/atom from html too?
      // prefix http
      return source;
    }
  },

  worker: function(source, save) {
    request(source.url)
      .on('error', function(err) {
        console.log(err);
      })
      .pipe(new FeedParser())
      .on('error', function(err) {
        console.log(err);
      })
      .on('readable', function() {
        var stream = this;
        var meta = this.meta;
        var item;

        while (item = stream.read()) {
          var link = {
            identifier: item.link,
            title: item.title,
            url: item.link,
            postTime: item.pubDate.getTime() / 1000
          };

          save(link);
        }
      });
  }
};
