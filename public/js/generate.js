window.generate = (() => {

  function quoteWrapper(index) {
    var HTML =
      `<div class="document-base background" index="${index}">` +
        '<div class="document-padding">' +
        '<div class="document">' +
          '<div class="document-inner document-inner-base">' +
            `<div class="quote global" index="${index}">` +
            '</div>' +
          '</div>' +
        '</div>' +
        '</div>' +
      '</div>';

    return HTML;
  }

  function changeDimensions(max) {
    var w = $('.proportions-width-input').val(),
      h = $('.proportions-height-input').val();

    if (!w || !h) return;

    var width,
      height;

    if (w > h) {
      width = max;
      height = (width * h) / w;
    } else {
      height = max;
      width = (height * w) / h;
    }

    $('.document-base').css({ width: width, height: height });
  }

  function getDimensions(max) {
    var w = $('.proportions-width-input').val(),
      h = $('.proportions-height-input').val();

    if (!w || !h) return;

    var width,
      height;

    if (w > h) {
      width = max;
      height = (width * h) / w;
    } else {
      height = max;
      width = (height * w) / h;
    }

    return {width, height};
  }

  function changePadding() {
    var l = $('.padding-left-input').val() || 0,
      r = $('.padding-right-input').val() || 0,
      t = $('.padding-top-input').val() || 0,
      b = $('.padding-bottom-input').val() || 0;

    l = l + '%';
    r = r + '%';
    t = t + '%';
    b = b + '%';
    $('.document-padding').css({ paddingTop: t, paddingBottom: b, paddingLeft: l, paddingRight: r });
  }

  function changeInnerDimensions() {
    var width = parseFloat($('.document-base').css('width').replace('px', ''));
    var height = parseFloat($('.document-base').css('height').replace('px', ''));

    var paddingTop = parseFloat($('.document-padding').css('paddingTop').replace('px', ''));
    var paddingBottom = parseFloat($('.document-padding').css('paddingBottom').replace('px', ''));
    var paddingLeft = parseFloat($('.document-padding').css('paddingLeft').replace('px', ''));
    var paddingRight = parseFloat($('.document-padding').css('paddingRight').replace('px', ''));

    var borderWidth = parseFloat($('.document-base').css('borderWidth').replace('px', ''));

    width = width - paddingLeft - paddingRight - (borderWidth * 2);
    height = height - paddingTop - paddingBottom - (borderWidth * 2);

    $('.document').css({width: width, height: height});
  }

  function breakLinesWords(quote, author, $document, fontSize) {
    var $quote = $document.find('.quote'),
      documentHeight = $document.height(),
      documentWidth = $document.width(),
      words = quote.split(' '),
      markup = [],
      pattern = window.editor.pattern,
      patternIndex = 0,
      currentPattern = pattern[0] || '',
      fixedFontSize = !!fontSize;

    fontSize = fontSize || parseInt($quote.css('fontSize').replace('px', ''));

    $.each(words, function(index, word) {
      if (window.editor.isFirstLineActive() && index === 0) {
        patternIndex = -1;
        currentPattern = 'first';
      }
      if (window.editor.isLastLineActive() && index === words.length - 1) {
        currentPattern = 'last';
      }
      markup.push(`<span class="line ${currentPattern}">${word}</span>`);

      patternIndex++;
      if (patternIndex >= pattern.length) patternIndex = 0;
      currentPattern = _.nth(pattern, patternIndex) || '';
    });

    // Author
    if (author) {
      markup.push('<span class="line person">' + author + '</span>');
    }

    $quote.html(`<div>${markup.join('\n')}</div>`);
    $quote.css('fontSize', fontSize);
    var $div = $quote.find('div');

    var wlooper = window.util.wloop(5000);
    if (!fixedFontSize) {
      if ($div.height() < documentHeight && $div.width() <= documentWidth) {
        while ($div.height() < documentHeight && $div.width() <= documentWidth) {
          fontSize++;
          $quote.css('fontSize', fontSize);
          if (!wlooper.inc()) {
            break;
          }
        }
        $quote.css('fontSize', fontSize - 1);
      } else {
        while ($div.height() > documentHeight || $div.width() > documentWidth) {
          fontSize--;
          $quote.css('fontSize', fontSize);
          if (!wlooper.inc()) {
            break;
          }
        }
        $quote.css('fontSize', fontSize + 1);
      }
    }

    $quote.html(markup.join('\n'));
  }

  function breakLines(quote, author, $document, fontSize) {
    var $quote = $document.find('.quote'),
      documentHeight = $document.height(),
      documentWidth = $document.width(),
      words = quote.split(' '),
      markup = [],
      fixedFontSize = !!fontSize;

    fontSize = fontSize || parseInt($quote.css('fontSize').replace('px', ''));

    $quote.html(`<div><span style="white-space: normal !important;">${quote}</span></div>`);
    $div = $quote.find('div');
    $quote.css('fontSize', fontSize);

    // Note: This isn't working fully as expected. actual div.width() may be much higher than is actually being
    // returned. This means that for a single line quote it has to increase the font to a very high number before
    // $div.height() will exceed documentHeight
    var wlooper = window.util.wloop(5000);
    if (!fixedFontSize) {
      if ($div.height() < documentHeight && $div.width() <= documentWidth) {
        while ($div.height() < documentHeight && $div.width() <= documentWidth) {
          fontSize++;
          $quote.css('fontSize', fontSize);
          if (!wlooper.inc()) {
            break;
          }
        }
        $quote.css('fontSize', fontSize - 1);
      } else {
        while ($div.height() > documentHeight || $div.width() > documentWidth) {
          fontSize--;
          $quote.css('fontSize', fontSize);
          if (!wlooper.inc()) {
            break;
          }
        }
        $quote.css('fontSize', fontSize + 1);
      }
    }

    $quote.html('');

    var line = [],
      pattern = window.editor.pattern,
      patternIndex = 0,
      currentPattern = pattern[0] || '',
      lineDocumentWidth = documentWidth;

    if (window.editor.isFirstLineActive()) {
      patternIndex = -1;
      currentPattern = 'first';
    }

    var $span =
      $(`<span class="line ${currentPattern}" style="white-space: nowrap; padding-left: 0; padding-right: 0;"></span>`);
    $quote.append($span);

    var paddingLeft = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingLeft') * 0.01,
      paddingRight = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingRight') * 0.01;

    // for lines with padding we actually have to shrink the document because line width doesn't seem to be respecting
    // the padding
    lineDocumentWidth = documentWidth - paddingLeft - paddingRight;
    $document.css('width', lineDocumentWidth);

    $.each(words, function(index, word) {
      line.push(word);
      $span.html(line.join(' '));

      // TODO: what about the case when single word is larger than document width
      if ($span.width() > lineDocumentWidth  && line.length > 1) {
        line.pop();
        markup.push(`<span class="line ${currentPattern}">${line.join(' ')}</span>`);

        $span.removeClass(currentPattern);
        patternIndex++;
        if (patternIndex >= pattern.length) patternIndex = 0;
        currentPattern = _.nth(pattern, patternIndex) || '';
        $span.addClass(currentPattern);

        paddingLeft = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingLeft') * 0.01;
        paddingRight = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingRight') * 0.01;
        lineDocumentWidth = documentWidth - paddingLeft - paddingRight;
        $document.css('width', lineDocumentWidth);

        line = [word];
      }
    });

    // last line
    // to ensure that the last line isn't too long with the "last" style we need to push
    // any words that overflow on a new previous line
    if (window.editor.isLastLineActive()) {
      $span.removeClass(currentPattern);
      $span.addClass('last');
      $span.html(line.join(' '));

      paddingLeft = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingLeft') * 0.01;
      paddingRight = documentWidth * window.action.getCssStylePxint(`.${currentPattern}`, 'paddingRight') * 0.01;
      lineDocumentWidth = documentWidth - paddingLeft - paddingRight;
      $document.css('width', lineDocumentWidth);

      // If the last line is too long after setting ".last" then start pulling words off the front of the line and
      // add them to another line which will be inserted above last line
      var overflow = [];
      while ($span.width() > lineDocumentWidth) {
        overflow.push(line.shift());
        $span.html(line.join(' '));
      }
      if (overflow.length) {
        markup.push(`<span class="line ${currentPattern}">${overflow.join(' ')}</span>`);
      }

      if (line.length) {
        markup.push(`<span class="line last">${line.join(' ')}</span>`);
      }

    // We've already vetted the last with currentPattern so just add it
    } else {
      markup.push(`<span class="line ${currentPattern}">${line.join(' ')}</span>`);
    }

    // Author
    if (author) {
      markup.push('<span class="line person">' + author + '</span>');
    }

    // return document width and add markup
    $document.css('width', documentWidth);
    $quote.html(markup.join('\n'));
  }

  function addJustifyAttr($document) {
    $.each(window.textJustify, function(selector, value) {
      $document.find(selector).attr('justify', value);
    });
  }

  function addColorsAttr($document) {
    $.each(window.charColors, function(selector, value) {
      $document.find(selector).attr('colors', value);
    });
  }

  function justifySize($document) {
    var docSize = $('.document').width(),
      smallestFontSize = null,
      smallestLineHeight = null;

    $document.find('.quote[justify=size] span:not([justify]),span[justify=size]').each(function() {
      var $this = $(this);

      if (_.isEmpty($this.html())) {
        console.log('warning: attempting to justity size on empty line', $document);
      }

      // weird, rapid itteration can cause stylesheet version to get ignored, here seems to fix it
      $this.css({'white-space': 'nowrap', 'display': 'inline'});
      var contentWidth = $this.width();
      var size = Math.floor((docSize / contentWidth) * $this.fontSize());
      $(this).css('font-size', size);

      var i = 0;
      while ($(this).width() < docSize) {
        size++;
        $(this).css('font-size', size);
        // TODO: if old size is greater than new size throw error and exit
        i++;
        if (i > 5000) throw console.error('Infinite!!', contentWidth, docSize, size, $document);
      }

      // we may have gone over with the last itteration so scale it back until it just fits
      while ($(this).width() >= docSize) {
        size = (size * 10 - 1) / 10;
        $(this).css('font-size', size);
        i++;
        if (i > 5000) throw console.error('Infinite!!', $(this).width(), docSize, size);
      }

      $this.css({display: 'block'});
    });

    $document.find('.quote span').each(function() {
      var fontSize = $(this).fontSize();
      if (!smallestFontSize || fontSize < smallestFontSize) {
        smallestFontSize = fontSize;
        smallestLineHeight = $(this).lineHeight();
      }
    });

    var lineSpace = smallestLineHeight - smallestFontSize;
    $document.find('.quote[justify=size] span:not([justify]),span[justify=size]').each(function() {
      var $this = $(this),
        lineHeight = $this.fontSize() + lineSpace;

      $this.css('lineHeight', lineHeight + 'px');
    });
  }

  function justifyLetter($document) {
    var docSize = $('.document').width();
    $document.find('.quote[justify=letter] span:not([justify]),span[justify=letter]').each(function() {
      var $this = $(this),
        charCount = $this.text().length,
        letterSpacing = (docSize - $this.width()) / (charCount - 1),
        html = '';

      letterSpacing = letterSpacing < 0 ? 0 : letterSpacing;

      var textArray = $this.text().split(''),
        lastLetter = textArray.pop(),
        text = textArray.join('');

      html = `<div style="display: inline; letter-spacing: ${letterSpacing}px">${text}</div>` +
        `<div style="display: inline; letter-spacing: 0">${lastLetter}</div>`;
      $this.html(html);
      $inner = $this.find('div:first-child');

      var wlooper = window.util.wloop(50);
      while ($this.width() > docSize || $this.parent().width() > docSize) {
        window.util.debug(`justifyLetter: LINE TOO LONG ${docSize}:${$this.width()}:${$this.parent().width()},` +
          ` ${letterSpacing}`);
        letterSpacing = letterSpacing - 0.1;
        $inner.css({'letter-spacing': letterSpacing});
        wlooper.inc();
      }
    });
  }

  function justifyWord($document) {
    var docSize = $('.document').width();
    $document.find('.quote[justify=word] span:not([justify]),span[justify=word]').each(function() {
      $(this).css('word-spacing', 0);

      var $this = $(this),
        wordCount = $this.text().split(' ').length,
        wordSpacing = (docSize - $this.width()) / (wordCount - 1);

      wordSpacing = wordSpacing < 0 ? 0 : wordSpacing;

      $this.css('word-spacing', wordSpacing);

      var wlooper = window.util.wloop(50);
      while ($this.width() > docSize || $this.parent().width() > docSize) {
        window.util.debug(`justifyWord: LINE TOO LONG ${docSize}:${$this.width()}:${$this.parent().width()},` +
          ` ${wordSpacing}`);
        wordSpacing = wordSpacing - 0.1;
        $this.css('word-spacing', wordSpacing);
        wlooper.inc();
      }
    });
  }

  function addCharacterColors($quote) {
    var globalColors = $quote.attr('colors');
    if (globalColors) globalColors = globalColors.split('|');
    var mainIndex = 0;
    $quote.find('.line').each(function() {
      var $this = $(this),
        lineColors = $this.attr('colors'),
        colors = lineColors ? lineColors.split('|') : globalColors;
      if (!colors) return true;
      $this.html(
        _.map($this.html(), (char, charIndex) => {
          var index = globalColors ? mainIndex : charIndex;
          mainIndex++;
          return `<div style="color: ${colors[index % colors.length]}">${char}</div>`;
        })
        .join('')
      );
    });
  }

  function buildQuote(quote, author, $document, fontSize, isDecrease, lastHTML, itteration) {
    var $quote = $document.find('.quote');
    fontSize = fontSize || null;

    itteration = itteration || 0;
    if (itteration > 500) {
      throw console.error('Infinite!! buildQuote', quote, $quote.height(), $document.height(), $quote.width(),
        $document.width());
    }
    itteration++;

    // breaklines
    var lineSplit = $('.css-form .btn-toggle[attribute=line-split] .btn.active').attr('action');
    if (lineSplit === 'word') breakLinesWords(quote, author, $document, fontSize);
    else breakLines(quote, author, $document, fontSize);

    // add the justify attributes for rendering later
    addJustifyAttr($document);
    addColorsAttr($document);

    // justify size
    justifySize($document);

    justifyLetter($document);
    justifyWord($document);

    // if we've gone over decrease no matter what
    if ($quote.height() > $document.height() || $quote.width() > $document.width()) {
      window.util.debug(
        `TOO LARGE, DECREASING HEIGHT ${$document.height()}:${$quote.height()}`,
        $quote.height() > $document.height()
      );
      window.util.debug(
        `TOO LARGE, DECREASING WIDTH ${$document.width()}:${$quote.width()} FONT SIZE:${fontSize}`,
        $quote.width() > $document.width()
      );
      // If quote.width() is more than %20 percent larger than $document.width() make an approximation about how far to
      // to lower instead of incrementally lowering
      if (itteration == 1 && $quote.width() / $document.width() > 1.2) {
        fontSize = Math.ceil((($document.width() * 1.2) * $quote.fontSize()) / $quote.width());
      } else {
        fontSize = $quote.fontSize() - 1;
      }
      buildQuote(quote, author, $document, fontSize, true, $quote.html(), itteration);
    } else if (lastHTML == $quote.html()) {
      window.util.debug('buildQuote: exiting, html unchanged for itteration');
      addCharacterColors($quote);
    // else if we disn't previously decrease attempt an increase
    } else if (!isDecrease) {
      window.util.debug(`INCREASING FONT SIZE, ${fontSize}`, true);
      fontSize = $quote.fontSize() + 1;
      buildQuote(quote, author, $document, fontSize, false, $quote.html(), itteration);
    } else {
      console.log('ERROR: build quote completed without equal html');
      console.log('Final sizes', $quote.height(), $document.height(), $quote.width(), $document.width());
      addCharacterColors($quote);
    }
  }

  function start(quotes, opts) {
    return new Promise((resolve) => {
      opts = _.extend({maxDocumentDimensions: 800}, opts);
      window.editor.setBuildStatus(true);

      setTimeout(function() {
        // replace html
        var $output = $(`.output`);
        var outputHTML = '';
        _.forEach(quotes, function(quote, index) {
          outputHTML += quoteWrapper(index);
        });

        // add empty quote wrapper
        $output.html(outputHTML);

        // apply document parameters
        changeDimensions(opts.maxDocumentDimensions);
        changePadding();
        changeInnerDimensions();

        // TODO: should be able to use lodash
        var index;
        for (index = 0; index < quotes.length; index++) {
          var quote = quotes[index],
            author = quote.author,
            text = quote.text,
            $document = $output.find(`.document-base[index=${index}]`);

          author = $('.remove-author-checkbox').is(':checked') ? '' : author;
          if ($('.remove-punctuation-checkbox').is(':checked')) {
            text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\?\']/g,'');
          }

          if (author) {
            author = $('.person-pre-characters-input').val() + author;
            author += $('.person-post-characters-input').val();
          }

          if ($('.wrap-in-quotes-checkbox').is(':checked')) text = `"${text}"`;

          buildQuote(text, author, $document.find('.document'));
        }
        window.editor.setBuildStatus(false);
        resolve();
      }, 0);
    });
  }

  return {
    start,
    getDimensions
  };
})();
