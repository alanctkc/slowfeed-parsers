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
      // url required
      return {};
    },

    clean: function(source) {
      // parser rss/atom from html too?
      return source;
    }
  },

  filter: {
    schema: {}
  },

  worker: function(source, callback) {
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
          addCallback(item.link, source.name, item.title, item.link, null, item.pubDate.getTime()/1000, 'rss');
        }
      });
  }
};
