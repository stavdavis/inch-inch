const Database = require('../../../../lib/db');

function setSentences(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return setSentences(results, done);
  }
  var sentenceCount = result.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|').length,
    id = result.id;
  return Database.raw(`UPDATE quote SET sentence_count = ${sentenceCount} WHERE id = ${id}`).then(() => {
    if (results.length) setSentences(results, done);
    else done();
  });
}

function addSentenceCount(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE sentence_count = 0`)
  .then((results) => {
    setSentences(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/sentences', addSentenceCount);
};
