const Batch = require('../../../../../../lib/batch');

function addToBatch(req, res) {

  return Batch.addToBatch(req.params.batch_id, req.params.quote_id)
  .then((id) => {
    res.send({ success: true, id });
  });
}

module.exports = function(app) {
  app.post('/v1/batch/:batch_id/quotes/:quote_id', addToBatch);
};
