const Template = require('../../../lib/template');

function createTemplate(req, res) {
  var name = req.body.name,
    justify = req.body.justify,
    pattern = req.body.pattern,
    css = req.body.css,
    keywordIds = req.body.keywordIds,
    padding = req.body.padding,
    proportions = req.body.proportions,
    removePunctuation = req.body.removePunctuation,
    removeAuthor = req.body.removeAuthor,
    filters = req.body.filters || {},
    misc = req.body.misc || {};

  Template.createTemplate(name, justify, pattern, css, keywordIds, padding, proportions, removePunctuation,
    removeAuthor, filters, misc)
  .then((id) => {
    res.send({success: true, id: id});
  });
}

module.exports = function(app) {
  app.post('/v1/templates', createTemplate);
};
