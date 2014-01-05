/**
 * Ajax object object
 * Gets ajax and returns data through callback function
 */

module.exports = function ajax(url, callback) {
  // Detect https or http
  if (url.substr(0,5) == 'https') {
    var webInterface = require('https');
  } else {
    var webInterface = require('http');
  }
  webInterface.get(url, function(res) {
    var body = '';
    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
      try {
          var response = JSON.parse(body);
          callback(null, response);
        } catch(e) {
      console.log('Error occured in retrieving data from: ' + url);
      console.log(e);
    }
    });
  }).on('error', function(e) {
      console.log("Network error: ", e);
  });
  
}