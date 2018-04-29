const when = require('when');
const _ = require('lodash');

const Quote = require('../../../lib/quote');

function getQuotes(req, res) {

  when(null).then(() => {
    if (req.query.ids) {
      return Quote.getQuotes(req.query.ids);
    } else if (req.query.sample) {
      return Quote.randomQuotes(6);
    } else if (req.query.batchId) {
      return Quote.getQuotesForBatch(req.query.batchId);
    } else {
      return Quote.searchQuotes(req.query);
    }
  })
  .then((quotes) => {
    _.each(quotes, (quote) => {
      if (quote.parsey) quote.parsey = JSON.parse(quote.parsey);
    });
    res.send({ quotes: quotes });
  });
}

module.exports = function(app) {
  app.get('/v1/quotes', getQuotes);
};
