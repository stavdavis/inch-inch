const exec = require('child-process-promise').exec;
const Database = require('../../../../lib/db');
const _ = require('lodash');
const when = require('when');

function language(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE parsey IS NULL LIMIT 200`)
  .then((results) => {
    parseQuotes(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

function parseQuotes(results, done) {
  var result = results.shift();

  return parseQuote(result.text)
  .then((parsey) => {
    return setQuoteParsey(result, parsey);
  }).then(() => {
    if (results.length) return parseQuotes(results, done);
    else return done();
  });
}

function parseQuote(quote) {
  var sentences = quote.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|'),
    promises = [];

  _.each(sentences, (sentence) => {
    promises.push(parseSentence(sentence));
  });

  return when.all(promises);
}

function parseSentence(sentence) {
  sentence = sentence.replace(/'/g, '');
  var chdir = 'cd /Users/adamflesher/Quote/models/syntaxnet',
    echoDemo = `echo '${sentence}.' | syntaxnet/demo.sh`;

  return exec(`${chdir} && ${echoDemo}`)
  .then((result) => {
    var data = [],
      lines = result.stdout.split('\n');
    _.each(lines, (line) => {
      var matches = line.match(/\+-- (\w+) (\w+ \w+)/);
      if (matches) {
        data.push({word: matches[1], type: matches[2]});
      }
    });
    return when(data);
  });
}

function setQuoteParsey(result, parsey) {
  parsey = JSON.stringify(parsey);
  if (parsey.length > 1000) parsey = JSON.stringify([]);
  return Database.raw(`UPDATE quote SET parsey = '${parsey}' WHERE id = ${result.id}`);
}

module.exports = function(app) {
  app.post('/v1/database/language', language);
};
