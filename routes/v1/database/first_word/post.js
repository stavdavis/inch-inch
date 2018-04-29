const Database = require('../../../../lib/db');
const _ = require('lodash');

function loop(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return loop(results, done);
  }

  // Add "I" so that we can filter out sentences that start with I
  var firstWord = _.head(result.text.split(' ')).replace(/'/g, ''),
    id = result.id;
  return Database.raw(`UPDATE quote SET (first_word) = ('${firstWord}') WHERE id = ${id}`).then(() => {
    if (results.length) loop(results, done);
    else done();
  });
}

function start(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE first_word IS NULL`)
  .then((results) => {
    loop(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/first_word', start);
};
