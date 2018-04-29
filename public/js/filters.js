window.filters = (() => {
  function contentProportions($quote) {
    var width = 0,
      height = 0;
    $quote.find('.line').each(function() {
      var $line = $(this);
      if ($line.width() > width) width = $line.width();
      height += $line.height();
    });

    return width / height;
  }

  function getMinProportions() {
    var width = $('.content-min-proportions-width-input').val(),
      height = $('.content-min-proportions-height-input').val();

    if (!width || !height) {
      return 0;
    }

    return width / height;
  }

  function hasMinProportions($quote) {
    var minProportions = getMinProportions();

    if (!minProportions) {
      return true;
    }

    return contentProportions($quote) <= minProportions;
  }

  function lessThanMaxProportions($quote) {
    var width = $('.content-max-proportions-width-input').val(),
      height = $('.content-max-proportions-height-input').val();

    if (!width || !height) {
      return true;
    }

    return width / height <= contentProportions($quote);
  }

  function getFilters() {
    var filters = {},
      maxCharacters = $('.input-max-characters').val() || 0,
      minCharacters = $('.input-min-characters').val() || 0,
      maxWords = $('.input-max-words').val() || 0,
      minWords = $('.input-min-words').val() || 0,
      maxSentences = $('.input-max-sentences').val() || 0,
      minSentences = $('.input-min-sentences').val() || 0,
      minWidth = $('.content-min-proportions-width-input').val() || 0,
      minHeight = $('.content-min-proportions-height-input').val() || 0,
      isQuestion = $('.checkbox-is-question').attr('checked') ? 1 : 0,
      hasExclamation = $('.checkbox-has-exclamation').attr('checked') ? 1 : 0,
      hasAuthor = $('.checkbox-has-author').attr('checked') ? 1 : 0,
      firstWords = $('.input-first-words').val() || null;

    if (maxCharacters) filters.max_chars = maxCharacters;
    if (minCharacters) filters.min_chars = minCharacters;
    if (maxWords) filters.max_words = maxWords;
    if (minWords) filters.min_words = minWords;
    if (maxSentences) filters.max_sentences = maxSentences;
    if (minWords) filters.min_sentences = minSentences;
    if (minWidth) filters.min_width = minWidth;
    if (minHeight) filters.min_height = minHeight;
    if (isQuestion) filters.is_question = isQuestion;
    if (hasExclamation) filters.has_exclamation = hasExclamation;
    if (hasAuthor) filters.has_author = hasAuthor;
    if (firstWords) filters.first_words = firstWords;

    return filters;
  }

  function loadFilters(filters) {
    filters = filters || {};
    var isQuestion = filters.is_question ? 'checked' : null,
      hasExclamation = filters.has_exclamation ? 'checked' : null,
      hasAuthor = filters.has_author ? 'checked' : null;
    $('.input-max-characters').val(filters.max_chars || '');
    $('.input-min-characters').val(filters.min_chars || '');
    $('.input-max-words').val(filters.max_words || '');
    $('.input-min-words').val(filters.min_words || '');
    $('.input-max-sentences').val(filters.max_sentences || '');
    $('.input-min-sentences').val(filters.min_sentences || '');
    $('.content-min-proportions-width-input').val(filters.min_width || '');
    $('.content-min-proportions-height-input').val(filters.min_height || '');
    $('.checkbox-is-question').attr('checked', isQuestion);
    $('.checkbox-has-exclamation').attr('checked', hasExclamation);
    $('.checkbox-has-author').attr('checked', hasAuthor);
    $('.input-first-words').val(filters.first_words || '');
  }

  function buildFilters() {
    var $filtersOverlay = $('.filters-overlay'),
      maxCharacters = $('.input-max-characters').val() || 0,
      minCharacters = $('.input-min-characters').val() || 0,
      maxWords = $('.input-max-words').val() || 0,
      minWords = $('.input-min-words').val() || 0,
      maxSentences = $('.input-max-sentences').val() || 0,
      minSentences = $('.input-min-sentences').val() || 0,
      minProportions = getMinProportions();
    $filtersOverlay.html('');

    $('.document-base').each(function() {
      var $document = $(this),
        $quote = $document.find('.quote');

      var offset = $document.offset(),
        width = $document.width(),
        height = $document.height(),
        quoteIndex = parseInt($quote.attr('index'), 10),
        quote = window.sampleQuotes[quoteIndex];

      var $div = $('<div class="filters-overlay-quote"></div>');
      $div.css({top: offset.top, left: offset.left, width, height});
      $filtersOverlay.append($div);

      if (minProportions) {
        var quoteWidth = $quote.width(),
          quoteOffset = $quote.offset(),
          quoteLeft = quoteOffset.left - offset.left,
          newHeight = (1 / minProportions) * quoteWidth;

        var $proportionsDiv = $('<div class="filters-overlay-proportions"></div>');
        $proportionsDiv.addClass(hasMinProportions($quote) ? 'pass' : 'fail');
        $proportionsDiv.css({top: (height - newHeight) / 2, left: quoteLeft, width: quoteWidth, height: newHeight});

        $div.append($proportionsDiv);
      }

      if (maxCharacters && quote.text.length > maxCharacters) {
        $div.append($('<div class="filters-overlay-output">MAX CHARACTERS EXCEEDED</div>'));
      }

      if (minCharacters && quote.text.length < minCharacters) {
        $div.append($('<div class="filters-overlay-output">MIN CHARACTERS NOT MET</div>'));
      }

      if (maxWords && quote.text.split(' ').length > maxWords) {
        $div.append($('<div class="filters-overlay-output">MAX WORDS EXCEEDED</div>'));
      }

      if (minWords && quote.text.split(' ').length < minWords) {
        $div.append($('<div class="filters-overlay-output">MIN WORDS NOT MET</div>'));
      }

      if (maxSentences && quote.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|').length > maxSentences) {
        $div.append($('<div class="filters-overlay-output">MAX SENTENCES EXCEEDED</div>'));
      }

      if (minSentences && quote.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|').length < minSentences) {
        $div.append($('<div class="filters-overlay-output">MIN SENTENCES NOT MET</div>'));
      }
    });
  }

  function runtimeFilterLoop(quoteSet, filteredQuotes, minProportions, done) {
    window.sampleQuotes = quoteSet.splice(-10, 10);
    window.generate.start(window.sampleQuotes).then(() => {
      window.filters.buildFilters();
      $('.document-base').each(function() {
        var $document = $(this),
          $quote = $document.find('.quote'),
          quoteIndex = parseInt($quote.attr('index'), 10);

        if (hasMinProportions($quote)) filteredQuotes.push(window.sampleQuotes[quoteIndex]);
      });

      if (!quoteSet.length) return done(filteredQuotes);
      else return runtimeFilterLoop(quoteSet, filteredQuotes, minProportions, done);
    });
  }

  function runtimeFilter(quoteSet) {
    var minProportions = getMinProportions();
    return new Promise((resolve) => {
      if (!minProportions) resolve(quoteSet);
      else runtimeFilterLoop(quoteSet, [], minProportions, resolve);
    });
  }

  function init() {
    $('.show-filters-checkbox').click(function() {
      if (!!$(this).attr('checked')) $('.filters-overlay').removeClass('hide');
      else $('.filters-overlay').addClass('hide');
    });

    $('.filter-controls').blur(function() {
      buildFilters();
    });

    $('.filter-controls').on('keyup', function(e) {
      if (e.keyCode == 13) buildFilters();
    });
  }

  return {
    init,
    contentProportions,
    hasMinProportions,
    lessThanMaxProportions,
    getFilters,
    loadFilters,
    buildFilters,
    runtimeFilter
  };
})();
