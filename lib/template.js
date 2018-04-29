var db = require('./db.js'),
    when = require('when'),
    _ = require('lodash');

function createTemplate(name, justify, pattern, css, keywordIds, padding, proportions, removePunctuation,
  removeAuthor, filters, misc) {
  justify = JSON.stringify(justify);
  pattern = JSON.stringify(pattern);
  css = JSON.stringify(css);
  filters = JSON.stringify(filters);
  misc = JSON.stringify(misc);
  return db.createTemplate(name, justify, pattern, css, padding.left, padding.right, padding.top, padding.bottom,
    proportions.horizontal, proportions.vertical, removePunctuation, removeAuthor, filters, misc)
    .then(function(templateId) {
    var keywordPromises = [];
    _.forEach(keywordIds, function(keywordId) {
      keywordPromises.push(db.addKeywordToTemplate(keywordId, templateId));
    });
    return when.all(keywordPromises).then(function() {
      return when(templateId);
    });
  });
}

function updateTemplate(templateId, justify, pattern, css, keywordIds, padding, proportions, removePunctuation,
  removeAuthor, filters, misc) {
  justify = JSON.stringify(justify);
  pattern = JSON.stringify(pattern);
  css = JSON.stringify(css);
  filters = JSON.stringify(filters);
  misc = JSON.stringify(misc);

  var updateTemplatePromise = db.updateTemplate(templateId, justify, pattern, css, padding.left, padding.right,
    padding.top, padding.bottom, proportions.horizontal, proportions.vertical, removePunctuation, removeAuthor,
    filters, misc),
    keywordPromise = db.removeKeywordsForTemplate(templateId).then(function() {
      var keywordPromises = [];
      _.forEach(keywordIds, function(keywordId) {
        keywordPromises.push(db.addKeywordToTemplate(keywordId, templateId));
      });
      return when.all(keywordPromises);
    });

  return when.all(updateTemplatePromise, keywordPromise);
}

function renameTemplate(templateId, name) {
  return db.renameTemplate(templateId, name);
}

function getTemplates() {
  return db.getTemplates();
}

function getTemplate(templateId) {
  return when.all([db.getTemplate(templateId), db.getKeywordsForTemplate(templateId)])
  .spread(function(template, keywords) {
    if (!template) {
      return when(null);
    }

    template.justify = JSON.parse(template.justify);
    template.pattern = JSON.parse(template.pattern);
    template.css = JSON.parse(template.css);
    template.filters = JSON.parse(template.filters);
    template.misc = JSON.parse(template.misc);
    template.keywordIds = _.pluck(keywords, 'id');
    template.padding = {
      left: template.padding_left,
      right: template.padding_right,
      top: template.padding_top,
      bottom: template.padding_bottom
    };
    template.proportions = {horizontal: template.proportions_horizontal, vertical: template.proportions_vertical};

    delete template.proportions_horizontal;
    delete template.proportions_vertical;
    delete template.padding_left;
    delete template.padding_right;
    delete template.padding_top;
    delete template.padding_bottom;

    return when(template);
  });
}

module.exports = {
  createTemplate,
  updateTemplate,
  renameTemplate,
  getTemplates,
  getTemplate
};
