window.util = (() => {
  function getQueryParam(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
        return sParameterName[1];
      }
    }
  }

  function wloop(limit) {
    return {
      limit,
      index: 0,
      inc: function() {
        this.index++;
        if (this.index > this.limit) {
          console.error('Loop exceeded max attemps');
          throw new Error('Loop exceeded max attemps');
        }
        return true;
      }
    };
  }

  function showFeedback(type, message) {
    var $element,
      delay = 2000;
    switch (type) {
      case 'success':
        $element = $('.feedback-success');
      break;
      case 'error':
        $element = $('.feedback-error');
        delay = 5000;
      break;
    }

    $element.html(message);

    $element.slideDown();
    setTimeout(function() {
      $element.slideUp();
    }, 3000);
  }

  function debug(message, shouldDisplay) {
    if (!window.debug) return;

    if (shouldDisplay !== false) console.log(message);
  }

  function emptyPromise() {
    return new Promise((resolve) => {
      resolve();
    });
  }

  return {
    wloop,
    getQueryParam,
    showFeedback,
    debug,
    emptyPromise
  };
})();
