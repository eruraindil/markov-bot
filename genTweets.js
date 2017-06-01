// genTweets.js
var Twitter = require('twitter');
var Jsonfile = require('jsonfile');
var Promise = require('bluebird');
var fs = require('fs');

var config = require('./config.js');
var T = new Twitter(config);
var tweets = {};
try {
  fs.accessSync('./tweets.json', fs.W_OK);
  tweets = Jsonfile.readFileSync('./tweets.json');
} catch(e) {
  console.log(e.stack);
}
var results = [];
var count = 0;

// recursive functions adapted from http://www.nickstefan.net/blog/view/twitter-api
function twitterSearchAsync(options) {
  return new Promise(function(resolve,reject){
    T.get('statuses/user_timeline',options,function(err, data, response){
      console.log("success twitter", data.length);
      resolve(data);
    });
  });
}

function getMaxHistory (data) {
  var max_id, options, oldest, newest;
  if (data.length > 0) {
    // get oldest tweet
    max_id = data[data.length - 1].id - 1;
    options = {
      screen_name: 'eruraindil',
      count: 200,
      include_rts: false,
      lang: 'en',
      max_id: max_id
    }
    newest = data[0].created_at;
    oldest = data[data.length - 1].created_at;

    results = results.concat(data);
  }

  // this isn't entirely necessary, but its nice to see when debugging and first trying this out
  // each request you can see for yourself that the oldest and newest are going back in time
  // to the next set of 200 tweets
  count++;    
  console.log("requests ", count, max_id, oldest, newest, "\n");

  // if theres no more tweets being returned, break recursion
  if (data.length < 2) {
    // do stuff with your tweets 
    
    for(var i in results) {
      tweets[results[i].id] = results[i].text;
    }

    var keys = Object.keys(tweets);
    var len = keys.length;

    if(process.env.IS_DEV == 1) console.log(tweets);
    console.log(len);

    Jsonfile.writeFileSync('./tweets.json', tweets);

  } else {
    twitterSearchAsync(options).then( getMaxHistory );
  }
}

// Set up your search parameters
var options = {
  screen_name: 'eruraindil',
  count: 200,
  include_rts: false,
  lang: 'en'
}

twitterSearchAsync(options).then( getMaxHistory );
