window.sampleQuotes = [];
window.currentTemplate = null;
window.keywords = [];
window.debug = true;
window.textJustify = {};
window.charColors = {};

var fontPack1 = [
  'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Avant Garde', 'Calibri', 'Candara',
  'Century Gothic', 'Franklin Gothic Medium', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Impact', 'Lucida Grande',
  'Optima', 'Segoe UI', 'Tahoma', 'Trebuchet MS', 'Verdana', 'Big Caslon', 'Bodoni MT', 'Book Antiqua', 'Calisto MT',
  'Cambria', 'Didot', 'Garamond', 'Georgia', 'Goudy Old Style', 'Hoefler Text', 'Lucida Bright', 'Palatino',
  'Perpetua', 'Rockwell', 'Rockwell Extra Bold', 'Baskerville', 'Times New Roman', 'Consolas', 'Courier New',
  'Lucida Console', 'Lucida Sans Typewriter', 'Monaco', 'Andale Mono', 'Copperplate', 'Papyrus', 'Brush Script MT'
],
fontPack2 = [
  'Abraham Lincoln', 'Aventura', 'basic title font', 'Bazar', 'BigNoodeTitling', 'Blanch', 'Blessed Day',
  'Champagne & Limousines', 'Chopin Script', 'Cubano', 'Cylburn', 'Hand Shop Typography C30_demo', 'Haymaker',
  'Lavanderia', 'Matchbook', 'Matchbook Serif', 'Mayonaise', 'Ministry', 'Mom´sTypewriter', 'Muncie', 'My Underwood',
  'olivier', 'Ribbon', 'RoughTypewriter', 'Sanietro', 'Special Elite', 'Sunday', 'Tall Films', 'Tall Films Expanded',
  'Tall Films Expanded Oblique', 'Tall Films Fine', 'Tall Films Fine Oblique', 'Tall Films Oblique',
  'Veteran Typewriter', 'Wisom Script', 'yorkwhiteletter'
];

fontPack3 = [
  'BlackBoard', 'Chenier', 'CuteLove', 'HandyGeorge', 'ObjectumSexuality', 'Pea Ellie Bellie', 'Sketch Block'
];

fontPack4 = [
  'a song for jennifer', 'clementine sketch', 'GrutchShaded', 'KG Eyes Wide Open', 'Kraft Nine',
    'Marketing Script Inline', 'Marketing Script Shadow', 'Marketing Script', 'orange juice', 'Return to Sender',
    'ROAD MOVIE'
];

fontPack5 = [
  'Bakery', 'Brown Fox', 'Chopshop', 'KG Life is Messy', 'Love Moment', 'Titania'
];

window.fonts = fontPack1.concat(fontPack2).concat(fontPack3).concat(fontPack4).concat(fontPack5);

$(document).ready(function() {
  $('.panel-wrapper').draggable();

  window.editor.switchClass('.global');

  window.action.loadTemplateList();
  $.when(window.action.loadSamples())
  .then((data) => {
    window.sampleQuotes = data.quotes;
    return window.action.loadKeywords();
  }).then(() => {
    window.editor.init();
    window.filters.init();
    return window.action.loadTemplate();
  });
});
