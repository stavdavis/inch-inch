const Template = require('../../../lib/template');

function getTemplates(req, res) {
  Template.getTemplates().then((templates) => {
    res.send({templates: templates});
  });
}

module.exports = function(app) {
  app.get('/v1/templates', getTemplates);
};
