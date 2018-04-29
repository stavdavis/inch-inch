window.highlighter = (() => {

  function highlight(quote) {
    var sentences = quote.text.replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');

    _.each(sentences, (sentence, index) => {
      var parsey = quote.parsey[index];

      _.each(parsey, (data) => {
        var type = data.type,
          word = data.word;

        if (type == 'NN dobj') {
          sentence = sentence.replace(word, `<i class='highlight' type='NN-dobj'>${word}</i>`);
        }
      });

      sentences[index] = sentence;
    });

    quote.text = sentences.join(' ');
  }

  return {highlight};
})();
