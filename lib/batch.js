var db = require('./db');

function createBatch(alias) {
  return db.createBatch(alias);
}

// function rAddToBatch(batchId, quoteIds, callback) {
//   var quoteId = quoteIds.shift();
//   return db.addToBatch(batchId, quoteId).then(() => {
//     if (quoteIds.length) {
//       rAddToBatch(batchId, quoteIds, callback);
//     } else {
//       callback();
//     }
//   });
// }

function addToBatch(batchId, quoteId) {
  return db.addToBatch(batchId, quoteId);
}

function getBatch(batchId) {
  return db.getBatch(batchId);
}

function getAllBatches() {
  return db.getAllBatches();
}

module.exports = {
  createBatch,
  addToBatch,
  getBatch,
  getAllBatches
};
