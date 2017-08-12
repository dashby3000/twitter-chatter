
var Twitter = require('twitter');

var twitter_api = JSON.parse(process.env.twitter_api);

var client = new Twitter({
  consumer_key: twitter_api.consumer_key,
  consumer_secret: twitter_api.consumer_secret,
  access_token_key: twitter_api.access_token,  // note diff
  access_token_secret: twitter_api.access_token_secret
});

client.get('search/tweets', {q: '@IBMBluemix'}, function(error, statuses, response) {
	var tweets = statuses.statuses;
	
	console.log("COUNT: " + tweets.length );
	for( var i=0; i<tweets.length; i++){
		var tweet = tweets[i];
		console.log(tweet.id);
	}
});

console.log("=======================");
client.get('search/tweets', {q: '@IBMBluemix'}, function(error, statuses, response) {
	var tweets = statuses.statuses;
	
	console.log("COUNT: " + tweets.length );
	for( var i=0; i<tweets.length; i++){
		var tweet = tweets[i];
		console.log(tweet.id);
	}
});



//var stream = client.stream('statuses/filter', {track: '@IBMBluemix'});
//
//stream.on('data', function(event) {
//  console.log(event && event.text);
//});
// 
//stream.on('error', function(error) {
//  throw error;
//});
// 
//// You can also get the stream in a callback if you prefer. 
//client.stream('statuses/filter', {track: 'javascript'}, function(stream) {
//  stream.on('data', function(event) {
//    console.log(event && event.text);
//  });
// 
//  stream.on('error', function(error) {
//    //throw error;
//	  console.log(error);
//  });
//});