window.uploader = (() => {

  var baseUrl = 'https://s3-us-west-2.amazonaws.com/quoteartquotes/';

  function S3(buf, name, type) {
    return new Promise((resolve) => {
      S3Ajax.put('quoteartquotes', `${type}/${name}`, buf, {}, resolve);
    });
  }

  $(document).ready(() => {
    var dropzone = document.getElementById('dropzone');

    dropzone.ondragover = (e) => {
      e.preventDefault();
    };

    dropzone.ondrop = (e) => {
      e.preventDefault();
      var file = e.dataTransfer.files[0],
        reader = new FileReader();

      reader.onload = (resp) => {
        S3(resp.target.result, file.name, 'background').then(() => {
          var url = `${baseUrl}background/${file.name}`;

          $('.dropzone-output').removeClass('hide');
          $('.input-uploader-url').val(url);
        });
      };

      reader.readAsArrayBuffer(file);
    };
  });

  return {
    S3
  };
})();
