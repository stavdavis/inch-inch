const Batch = require('../../../lib/batch');

function createBatch(req, res) {

  return Batch.createBatch(req.body.alias)
  .then((id) => {
    res.send({ success: true, id });
  });
}

module.exports = function(app) {
  app.post('/v1/batch', createBatch);
};
