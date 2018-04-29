(function($) {
  $.fn.fontSize = function() {
    return parseFloat(this.css('fontSize').replace('px', ''));
  };

  $.fn.lineHeight = function() {
    return parseFloat(this.css('lineHeight').replace('px', ''));
  };
}(jQuery));
