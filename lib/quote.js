var db = require('./db'),
    _ = require('underscore'),
    when = require('when');

function sampleQuotes(limit) {
  limit = limit || 8;

  return when.all([db.getLongestQuote(), db.getShortestQuote(), db.getRandomQuotes(limit)])
  .spread(function(longQuote, shortQuote, quotes) {
    quotes.unshift(shortQuote);
    quotes.unshift(longQuote);
    return when(quotes);
  });
}

function randomQuotes(limit) {
  limit = limit || 10;
  return db.getRandomQuotes(limit);
}

function getQuote(id) {
  return db.getQuote(id);
}

function getQuotes(ids) {
  return when.all([db.getQuotes(ids.split(',')), db.getQuoteKeywords(ids.split(','))])
  .spread(function(quotes, keywords) {
    var quoteMap =  _.indexBy(quotes, 'id');
    _.forEach(keywords, (keyword) => {
      var quote = quoteMap[keyword.quote_id];
      if (!quote.keywords) {
        quote.keywords = [];
      }
      quote.keywords.push(_.omit(keyword, 'quote_id'));
    });
    return quotes;
  });
}

function getQuotesForBatch(batchId) {
  return db.getQuotesForBatch(batchId);
}

function searchQuotes(params) {
  return db.searchQuotes(params);
}

function addQuote(text, authorId) {
  return db.createQuote(text, authorId);
}

function searchAuthor(name) {
  return db.searchAuthor(name);
}

function createQuote(text, authorId) {
  return db.createQuote(text, authorId);
}

function createAuthor(name, searchLetter) {
  return db.createAuthor(name, searchLetter);
}

module.exports = {
  sampleQuotes,
  randomQuotes,
  getQuote,
  getQuotes,
  searchQuotes,
  addQuote,
  searchAuthor,
  createQuote,
  createAuthor,
  getQuotesForBatch
};
