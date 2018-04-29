window.editor = (() => {
  function updatePattern() {
    $('.input-pattern').val(window.editor.pattern.join(''));
  }

  function alterCssClass(selector, attribute, value) {
    if (attribute === 'vetical-align') selector = '.global';

    var rules = getCssRules();
    for (var index in rules) {
      var rule = rules[index];
      if (rule.selectorText === selector) {
        rule.style[attribute] = value;
      }
    }
  }

  function getActiveClass() {
    return $('.btn-class-selection .active').attr('action');
  }

  function basicInputChange($input) {
    var attribute = $input.attr('attribute'),
      value = $input.val(),
      selector = '.' + getActiveClass();

    if (attribute === 'font-size') {
      value += '%';
    }

    alterCssClass(selector, attribute, value);
  }

  function reloadSampleQuotes() {
    getFilteredQuotes({limit: 4})
    .then((data) => {
      window.sampleQuotes = data.quotes;
      return window.generate.start(window.sampleQuotes);
    })
    .then(() => {
      window.filters.buildFilters();
    });
  }

  function switchClass(selector) {
    var $btnJustify = $('.btn-toggle[attribute=justify]');

    //text justify
    $btnJustify.children().removeClass('active');
    var justify = window.textJustify[selector] || 'null';
    $btnJustify.find('[action=' + justify + ']').addClass('active');

    //font style
    var fontStyle = window.action.getCssStyle(selector, 'font-style') || 'null',
      $btnFontStyle = $('.btn-font-style');
    $btnFontStyle.children().removeClass('active');
    $btnFontStyle.find('[action=' + fontStyle + ']').addClass('active');

    //text decoration
    var textDecoration = window.action.getCssStyle(selector, 'text-decoration') || 'null',
        $btnTextDecoration = $('.btn-text-decoration');
    $btnTextDecoration.children().removeClass('active');
    $btnTextDecoration.find('[action=' + textDecoration + ']').addClass('active');

    //text transform
    var textTransform = window.action.getCssStyle(selector, 'text-transform') || 'null',
      $btnTextTransform = $('.btn-text-transform');
    $btnTextTransform.children().removeClass('active');
    $btnTextTransform.find('[action=' + textTransform + ']').addClass('active');

    //text align
    var textAlign = window.action.getCssStyle(selector, 'text-align') || 'null',
      $btnTextAlign = $('.btn-toggle[attribute=text-align]');
    $btnTextAlign.children().removeClass('active');
    $btnTextAlign.find('[action=' + textAlign + ']').addClass('active');

    //font family
    var fontFamily = window.action.getCssStyle(selector, 'font-family') || '';
    $('.select-font-family').val(fontFamily.replace(/'/g, '').replace(/"/g, ''));
    $('.select-font-family').trigger('chosen:updated');

    // color
    var color = window.action.getCssStyle(selector, 'color') || '';
    $('.input-color').val(color);

    // font size
    var fontSize = window.action.getCssStyle(selector, 'font-size') || '';
    $('.font-size-label').attr('disabled', selector === '.global');
    $('.input-font-size').attr('disabled', selector === '.global');
    $('.input-font-size').val(fontSize);

    // bold
    $('.btn-font-weight').toggleClass('active', window.action.getCssStyle(selector, 'font-weight') === 'bold');

    // padding
    $('.padding-input[attribute=padding-top]').val(window.action.getCssStylePxint(selector, 'paddingTop') || '');
    $('.padding-input[attribute=padding-bottom]').val(window.action.getCssStylePxint(selector, 'paddingBottom') || '');
    $('.padding-input[attribute=padding-left]').val(window.action.getCssStylePxint(selector, 'paddingLeft') || '');
    $('.padding-input[attribute=padding-right]').val(window.action.getCssStylePxint(selector, 'paddingRight') || '');

    // char colors
    var charColors = window.charColors[selector] || '';
    $('.input-char-colors').val(charColors);

    // line height
    var lineHeight = window.action.getCssStyle(selector, 'line-height') || '';
    $('.line-height-input').val(lineHeight);

    // rotate
    var rotate = window.action.getCssStyle(selector, 'transform') || '';
    $('.input-text-rotate').val(rotate.replace('rotate(', '').replace('deg)', ''));

    var background = window.action.getCssStyle(selector == '.global' ? '.background' : selector, 'background') || '';
    $('.background-input').val(background);

  }

  function templateLoaded() {
    $('.btn.save-as').removeAttr('disabled');
    $('.btn.rename').removeAttr('disabled');
    $('.btn.generate').removeAttr('disabled');
  }

  function setBuildStatus(isBuilding) {
    if (isBuilding) {
      $('.build-status .building').show();
      $('.build-status .ready').hide();
    } else {
      $('.build-status .building').hide();
      $('.build-status .ready').show();
    }
  }

  function initKeywordSelector(keywords) {
    $select = $('.keywords');

    _.forEach(keywords, function(keyword) {
      var selected = _.includes(_.get(window.template, 'keywordIds'), keyword.id) ? ' selected' : '';
      $select.append('<option value="' + keyword.id + '" ' + selected + '>' + keyword.word + '</option>');
    });

    $select.chosen({width: '270px;'});
  }

  function isFirstLineActive() {
    return !!getCssForClass('.first').match(/\.first\s\{\s.+\s\}/);
  }

  function isLastLineActive() {
    return !!getCssForClass('.last').match(/\.last\s\{\s.+\s\}/);
  }

  function getCssRules() {
    return _.find(document.styleSheets, {title: 'quote-styles'}).rules;
  }

  function getFilteredQuotes(params) {
    var filters = window.filters.getFilters();

    if (filters.max_chars) params.maxCharacterCount = filters.max_chars;
    if (filters.min_chars) params.minCharacterCount = filters.min_chars;
    if (filters.max_words) params.maxWordCount = filters.max_words;
    if (filters.min_words) params.minWordCount = filters.min_words;
    if (filters.max_sentences) params.maxSentenceCount = filters.max_sentences;
    if (filters.min_sentences) params.minSentenceCount = filters.min_sentences;
    if (filters.is_question) params.question = 1;
    if (filters.has_exclamation) params.exclamation = 1;
    if (filters.has_exclamation) params.exclamation = 1;
    if (filters.has_author) params.hasAuthor = 1;
    if (filters.first_words) params.firstWords = filters.first_words.split('|');

    return window.action.getQuotes(params);
  }

  function getCssForClass(selector) {
    var rules = getCssRules();
    for (var index in rules) {
      var rule = rules[index];
      if (rule.selectorText === selector) {
        return rule.cssText;
      }
    }
  }

  function init() {
    var modal = $('#modal');

    initKeywordSelector(keywords);

    modal.find('.btn.resolve').on('click', function() {
      var value = modal.find('.input-modal').val();
      switch (modalMode) {
        case 'save':
          window.action.saveTemplate(false, value);
          break;
        case 'save-as':
          window.action.saveTemplate(false, value);
          break;
        case 'rename':
          window.action.renameTemplate(value);
          break;
      }
      modal.modal('hide');
    });

    modal.on('hide.bs.modal', function() {
      modal.find('.input-modal').val('');
    });

    // EXPORT
    $('.save').on('click', function() {
      if (_.get(window, 'currentTemplate.id')) {
        window.action.saveTemplate(true, null);
      } else {
        modal.find('label').html('Template Name');
        modal.find('.modal-title').html('Save Template');
        modalMode = 'save';
        modal.modal('show');
      }
    });

    $('.save-as').on('click', function() {
      modal.find('label').html('Template Name');
      modal.find('.modal-title').html('Save Template As');
      modalMode = 'save-as';
      modal.modal('show');
    });

    $('.rename').on('click', function() {
      modal.find('label').html('Template Name');
      modal.find('.modal-title').html('Rename Template');
      modalMode = 'rename';
      modal.modal('show');
    });

    $('.capture').on('click', function() {
      var opts = {
          meta: !!$('.meta-checkbox').attr('checked'),
          hd: !!$('.hd-checkbox').attr('checked'),
          transparency: !!$('.transparency-checkbox').attr('checked'),
          hdSize: parseInt($('.input-hd-size').val()),
          transparentSize: parseInt($('.input-transparent-size').val()),
          limit: parseInt($('.input-capture-limit').val() || 0)
        },
        params = {};

      if (opts.limit) params.limit = opts.limit;

      getFilteredQuotes(params).then((resp) => {
        return window.filters.runtimeFilter(resp.quotes);
      }).then((filteredQuotes) => {
        window.capture.start(filteredQuotes, opts);
      });
    });

    $('.btn-reload-samples').on('click', function() {
      reloadSampleQuotes();
    });

    // PATTERN INPUT
    $('.input-pattern').on('keyup', function() {
      var value = $(this).val();
      window.editor.pattern = value.split('');
      window.generate.start(sampleQuotes);
    });

    // COLOR, FONT-SIZE, LINE-HEIGHT
    $('.css-form input[type=textbox]:not(.document-modify):not(.background)').on('keyup', function(e) {
      if (e.keyCode == 13) {
        basicInputChange($(this));
        window.generate.start(sampleQuotes);
      }
    });

    var $fontSelect = $('.select-font-family');
    _.forEach(_.sortBy(window.fonts), function(font) {
      $fontSelect.append('<option style="font-family: ' + font + '">' + font + '</option>');
    });
    $fontSelect.chosen({width: '245px;', 'placeholder_text_single': 'Select font ...'});
    $fontSelect.on('change', function() {
      var $select = $(this),
      selector = '.' + getActiveClass(),
      attribute = 'font-family',
      value = $select.val();

      alterCssClass(selector, attribute, value);
      window.generate.start(sampleQuotes);
    });

    $('.css-form input[type=textbox]:not(.document-modify):not(.background)').blur(function() {
      basicInputChange($(this));
      window.generate.start(sampleQuotes);
    });

    // FONT STYLE, TEXT DECORATION
    $('.css-form .btn-toggle:not([attribute=justify]) .btn').on('click', function() {
      var $button = $(this),
        selector = '.' + getActiveClass(),
        attribute = $button.parent().attr('attribute'),
        value = $button.attr('action');

      if (attribute === 'vertical-align') selector = '.global';

      alterCssClass(selector, attribute, value);
      window.generate.start(sampleQuotes);
    });

    // TEXT JUSTIFY
    $('.css-form .btn-toggle[attribute=justify] .btn').on('click', function() {
      var $button = $(this);

      if ($button.hasClass('active')) return;

      var selector = '.' + getActiveClass(),
        value = $button.attr('action');

      window.textJustify[selector] = value;
      if (value === 'null') delete window.textJustify[selector];

      window.generate.start(sampleQuotes);
    });

    // FONT WEIGHT
    $('.css-form .btn-font-weight').on('click', function() {
      var $btn = $(this),
        selector = '.' + getActiveClass();

      $btn.toggleClass('active');

      var value = $btn.hasClass('active') ? 'bold' : 'normal';
      alterCssClass(selector, 'font-weight', value);
      window.generate.start(sampleQuotes);
    });

    // + CLASS
    $('.btn-class-modifier .btn[action=add]').on('click', function() {
      var index = $('.btn-class-selection :not(.hide)').length - 2;
      var $classSelector = $('.btn-class-selection .btn:eq(' + index + ')');

      $classSelector.removeClass('hide');
      window.editor.pattern.push($classSelector.attr('action'));
      updatePattern();
      window.generate.start(sampleQuotes);
    });

    // - CLASS
    $('.btn-class-modifier .btn[action=remove]').on('click', function() {
      var visibleChildren = $('.btn-class-selection :not(.hide)').length;

      if (visibleChildren == 4) return;
      var index = visibleChildren - 3,
        $item = $('.btn-class-selection .btn:eq(' + index + ')');

      $item.addClass('hide');

      _.pull(window.editor.pattern, $item.attr('action'));
      updatePattern();
      window.generate.start(sampleQuotes);
      // TODO: clear styles
    });

    // change current CLASS
    $('.btn-class-selection .btn').on('click', function() {
      var selector = '.' + $(this).attr('action');
      $('.styles-wrapper').attr('pattern', $(this).attr('action'));
      switchClass(selector);
    });

    $('.btn-panel').on('click', function() {
      var $btn = $(this),
        $parent = $btn.parent();

      $parent.siblings().children('.panel-content').addClass('hide');
      $parent.siblings().children('.btn-panel').removeClass('active');

      $btn.siblings('.panel-content').toggleClass('hide');
      $btn.toggleClass('active');
    });

    // BACKGROUND IMAGE [enter]
    $('.css-form .background-input').on('keyup', function(e) {
      if (e.keyCode == 13) {
        var selector = '.' + getActiveClass();
        alterCssClass(selector == '.global' ? '.background' : selector, 'background', $(this).val());
      }
    });

    // BACKGROUND IMAGE [blur]
    $('.css-form .background-input').on('blur', function() {
      var selector = '.' + getActiveClass();
      alterCssClass(selector == '.global' ? '.background' : selector, 'background', $(this).val());
    });

    // BORDER [enter]
    $('.css-form .border-input').on('keyup', function(e) {
      if (e.keyCode == 13) {
        alterCssClass('.background', 'border', $(this).val());
      }
    });

    // BORDER [blur]
    $('.css-form .border-input').on('blur', function() {
      alterCssClass('.background', 'border', $(this).val());
    });

    // TEXT ROTATE
    $('.css-form .input-text-rotate').on('keyup', function(e) {
      var selector = '.' + getActiveClass(),
        value = $(this).val();
      if (e.keyCode == 13) {
        alterCssClass(selector, '-webkit-transform', `rotate(${value}deg)`);
      }
    });

    // TEXT ROTATE
    $('.css-form .input-text-rotate').on('blur', function() {
      var selector = '.' + getActiveClass(),
        value = $(this).val();
      alterCssClass(selector, '-webkit-transform', `rotate(${value}deg)`);
    });

    // PADDING
    $('.css-form .padding-input').on('keyup', function(e) {
      var selector = '.' + getActiveClass(),
        value = $(this).val();
      if (e.keyCode == 13) {
        alterCssClass(selector, $(this).attr('attribute'), `${value}%`);
      }
    });

    // PADDING
    $('.css-form .padding-input').on('blur', function() {
      var selector = '.' + getActiveClass(),
        value = $(this).val();
      alterCssClass(selector, $(this).attr('attribute'), `${value}%`);
    });

    // CHARACTER COLORS
    $('.css-form .input-char-colors').on('blur', function() {
      var selector = '.' + getActiveClass(),
        value = $(this).val();
      window.charColors[selector] = value;
      if (value === 'null') delete window.textJustify[selector];

      window.generate.start(sampleQuotes);
    });

    // CREATE SVG
    $('.textarea-svg').on('keyup', function() {
      var value = $(this).val();
      $('.svg-preview svg').html(value);
    });

    // DOCUMENT PADDING
    $('.css-form input[type=textbox].document-modify').blur(function() {
      window.generate.start(sampleQuotes);
    });

    $('.css-form input[type=textbox].document-modify').on('keyup', function(e) {
      if (e.keyCode == 13) window.generate.start(sampleQuotes);
    });

    $('.update-line-breaks').on('click', function() {
      window.generate.start(sampleQuotes);
    });

    // REMOVE PUNCTUATION
    $('.remove-punctuation-checkbox').click(function() {
      window.generate.start(sampleQuotes);
    });

    // REMOVE AUTHOR
    $('.remove-author-checkbox, .wrap-in-quotes-checkbox').click(function() {
      window.generate.start(sampleQuotes);
    });

    $('.btn-import').click(function() {
      window.action.importTemplate();
    });

    // always last!
    $('.btn-toggle .btn').on('click', function() {
      $(this).siblings().removeClass('active');
      $(this).addClass('active');
    });
  }

  return {
    init,
    templateLoaded,
    setBuildStatus,
    pattern: [],
    switchClass,
    getCssForClass,
    isFirstLineActive,
    isLastLineActive,
    alterCssClass,
    getCssRules,
    reloadSampleQuotes
  };
})();
