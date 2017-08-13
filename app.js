var express = require('express');
var async = require('async');
var bodyParser = require('body-parser')

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// serve the files out of ./public as our main files
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


var dbUtils = require('./dbUtils.js');

var Twitter = require('twitter');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var vcap = JSON.parse(process.env.VCAP_SERVICES);
var creds = vcap["tone_analyzer"][0].credentials;
var tone_analyzer = new ToneAnalyzerV3({
	  username: creds.username,
	  password: creds.password,
	  version_date: '2016-05-19'
	});


var twitter_api = JSON.parse(process.env.twitter_api);

var client = new Twitter({
  consumer_key: twitter_api.consumer_key,
  consumer_secret: twitter_api.consumer_secret,
  access_token_key: twitter_api.access_token,  // note diff
  access_token_secret: twitter_api.access_token_secret
});

// This code looks very confusing.  It is required to force a delay in 
// each call to Cloudant because we are using the free plan which restricts 
// the max-number of calls to 5 per sec for views, and 10 per sec for docs.  
// This is not very much and as a result we need to put in some code that 
// both serializes and delays all database operations.

function addTweets(tweets){

	var timeout = 0;
	for( var i=0; i<tweets.length; i++ ) {
		var tweet = tweets[i];
		
		// we only process english tweets
		if( tweet.lang == 'en' ) {
			timeout += 500;
			setTimeout( processTweet(tweet), timeout);
		}
	}
};

function processTweet(tweet, callback){
	// before we call watson, lets make sure we don't already have it
	dbUtils.getTweet(tweet.id_str, function(err,body){
		if( err && err.error=='not_found' ){
			
			analyzeTone(tweet, function(err,updatedTweet){
				if( err ) {
					console.error(err);
				} else {
					dbUtils.addTweet(updatedTweet, callback);					
				}
			});
		}
		callback(err,body);
	});
}

function analyzeTone(tweet, callback){

	tone_analyzer.tone(
		{ text: tweet.text },
		function(err, tone) {
		    if(!err) tweet.tone = tone;
		    callback(err, tweet);
		}
	);
};

function done(args, stats, callback) {
	dbUtils.info(function(err,data){
		args["tweet_count"] = data.doc_count-2;
		args.stats = stats;
		callback(args);
	});
};

function getStats(callback2){
		
	var args = { };   
	var viewIds = [ "anger", "disgust", "fear", "joy", "sadness" ];
	var stats = {};
	var timeout = 0;
	
	async.eachSeries(
			viewIds, 
			function(viewId, cb) {
				timeout += 500;
				setTimeout( function() { 
					dbUtils.getView('tone-views', viewId, 
						function(err,body){
							if( !err ) {
								if( body.rows && body.rows.length>0 ){
									var sum = body.rows[0].value.sum;
									var count = body.rows[0].value.count;
									var avg = Number( (sum/count*100).toFixed(2) );
									stats[viewId] = avg;
								} else {
									stats[viewId]= 0;
								}
							}
							cb();
						}
					)
				}, timeout);
			}, 
			function(){
				done(args, stats, callback2)
			}
	);
}

app.delete('/db',  
		function(req, res) {
			dbUtils.resetDB(function(err){
				res.status(200).json(err);
			});
		}	
);

app.get('/stats', function(req,res){
	getStats( function(args){
		res.json(args);
	});
});

app.post('/process',  
		function(req, res) {
			var term = req.body.term;
	
			console.log('fetching the latest tweets and loading them in the database...');
			
			client.get('search/tweets', {q: term, count: 20}, function(error, statuses, response) {
				var tweets = statuses.statuses;
				var timeout = 0;
				
				async.eachSeries(tweets, function(tweet, callback) {
					timeout += 500;
					setTimeout( function(){processTweet(tweet, function(err,result){ callback(); })}, timeout );
				}, function done(){
					getStats( function(args){
						res.json(args);
					});
				});
			});
		}
);


dbUtils.buildDb(function(){
	
	app.listen(app.get('port'), function() {
	  console.log("server starting on " + app.get('port'));
	});
	
});

