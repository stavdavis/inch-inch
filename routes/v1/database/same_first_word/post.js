const Database = require('../../../../lib/db');
const _ = require('lodash');

function loop(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return loop(results, done);
  }

  // Add "I" so that we can filter out sentences that start with I
  var sentences = result.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|'),
    id = result.id,
    firstWords = _(sentences).map((sentence) => { return _.first(sentence.split(' ')); }).uniq().value(),
    sameFirstWord = firstWords.length == 1 && !_.includes(['I'], _.head(firstWords)) && sentences.length > 1 ? 1 : 0;
  return Database.raw(`UPDATE quote SET same_first_word = ${sameFirstWord} WHERE id = ${id}`).then(() => {
    if (results.length) loop(results, done);
    else done();
  });
}

function start(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE same_first_word = -1`)
  .then((results) => {
    loop(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/same_first_word', start);
};
