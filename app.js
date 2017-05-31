// app.js
var Twitter = require('twitter');
var MarkovChain = require('markovchain');

var config = require('./config.js');
var T = new Twitter(config);

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
    .replace(/(?:https?|ftp):\/\/[\n\S]+/ig, '')
    .replace(/\&amp;/ig, '&');
}

// Set up your search parameters
var params = {
  screen_name: 'eruraindil',
  count: 200,
  include_rts: false,
  lang: 'en'
}

var quotes = new MarkovChain('Hello world', normFn);

T.get('statuses/user_timeline', params, function(err, data, response) {
  if(!err){
  //  console.log(data.length);
  //  console.log(data);
    for(var i in data){
      quotes.parse(data[i].text);
      // console.log(data[i].text);
    }

    // console.log(quotes.start(useUpperCase).end(stopAfter139Chars).process());

    T.post('statuses/update', {status: quotes.start(useUpperCase).end(stopAfter139Chars).process() + '.'},  function(error, tweet, response) {
      if(error) throw error;
      console.log(tweet);  // Tweet body. 
      console.log(response);  // Raw response object. 
    });
} else {
    console.log(err);
  }
})
