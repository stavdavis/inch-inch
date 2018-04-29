$.put = function(url, data, callback, type) {
  if ($.isFunction(data)) {
    type = type || callback;
    callback = data;
    data = {};
  }

  return $.ajax({
    url: url,
    type: 'PUT',
    success: callback,
    data: data,
    contentType: type
  });
};

$.delete = function(url, data, callback, type) {
  if ($.isFunction(data)) {
    type = type || callback;
    callback = data;
    data = {};
  }

  return $.ajax({
    url: url,
    type: 'DELETE',
    success: callback,
    data: data,
    contentType: type
  });
};

jQuery.each(['put', 'delete'], function(i, method) {
  jQuery[ method ] = function(url, data, callback, type) {
    if (jQuery.isFunction(data)) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});
