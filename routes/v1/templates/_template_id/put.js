const Template = require('../../../../lib/template');

function updateTemplate(req, res) {
  var templateId = req.params.template_id;

  if (req.body.name) {
    return Template.renameTemplate(templateId, req.body.name)
    .then(() => {
      res.send({success: true});
    });
  }

  var justify = req.body.justify,
    pattern = req.body.pattern,
    css = req.body.css,
    keywordIds = req.body.keywordIds,
    padding = req.body.padding,
    proportions = req.body.proportions,
    removePunctuation = req.body.removePunctuation,
    removeAuthor = req.body.removeAuthor,
    filters = req.body.filters || {},
    misc = req.body.misc || {};

  Template.updateTemplate(templateId, justify, pattern, css, keywordIds, padding, proportions, removePunctuation,
    removeAuthor, filters, misc)
  .then(() => {
    res.send({success: true});
  });
}

module.exports = function(app) {
  app.put('/v1/templates/:template_id', updateTemplate);
};
