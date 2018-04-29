const Batch = require('../../../lib/batch');

function getAllBatches(req, res) {

  return Batch.getAllBatches()
  .then((batches) => {
    res.send({ batches });
  });
}

module.exports = function(app) {
  app.get('/v1/batch', getAllBatches);
};
