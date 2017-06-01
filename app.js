// app.js
// adapted from https://medium.com/@bmorelli25/build-a-simple-twitter-bot-with-node-js-in-just-38-lines-of-code-ed92db9eb078
var Twitter = require('twitter');
var MarkovChain = require('markovchain');
var Jsonfile = require('jsonfile');
var fs = require('fs');

var config = require('./config.js');
var T = new Twitter(config);

try {
  fs.accessSync('./tweets.json', fs.R_OK);
  var tweets = Jsonfile.readFileSync('./tweets.json');

  var useUpperCase = function(wordList) {
    var tmpList = Object.keys(wordList).filter(function(word) {
      return word[0] >= 'A' && word[0] <= 'Z'
    })
    return tmpList[~~(Math.random()*tmpList.length)]
  }

  var stopAfter139Chars = function(sentence) {
    return sentence.length >= 139
  }

  var normFn = function(word) {
    return word.replace(/[@\'\(\)']/ig, '')
      .replace(/\s\s/ig, '')
      .replace(/(?:https?|ftp):\/\/[\n\S]+/ig, '')
      .replace(/\&amp;/ig, '&');
  }

  var quotes = new MarkovChain('Hello world', normFn);

  for(var key in tweets){
    if (tweets.hasOwnProperty(key)) {
      quotes.parse(tweets[key]);
    }
  }
  
  var tweetText = quotes.start(useUpperCase).end(stopAfter139Chars).process() + '.';

  if(!process.env.IS_DEV) {
    T.post('statuses/update', {status: tweetText},  function(error, tweet, response) {
      if(error) throw error;
    });
  } else {
    console.log(tweetText);  // Tweet body
  }
} catch(e) {
  console.log(e.stack);
}
