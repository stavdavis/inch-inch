var fs = require('fs'),
  csvParse = require('csv-parse'),
  when = require('when'),
  _ = require('underscore');

const Quote = require('../lib/quote');
const Batch = require('../lib/batch');

var filename = process.argv[2],
  batchName = process.argv[3],
  filepath = `${__dirname}/tsv/${filename}`;

function parse() {
  return when.promise(function(resolve, reject) {
    var parser = csvParse({delimiter: '	', relax_column_count: true}, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
    fs.createReadStream(filepath).pipe(parser);
  });
}

function getAuthorId(author, authorIds) {
  if (!author) {
    return when(null);
  } else if (authorIds.length) {
    return when(_.first(authorIds).id);
  } else {
    return Quote.createAuthor(author, author[0].toLowerCase());
  }
}

function _insert(phrases, callback, quoteIds) {
  var phrase = phrases.shift(),
    text = phrase[0],
    author = phrase.length > 1 ? phrase[1] : null;

  console.log(`__ insert ... ${text}`);

  return when().then(() => {
    return author ? Quote.searchAuthor(author) : when([]);
  }).then((authorIds) => {
    return when.all([
      getAuthorId(author, authorIds),
      Quote.searchQuotes(text)
    ]);
  }).spread((authorId, quotes) => {
    var quote = quotes.length ? _.first(quotes) : null;
    if (quote) {
      console.log(`-- Skipping ${quote.id}:${quote.author}:${quote.text}`);
    }
    return quote ? when(quote.id) : Quote.createQuote(text, authorId);
  }).then((quoteId) => {
    quoteIds.push(quoteId);
    if (phrases.length) {
      _insert(phrases, callback, quoteIds);
    } else {
      callback(quoteIds);
    }
  });
}

function insert(phrases) {
  console.log(`*** INSERT *** (${phrases.length} phrases)`);
  return when.promise(function(resolve) {
    _insert(phrases, resolve, []);
  });
}

function createBatch() {
  console.log('*** CREATE BATCH ***');
  return Batch.createBatch(batchName);
}

function rAddToBatch(phraseIds, batchId, callback) {
  console.log('__ batch');
  var phraseId = phraseIds.shift();

  return Batch.addToBatch(batchId, phraseId).then(() => {
    if (phraseIds.length) {
      rAddToBatch(phraseIds, batchId, callback);
    } else {
      callback();
    }
  });
}

function addToBatch(phraseIds, batchId) {
  console.log(`*** INSERT *** (${phraseIds.length} phrases, batchId:${batchId})`);
  return when.promise((resolve) => {
    rAddToBatch(phraseIds, batchId, resolve);
  });
}

parse().then((phrases) => {
  return when.all([createBatch(), insert(phrases)]);
}).spread((batchId, quoteIds) => {
  return addToBatch(quoteIds, batchId);
}).then(() => {
  console.log('*** COMPLETE ***');
});
