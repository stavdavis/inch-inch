window.action = (() => {
  function loadTemplateList() {
    return $.get('/v1/templates', function(data) {
      var templates = data.templates,
          html = '';
      _.forEach(templates, function(template) {
        html += '<div><a href="/?id=' + template.id + '">' + template.name + '</a></div><hr />';
      });
      $('.templates').html(html);
      return true;
    });
  }

  function generateImages(ids, limit) {
    limit = limit || 100;
    return $.get('quotes', {ids: `${ids}`, limit}).then(function(data) {
      return window.capture.start(data.quotes, 1000);
    });
  }

  function renameTemplate(name) {
    return $.put(`/v1/templates/${window.currentTemplate.id}`, { name: name }).then(function() {
      window.util.showFeedback('success', 'Template renamed!');
      window.currentTemplate.name = name;
      $('.name-heading').html(name);
      $('.templates').find(`[href="/?id=${window.currentTemplate.id}"]`).html(name);
    });
  }

  function saveTemplate(update, name) {
    var classes = ['.person', '.global', '.background', '.first', '.last'],
      json = {
        pattern: window.editor.pattern,
        justify: window.textJustify,
        css: [],
        filters: window.filters.getFilters(),
        name: name,
        keywordIds: $('.keywords').val(),
        padding: {
          left: $('.padding-left-input').val() || 0,
          right: $('.padding-right-input').val() || 0,
          top: $('.padding-top-input').val() || 0,
          bottom: $('.padding-bottom-input').val() || 0
        },
        proportions: {
          horizontal: $('.proportions-width-input').val() || 0,
          vertical: $('.proportions-height-input').val() || 0
        },
        removePunctuation: $('.remove-punctuation-checkbox').is(':checked'),
        removeAuthor: $('.remove-author-checkbox').is(':checked'),
        misc: {
          lineBreak: $('.css-form .btn-toggle[attribute=line-split] .btn.active').attr('action'),
          personPreCharacters: $('.person-pre-characters-input').val(),
          personPostCharacters: $('.person-post-characters-input').val(),
          charColors: window.charColors
        }
      };

    if ($('.wrap-in-quotes-checkbox').is(':checked')) json.misc.wrapInQuotes = true;

    _.forEach(_.uniq(window.editor.pattern), function(cssClass) {
      classes.push('.' + cssClass);
    });
    // add css
    var rules = window.editor.getCssRules();
    for (var index in rules) {
      var rule = rules[index];
      if (_.includes(classes, rule.selectorText)) {
        json.css.push(rule.cssText);
      }
    }

    if (window.currentTemplate && update) {
      $.put(`/v1/templates/${window.currentTemplate.id}`, json, function(response) {
        if (response.success) window.util.showFeedback('success', 'Template updated successfully!');
      });
    } else {
      $.post('/v1/templates', json, function(response) {
        window.currentTemplate = _.extend({id: response.id}, json);
        window.editor.templateLoaded();
        if (response.success) {
          window.util.showFeedback('success', 'Template saved successfully!');
          $('.name-heading').html(json.name);
          $('.templates').append(
            `<div><a href="/?id=${window.currentTemplate.id}">${json.name}</a></div>`
          );
        }
      });
    }
  }

  function loadKeywords() {
    return $.when([{ id: 1, word: 'fun' }, { id: 2, word: 'interesting' }, { id: 3, word: 'joy' }])
    .then((keywords) => {
      window.keywords = keywords;
    });
  }

  function _load(template) {
    // justify text
    window.textJustify = template.justify || {};

    // set the styles
    loadCssStyles(template.css);
    window.charColors = template.misc.charColors || {};
    window.editor.switchClass('.global');

    // set the pattern
    window.editor.pattern = template.pattern || [];
    $('.input-pattern').val(window.editor.pattern.join(''));

    $('.proportions-width-input').val(template.proportions.horizontal);
    $('.proportions-height-input').val(template.proportions.vertical);
    $('.padding-left-input').val(template.padding.left || '');
    $('.padding-right-input').val(template.padding.right || '');
    $('.padding-top-input').val(template.padding.top || '');
    $('.padding-bottom-input').val(template.padding.bottom || '');

    $('.remove-punctuation-checkbox').attr('checked', template.remove_punctuation);
    $('.remove-author-checkbox').attr('checked', template.remove_author);
    $('.wrap-in-quotes-checkbox').attr('checked', template.misc.wrapInQuotes);

    window.filters.loadFilters(template.filters);

    // vertical alignment
    var verticalAlign = window.action.getCssStyle('.global', 'vertical-align') || 'top',
      $btnVerticalAlign = $('.btn-vertical-align');
    $btnVerticalAlign.children().removeClass('active');
    $btnVerticalAlign.find('[action=' + verticalAlign + ']').addClass('active');

    var lineSplit = template.misc.lineBreak || 'auto',
      $btnLineSplit = $('.btn-line-split');
    $btnLineSplit.children().removeClass('active');
    $btnLineSplit.find(`[action='${lineSplit}']`).addClass('active');

    var personPreCharacters = template.misc.personPreCharacters || '',
      personPostCharacters = template.misc.personPostCharacters || '';

    $('.person-pre-characters-input').val(personPreCharacters);
    $('.person-post-characters-input').val(personPostCharacters);

    var backgroundClass = _.find(template.css, function(cssRule) {
      return cssRule.match(/^\.background/);
    });

    if (backgroundClass) {
      var backgroundStyles = backgroundClass.match(/[\w-]*:\s[^;]*/g);
      _.forEach(backgroundStyles, (backgroundStyle) => {
        var parts = backgroundStyle.split(': '),
          attribute = parts[0],
          value = parts[1];

        if (attribute === 'background-color') {
          attribute = 'background';
        }

        $(`.css-form .${attribute}-input`).val(value);
      });
    }

    window.editor.reloadSampleQuotes();

    _.forEach(window.editor.pattern, function(cssClass) {
      $('.btn-class-selection .btn[action=' + cssClass + ']').removeClass('hide');
    });
  }

  function importTemplate() {
    var template = JSON.parse($('.textarea-import').val());

    _load(template);
  }

  function loadTemplate() {
    var templateId = window.util.getQueryParam('id');
    if (!templateId) {
      window.generate.start(window.sampleQuotes);
      return $.when(false);
    }

    return $.get('/v1/templates/' + templateId).then(function(data) {
      var template = data.template;
      window.currentTemplate = template;

      _load(template);

      // set the name
      $('.name-heading').html(template.name);

      window.editor.templateLoaded();

      return $.when(data.template);
    });
  }

  function getCssStyle(selector, attribute) {
    var rules = window.editor.getCssRules();
    for (var index in rules) {
      var rule = rules[index];
      if (rule.selectorText === selector) {
        return rule.style[attribute];
      }
    }

    return undefined;
  }

  function getCssStylePxint(selector, attribute) {
    var value = getCssStyle(selector, attribute);
    if (_.isEmpty(value) || typeof value != 'string') {
      return 0;
    }

    return parseInt(value);
  }

  function loadCssStyles(cssClasses) {
    var regexSelector = /^\.[A-Z]+/i,
      regexStyles = /\{\s([\S|\s]*);\s\}/i;
    _.forEach(cssClasses, function(cssClass) {
      var selector = cssClass.match(regexSelector)[0],
        styleStringMatch = cssClass.match(regexStyles);

      if (!styleStringMatch || styleStringMatch.length < 2) return;

      var styleStrings = styleStringMatch[1].split('; '),
        styles = {};

      _.forEach(styleStrings, function(styleString) {
        var split = styleString.split(': ');
        styles[split[0]] = split[1];
      });

      var rules = window.editor.getCssRules();
      _.forEach(rules, function(rule) {
        if (rule.selectorText === selector) {
          _.forEach(styles, function(style, attribute) {
            rule.style[attribute] = style;
          });
        }
      });
    });
  }

  function loadSamples() {
    if (window.util.getQueryParam('quoteIds')) {
      return getQuotes({ids: window.util.getQueryParam('quoteIds').split(',')});
    }
    return $.get('/v1/quotes?sample=true');
  }

  function getQuotes(params) {
    return new Promise((resolve) => {
      $.get(`/v1/quotes`, params).then(resolve);
    });
  }

  function uploadImage(name, buf) {
    return new Promise((resolve) => {
      S3Ajax.put('quoteartquotes', `backgrounds/${name}`, buf, {}, resolve);
    });
  }

  function getBatch(batchId) {
    return $.get(`/v1/quotes?batchId=${batchId}`);
  }

  return {
    loadTemplateList,
    saveTemplate,
    renameTemplate,
    generateImages,
    loadKeywords,
    loadCssStyles,
    getCssStyle,
    loadSamples,
    loadTemplate,
    getQuotes,
    getCssStylePxint,
    getBatch,
    importTemplate,
    uploadImage
  };
})();
