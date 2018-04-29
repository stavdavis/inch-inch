const Database = require('../../../../lib/db');

function hasQuestion(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return hasQuestion(results, done);
  }
  var question = result.text.indexOf('?') == -1 ? 0 : 1,
    id = result.id;
  return Database.raw(`UPDATE quote SET contains_question = ${question} WHERE id = ${id}`).then(() => {
    if (results.length) hasQuestion(results, done);
    else done();
  });
}

function checkQuestion(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE contains_question = -1`)
  .then((results) => {
    hasQuestion(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/question', checkQuestion);
};
