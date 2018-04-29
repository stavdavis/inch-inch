const Database = require('../../../../lib/db');

function setWords(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return setWords(results, done);
  }
  var wordCount = result.text.split(' ').length,
    id = result.id;
  return Database.raw(`UPDATE quote SET word_count = ${wordCount} WHERE id = ${id}`).then(() => {
    if (results.length) setWords(results, done);
    else done();
  });
}

function addWords(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE word_count = 0 LIMIT 5000`)
  .then((results) => {
    setWords(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/words', addWords);
};
