/**
  Commenting notes:

  //!  This is a TODO
  //?  This is a question
  //D  This needs debugging
**/

/**
 * Config
 */
var config = require('./config.json');


/**
 * General Includes
 */
var fs = require('fs');

/**
 * Express
 */
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var url = require('url');

// Cookies for session detection
app.use(express.cookieParser()); app.use(express.session({secret: 'correcthorsebatterystaplejustkidding2937geuwjghv9dufg'}));

// Set up jade
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// Static file support in specific folders
app.configure(function(){
  app.use('/css', express.static(__dirname + '/css'));
  app.use('/fonts', express.static(__dirname + '/fonts'));
  app.use('/js', express.static(__dirname + '/js'));
  app.use('/json/*', express.static(__dirname + '/json'));
});

// Developer mode to unminify jade output
app.configure('development', function () { app.locals.pretty = true; });

app.use(express.favicon(__dirname + '/images/icons/favicon.ico'));

/**
 * Data Retrieving
 */
// var http = require('http'); // Already declared earlier
var https = require('https');


/**
 * Time support library
 * http://momentjs.com/ 
 */

// Unfortunately, the simplest way of making timeSince go inside the moment object,
// we gotta use the global.
global.moment = require('moment-timezone'); 
moment().tz("Etc/Universal").format();

//! Gotta figure out a way to make time relative to us. Coinsight returns gmt 
// moment().tz("America/Los_Angeles").format();


/**
 * Extensions to some objects
 *  moment.timeSince() - Formats time since in a human readable version
 *  Object.size() - Returns the size of object
 */
require(__dirname + '/functions.js');

/**
 * StatusItem superclass
 *  statusItem
 */
var statusItem = require(__dirname + '/classes/statusitem.js');

/**
 * coinsight superclass
 *  
 */
var coinsight = require(__dirname + '/classes/coinsight.js');

/**
 * profileMeta superclass
 *  
 */
var profileMeta = require(__dirname + '/classes/profilemeta.js');
//? I have a naming dilemma. What should I change this to?


// Pool variable contains all the profiles (coinsight objects)
// These objects are temporary and are regenerated every once in a while
var pool;

// profilemeta variable contains the profile meta
var profilemeta = [];

// If all goes correctly, the keys of pool and profilemeta should refer to the same profile for the same key

/**
 * StatusItem superclass
 *  statusItem
 */
var ajax = require(__dirname + '/classes/ajax.js');

//? AmIDoingThisRiteHereToo?
var status = {
  main: new statusItem(['server']),
  startup: new statusItem(['coinsight','btce-ticker', 'profilemeta'])
};

app.get('/status', function(req, res) {
  // Variable get has the get variables ..
  var url_parts = url.parse(req.url, true); var get = url_parts.query;

  // Public IP address
  var remoteIP = req.connection.remoteAddress;

  // Return data. Cannot be blank
  
  res.send('Coinsight last updated: ' + pool[0].objectAge() + ' seconds ago. BTC-e sell: ' + btce.sell + '<br />BTC-e buy: ' + btce.buy + '<br />Predictions from ' + pool[0].size + ' users.<br />' + pool[0].numBulls + ' bulls (' + pool[0].percentBulls + '%)<br />' + pool[0].numBears + ' bears (' + pool[0].percentBears + '%)<iframe src="/chosen-ones/api"  seamless="seamless" style="width:100%;height:70%;"></iframe>');
});

// More like debug tools
app.get('/api', function(req, res) {

  var url_parts = url.parse(req.url, true); var get = url_parts.query;
  if (typeof get.profile !== 'undefined') {
    var theKey = -1;
    for (key in pool) {
      if (pool[key]['slug'] == get.profile) {
        theKey = key;
      }
    }

    if (theKey != -1) {
      // Valid slug

      // Figure out what data was requested
      if (typeof get.users !== 'undefined') {
        res.send(pool[theKey].users);
      } else if (typeof get.profilemeta !== 'undefined') {
        res.send(profilemeta[theKey]);
      } else {
        res.send(pool[theKey]);
      }
    } else {
      res.send('Profile not found.');
    }
  } else {
    // Return the whole pool
    res.send(pool);
  }
});




app.get('/chosen-ones/coinsightobject', function(req, res) {
  // Return data. Cannot be blank
  res.send(pool[0]);
});

// Show a profile
app.get('/profile/*', function(req, res) {
  // Variable get has the get variables ..
  var url_parts = url.parse(req.url, true); var get = url_parts.query;

  // Public IP address
  var remoteIP = req.connection.remoteAddress;

  //console.log('Hostname: ' + req.headers.host);

  var profileslug = req.url.replace("/profile/","");
  var profile = '';

  var theKey = 0;
  for (key in pool) {
    console.log(key);
    if (pool[key]['slug'] == profileslug) {
      console.log(pool[key]);
      profile = pool[key];
      theKey = key;
    }
  }


  profileslug = profileslug.replace(/[^a-z0-9-.\s]/gi, ''); // Overprotective much, but prevent XSS

  var statusText = [];

  statusText.push('Debug data: <a href="/api/?users&profile=' + profileslug + '">users</a>, <a href="/api/?coinsight&profile=' + profileslug + '">coinsight Object</a>, <a href="/api/?profilemeta&profile=' + profileslug + '">profilemeta</a> ');

  console.log('>>>>>>');
  //console.log(profile);
  console.log('<<<<<<');
  res.render('overview', {
    'title':'Profile: ' + profile.name,
    "page": 'profile',
    "profile": profile,
    "statusText": statusText.join(' | ')
  });

  //res.send('<a href="/chosen-ones">Click here to view the chosen ones.</a>');
});

// JSON charts API
app.get('/json/*', function(req, res) {
  // Variable get has the get variables ..
  var url_parts = url.parse(req.url, true); var get = url_parts.query;

  // Public IP address
  var remoteIP = req.connection.remoteAddress;

  // Needs to work with highchart json data.
  // Example: http://www.highcharts.com/samples/data/jsonp.php?filename=msft-c.json&callback=jQuery1102043988744518719614_1387152045365&_=1387152045366

  if (!('filename' in get)) {
    get['filename'] = '';
  }

  if (!('callback' in get)) {
    get['callback'] = 'callback';
  }

  // Filter out input to prevent an injection attack
  // Remove everything except letters, numbers, dots and hyphen or underscore
  get['filename'] = get['filename'].replace(/[^a-z0-9-.\s]/gi, '');
  get['callback'] = get['callback'].replace(/[^a-z0-9_.\s]/gi, '');

  res.set('Content-Type', 'text/javascript');
  console.log(__dirname + '/json/' + get['filename']);
  fs.readFile(__dirname + '/json/' + get['filename'], 'utf8', function (err,jsonFile) {
    if (err) {
      console.log('JSON file not found: ' + get['filename']);
    } else {
      jsonFile = jsonFile.substr(0, jsonFile.lastIndexOf(','));
    }

    res.send(get['callback'] + '(\n[\n' + jsonFile + '\n]);');
  });

  });

// Main page
app.get('/', function(req, res) {
  // Variable get has the get variables ..
  var url_parts = url.parse(req.url, true); var get = url_parts.query;

  // Public IP address
  var remoteIP = req.connection.remoteAddress;

  // console.log('Hostname: ' + req.headers.host);

  var statusText = [];

  statusText.push(Object.size(pool) + ' active profiles');

  var slugList = [];
  for (key in pool) {
    slugList.push("'" + pool[key]['slug'] + "'");
  }
  slugList = slugList.join(',');
  res.render('overview', {
    'title':'Prediction Pools Overview',
    "page": 'pool',
    "pool": pool,
    "poolJSON": JSON.stringify(pool),
    "slugList": slugList,
    "statusText": statusText.join(' | ')
  });

  //res.send('<a href="/chosen-ones">Click here to view the chosen ones.</a>');
});

// Show all the stuff
app.get('/*', function(req, res) {

  res.render('overview', {
    'title':'404 Page not found',
    "page": '404'
  });

  //res.send('<a href="/chosen-ones">Click here to view the chosen ones.</a>');
});


function halfHourTimer() {
  //! Use moment: moment().minute()

  var d = new Date();
  if (d.getMinutes() == 0 || d.getMinutes() == 30) {
    console.log("Scheduler: A half hour has occured. Write data to json files.");
    writeGraphs();
  }
}


// Every hour, write log data to the graph json source files
function writeGraphs() {
  // Write invalid json files with a trailing comma
  // Perhaps somehow find out how to get fs.existsSync to work

  var timeNow = moment().startOf('minute');

  fs.open(__dirname + '/json/btce-ohlc.json', 'a', '0666', function( err, fd ) {
    // OHLC data is not exactly what the variables contain.
    fs.write( fd, '[' + timeNow + ', ' + btceOpen + ', ' + btceHigh + ', ' + btceLow + ',' + btceClose + '],\n', null, 'utf8', function(){
      fs.close(fd, function(){
        // Calculate OHLC data
        btceOpen = btce.last;
        btceLow = btce.last;
        btceHigh = btce.last;

        console.log('Graph: Wrote btce OHLC log');
      });
    });
  });

  if (config.exchangeHours.indexOf(moment().hour()) > -1 && moment().minute() == 0) {
    // Lets go exchange based on what the redditors say!
    for (key in profilemeta) {
      profilemeta[key].trade(pool[key], btce, config.exchangeFee);
    }
  } else {
    // Just update their value so that we can graph it
    for (key in profilemeta) {
      profilemeta[key].update(btce);
    }
  }

  for (key in pool) { // We also assume that the keys in the pool sync up with the keys in profilemeta
    // Check if this hour is a suitable time for exchanging stuff
    
    //! Would this be premature optimization to just have open as synchronous but write and close as async functions? Without ab testing, we don't really know which one is actually faster
    var fd = fs.openSync(__dirname + '/json/' + pool[key]['slug'] + '-value.json', 'a', '0666');
    var buffer = new Buffer('[' + timeNow + ', ' + profilemeta[key]['value'] + '],\n');
    fs.writeSync( fd, buffer, 0, buffer.length, null);
    fs.closeSync(fd);

    var fd = fs.openSync(__dirname + '/json/' + pool[key]['slug'] + '-ratio.json', 'a', '0666');
    var buffer = new Buffer('[' + timeNow + ', ' + pool[key]['percentBulls'] + '],\n');
    fs.writeSync( fd, buffer, 0, buffer.length, null);
    fs.closeSync(fd);

    var fd = fs.openSync(__dirname + '/json/' + pool[key]['slug'] + '-size.json', 'a', '0666');
    var buffer = new Buffer('[' + timeNow + ', ' + pool[key]['size'] + '],\n');
    fs.writeSync( fd, buffer, 0, buffer.length, null);
    fs.closeSync(fd);
    console.log('Graph: Wrote profile graph log: ' + pool[key]['slug']);

    var fd = fs.openSync(__dirname + '/json/' + pool[key]['slug'] + '-meta.json', 'w', '0666');
    var buffer = new Buffer(JSON.stringify(profilemeta[key].export()));
    fs.writeSync( fd, buffer, 0, buffer.length, null);
    fs.closeSync(fd);
    console.log('Graph: Wrote profile meta for: ' + pool[key]['slug']);
  }

}

// Create profile meta
function getProfileMeta() {
  for (key in config.profiles) {
    try {
      //Run some code here
      console.log(__dirname + '/json/' + config.profiles[key]['slug'] + '-meta.json')
      var data = fs.readFileSync(__dirname + '/json/' + config.profiles[key]['slug'] + '-meta.json', 'utf8');
      
      console.log(JSON.parse(data));
      profilemeta[key] = new profileMeta(JSON.parse(data));
    }
    catch(err) {
      //Handle errors here
      profilemeta[key] = new profileMeta();
    }
  }

  if (status.startup.items['profilemeta'] == false) {
    console.log('Startup: ' + status.startup.update('profilemeta',true));
  }
}
getProfileMeta();
// No timer because this is a one time initialization thing


// Connect to reddit predictions
function getCoinsightData() {
  // Profilemeta is a prerequisite to getting coinsight data
  if (status.startup.items['profilemeta'] == true) {
    clearInterval(getCoinsightStartup);
    ajax('http://coinsight.org/api/everything', function(err, response) {
      pool = [];

      for (key in config.profiles) {
        pool.push(new coinsight(response.reddit.flairs.users, config.profiles[key], {
          "value": profilemeta[key]['value'],
          "age": moment.timeSince(profilemeta[key]['profileBirth'])
        }));
      }

      //! Do more intermediary checking to make sure that the data is valid and not a server error page
      //! Also in case they change the api, we should detect structure changes and cancel all trading
      if (status.startup.items['coinsight'] == false) {
        console.log('Startup: ' + status.startup.update('coinsight',true));
      }
    });
  }
}
setInterval(getCoinsightData,300000); // Update coinsight every 5 minutes
var getCoinsightStartup = setInterval(function(){getCoinsightData()},1000);



var btce;

// By design, the btc-e ticker does not have open, high, low, close because these are values 
// that are determined by the time period. Therefore, we must calculate our own ohlc data.
// These variables are not really to be used in the application but rather just to show
// OHLC data on the graph.
var btceOpen;
var btceHigh;
var btceLow;
var btceClose; // btceClose variable is not really used at all since it is essentially the same as close

function getBTCEdata() {
  ajax('https://btc-e.com/api/2/btc_usd/ticker', function(err, response) {
    btce = response.ticker;
    if (status.startup.items['btce-ticker'] == false) {
      console.log('Startup: ' + status.startup.update('btce-ticker',true));
      btceOpen = btce.last;
      btceHigh = btce.last;
      btceLow = btce.last;
    }

    btceClose = btce.last;

    // Calculate OHLC data
    if (btce.last > btceHigh) {
      btceHigh = btce.last;
    } else if (btce.last < btceLow) {
      btceLow = btce.last;
    }
  console.log(btce);
  });
}
getBTCEdata();
setInterval(getBTCEdata,60000); // Update btc-e every 1 minutes (to get accurate OHLC)

/* BTC-e sample data
{ high: 748.90002,
  low: 555.88,
  avg: 652.39001,
  vol: 30027192.04948,
  vol_cur: 45537.03631,
  last: 555.88,
  buy: 555.88,
  sell: 555.6,
  updated: 1387346913,
  server_time: 1387346914 }
*/

// Start the server when everything is cleared to go
function startServer() {
  if (status.startup.allOnline) {
    server.listen(config.port);
    if (status.main.items['server'] == false) {
      console.log('Server: ' + status.main.update('server',true));

      //! Instead of making a 1 hour timer, we should make a timer that is failproof
      //! Also, make the intervals variable based on a setting in config.json
      checkHalfHourTimer = setInterval(function(){halfHourTimer();},60000);
    }
    console.log('Server: listening on port ' + server.address().port);
    clearInterval(startServerInterval);
  }
}
startServerInterval = setInterval(startServer,500);