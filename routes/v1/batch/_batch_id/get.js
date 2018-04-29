const Batch = require('../../../../lib/batch');

function getBatch(req, res) {

  return Batch.getBatch(req.params.batch_id)
  .then((batch) => {
    res.send({ batch });
  });
}

module.exports = function(app) {
  app.get('/v1/batch/:batch_id', getBatch);
};
