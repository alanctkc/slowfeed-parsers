var request = require('request');
var FeedParser = require('feedparser');

module.exports = {
  title: 'RSS',
  description: 'RSS feed at {{url}}',

  source: {
    schema: {
      url: {
        title: 'URL',
        description: 'Enter full RSS or Atom URL',
        type: 'string'
      }
    },

    validate: source => {
      var errors = {};

      if (!source.url) {
        errors.url = 'URL is required.';
      }

      return errors;
    },

    clean: source => {
      // TODO: parser rss/atom from html too?
      // TODO: prefix http
      return source;
    }
  },

  collect: (source, done) => {
    request(source.url)
      .on('error', err => {
        done(err);
      })
      .pipe(new FeedParser())
      .on('error', err => {
        done(err);
      })
      .on('readable', () => {
        var stream = this;
        var meta = this.meta;

        var item;
        var links = [];

        while (item = stream.read()) {
          var link = {
            identifier: item.link,
            title: item.title,
            url: item.link,
            postTime: item.pubDate.getTime() / 1000
          };

          links.push(link);
        }

        done(null, links);
      });
  }
};
