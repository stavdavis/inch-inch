window.capture = (() => {
  var editorExtensionId = 'pemphhfngdegcoelibapopgfakfkdace',
    genericKeywords = ['quotes', 'quoted', 'quoting', 'quote art', 'typography', 'typography art', 'words',
      'famous quotes', 'words to live by', 'quote designs', 'designer quotes', 'quotations', 'phrases', 'sayings',
      'famous phrases', 'meaningful quotes', 'famous words', 'big words', 'quotes by author', 'powerful words',
      'fine quotes', 'art quotes', 'text art', 'text', 'word art'
    ];

  S3Ajax.KEY_ID = 'AKIAIH3CFL3PFYN2JAGQ';
  S3Ajax.SECRET_KEY = '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';

  function fullSizeMode() {
    $('.panel-wrapper').hide();
    $('body').addClass('capture-mode');
  }

  function base64ToArrayBuffer(base64) {
    var binaryString =  window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function startHD(quoteSet, maxSize) {
    return new Promise((resolve) => {
      processHD(quoteSet, maxSize, resolve);
    });
  }

  function processSample(dataURI, name) {
    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

    var dimensions = window.generate.getDimensions(300);
    // set its dimension to target size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    return new Promise((resolve) => {
      var image = new Image();
      image.onload = function() {
        ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
        resolve();
      };
      image.src = dataURI;
    }).then(() => {
      return new Promise((resolve) => {
        // encode image to data-uri with base64 version of compressed image
        var buf = base64ToArrayBuffer(canvas.toDataURL().replace(/^data:image\/\w+;base64,/, ''));
        S3Ajax.put('quoteartquotes', `quotes/${name}`, buf, {}, resolve);
      });
    });
  }

  function processHD(quoteSet, maxSize, resolve) {
    var quotes = [quoteSet.shift()],
      template = window.currentTemplate.name,
      name = `${template}/${quotes[0].id}-${template}.png`,
      sampleName = `${template}/samples/${quotes[0].id}-${template}.png`;

    console.log(quoteSet.length);

    return window.generate.start(quotes, {maxDocumentDimensions: maxSize}).then(() => {
      chrome.runtime.sendMessage(editorExtensionId, {message: 'captureReady'}, function(resp) {
        processSample(`data:image/png;base64,${resp.image}`, sampleName).then(() => {
          var buf = base64ToArrayBuffer(resp.image);
          S3Ajax.put('quoteartquotes', `quotes/${name}`, buf, {}, function() {
            if (quoteSet.length) {
              processHD(quoteSet, maxSize, resolve);
            } else {
              document.getElementById('done-beep').play();
              resolve();
            }
          });
        });
      });
    });
  }

  function processComposite(background) {
    return new Promise((resolve) => {
      $('.background').css('background', background);
      var width = $('.document-base.background').width(),
       height = $('.document-base.background').height();

      chrome.runtime.sendMessage(editorExtensionId, {message: 'captureReady', crop: {width, height}}, function(resp) {
        resolve(resp.image);
      });
    });
  }

  function showComplete() {
    $('.output').hide();
    $('.completed').show();
    $('body').css('background', 'rgb(39, 78, 132)');
  }

  function startTransparency(quoteSet, maxSize) {
    return new Promise((resolve) => {
      processTransparent(quoteSet, maxSize, resolve);
    });
  }

  function processTransparent(quoteSet, maxSize, resolve) {
    quotes = [quoteSet.shift()];

    console.log(quoteSet.length);

    var composite, baseline,
      template = window.currentTemplate.name,
      name = `${quotes[0].id}`;

    return window.generate.start(quotes, {maxDocumentDimensions: maxSize}).then(() => {
      return processComposite('white');
    })
    .then((image) => {
      composite = image;
      return processComposite('black');
    })
    .then((image) => {
      baseline = image;
      return $.post('/v1/images/transparency', {baseline, composite, name, template});
    }).then(() => {
      if (quoteSet.length) {
        processTransparent(quoteSet, maxSize, resolve);
      } else {
        document.getElementById('done-beep').play();
        resolve();
      }
    });
  }

  function generateMeta(quoteSet) {
    var meta = [];

    for (var index in quoteSet) {
      var quote = quoteSet[index],
        title = quote.text,
        imageid = `${quote.id}-${window.currentTemplate.name}`,
        artistname = 'The Quote Company',
        category = 8000,
        keywords = _.union(_.map(quote.keywords, 'word'), [window.currentTemplate.name]),
        description = '';

      if (quote.author) {
        title = quote.author + ' - ' + title;
        keywords = _.union(quote.author.split(' '), keywords, [quote.author], genericKeywords);
      }

      title = title.replace(/^(.{40}[^\s]*).*/, '$1');
      keyowrds = keywords.join(',');

      meta.push([imageid, title, artistname, keywords, description, category].join('\t'));
    }

    return meta.join('\n');
  }

  function processMeta(quoteSet) {
    var meta = generateMeta(quoteSet);

    S3Ajax.put('quoteartquotes', `quotes/${window.currentTemplate.name}/_meta.tsv`, meta, {}, _.noop,
      function(error) {
        console.log('process meta err', error);
      }
    );
  }

  return {
    start: (quoteSet, opts) => {
      window.debug = false;
      opts = _.extend({meta: true, hd: true, transparency: true}, opts);

      if (opts.meta) {
        processMeta(quoteSet);
      }

      fullSizeMode();

      setTimeout(function() {
        window.util.emptyPromise()
        .then(() => {
          return opts.hd ? startHD(_.clone(quoteSet), opts.hdSize) : window.util.emptyPromise();
        })
        .then(() => {
          return opts.transparency ?
            startTransparency(_.clone(quoteSet), opts.transparentSize) : window.util.emptyPromise();
        })
        .then(() => {
          console.log('resolved');
          showComplete();
        });
      }, 3000);
    },

    base64ToArrayBuffer,
  };
})();
