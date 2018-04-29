var names = [],
  templateName = '',
  urlBase = 'https://s3-us-west-2.amazonaws.com/quoteartquotes/quotes/',
  resultsPerPage = 50,
  currentOffset = 0;

function setTitle() {
  var end = currentOffset + resultsPerPage;
  $('.title').html(`${templateName} (${currentOffset} - ${end})`);
}

function openImages(name) {
  window.open(`${urlBase}${templateName}/${name}.png`, '_blank');
  window.open(`${urlBase}${templateName}/transparent/${name}-ts.png`, '_blank');
}

function showImages() {
  var $content = $('.content'),
    namesSlice = names.slice(currentOffset, currentOffset + resultsPerPage);

  setTitle();

  $content.html('');
  _.forEach(namesSlice, (name) => {
    var html =
      `<div class="content-image-wrapper">
        <a onclick='openImages(${name})'>
          <img src="${urlBase}${templateName}/samples/${name}.png" />
        </a>
      </div>`;
    $content.append(html);
  });
}

$(document).ready(function() {
  templateName = window.util.getQueryParam('template');

  $.get(`${urlBase}${templateName}/_meta.tsv`)
  .then((data) => {
    names = _.map(data.split('\n'), (row) => { return _.head(row.split('\t')); });
    showImages();
  });

  $('.next').click(function() {
    currentOffset += resultsPerPage;
    showImages();
  });

  $('.previous').click(function() {
    currentOffset -= resultsPerPage;
    if (currentOffset < 0) {
      currentOffset = 0;
    }
    showImages();
  });
});
