const Database = require('../../../../lib/db');

function setCharacters(results, done) {
  var result = results.shift();
  if (!result || !result.text) {
    console.log('skip', result);
    return setCharacters(results, done);
  }
  var characterCount = result.text.length,
    id = result.id;
  console.log('set characters', characterCount, id);
  return Database.raw(`UPDATE quote SET character_count = ${characterCount} WHERE id = ${id}`).then(() => {
    if (results.length) setCharacters(results, done);
    else done();
  });
}

function addCharacterCount(req, res) {
  return Database.raw(`SELECT * FROM quote WHERE character_count = 0 LIMIT 5000`)
  .then((results) => {
    setCharacters(results, () => {
      res.send({ success: true });
    });
  });
}

module.exports = function(app) {
  app.post('/v1/database/characters', addCharacterCount);
};
