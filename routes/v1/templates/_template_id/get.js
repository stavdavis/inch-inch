const Template = require('../../../../lib/template');

function getTemplate(req, res) {
  var templateId = req.params.template_id;

  Template.getTemplate(templateId).then((template) => {
    res.send({template: template});
  });
}

module.exports = function(app) {
  app.get('/v1/templates/:template_id', getTemplate);
};
