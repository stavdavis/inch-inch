const Database = require('../../../../lib/db');

function hasExclamation(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return hasExclamation(results, done);
  }
  var exclamation = result.text.indexOf('!') == -1 ? 0 : 1,
    id = result.id;
  return Database.raw(`UPDATE quote SET contains_exclamation = ${exclamation} WHERE id = ${id}`).then(() => {
    if (results.length) hasExclamation(results, done);
    else done();
  });
}

function checkExclamation(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE contains_exclamation = -1`)
  .then((results) => {
    hasExclamation(results, () => {
      console.log('complete');
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/exclamation', checkExclamation);
};
