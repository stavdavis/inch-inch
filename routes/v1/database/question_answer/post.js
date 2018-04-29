const Database = require('../../../../lib/db');

function setQuestionAnswer(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return setQuestionAnswer(results, done);
  }
  var sentences = result.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|'),
    id = result.id,
    isQuestionAnswer = sentences.length == 2 && sentences[0].slice(-1) == '?' && sentences[1].slice(-1) != '?' ? 1 : 0;
  return Database.raw(`UPDATE quote SET is_question_answer = ${isQuestionAnswer} WHERE id = ${id}`).then(() => {
    if (results.length) setQuestionAnswer(results, done);
    else done();
  });
}

function addIsQuestionAnswer(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE is_question_answer = -1`)
  .then((results) => {
    setQuestionAnswer(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/question_answer', addIsQuestionAnswer);
};
