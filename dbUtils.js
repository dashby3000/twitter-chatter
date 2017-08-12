
var dbName = 'raw_tweets';
var _cloudant;
var _db;

function getCloudant(){
	if( !_cloudant ) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		if(vcapServices.cloudantNoSQLDB) {
			var dbUrl = vcapServices.cloudantNoSQLDB[0].credentials.url;
			_cloudant = require('cloudant')(dbUrl);
			return _cloudant;
		} else {
			throw new Error("No DB Service");
		}
	} else {
		return _cloudant;
	}
}

function getDb(){
	if( !_db ) {
		var cloudant = getCloudant();
		_db = cloudant.use(dbName);
	}
	return _db;
}

exports.resetDB = function(callback) {
	var cloudant = getCloudant();
	console.log('DB Utils - destroying db');
	cloudant.db.destroy(dbName, function(err) {
		if( err ) console.log(err);
		console.log('DB Utils - creating db');
		exports.buildDb(callback);
	});
};

exports.info = function(callback){
	var cloudant = getCloudant();
	cloudant.db.get(dbName, function(err,body){
		callback(err,body);
	});
}

exports.buildDb = function buildDb(callback) {
	console.log('DB Utils - Building database');
	var cloudant = getCloudant();
	cloudant.db.create(dbName, function (err) {
		console.log('DB Utils - Database created');
		if (err && 'file_exists' !== err.error ) { 
			console.error('DB Utils - could not create db ', err);
			throw err;
		} else {
			var db = getDb();
			var twitterIdIndex = {name:'tone-index', type:'json', index:{fields:['tone.document_tone']}}
			db.index(twitterIdIndex, function(er, response) { 
				if( er ) console.error(er);
				
				// now create our views
				var viewDoc = require('./view_documents.json');
				db.insert( viewDoc, "_design/tone-views", function(err,body){
					if( err && err.error != 'conflict') {
						console.error(err);
					}
				});
				
				
			});
		}
		
		callback();
	});
};

exports.initDb = function initDb(callback) {
	var cloudant = getCloudant();
	console.log('DB Utils - Destroying db');
	cloudant.db.destroy(dbName, function(err) {
		if( err ) console.log(err);
		exports.buildDb(callback);
	});
};

exports.getView = function(design, view, callback){
	var db =getDb();
	db.view(design, view, function(err, body) { 
		if( err && err.error != 'too_many_requests') console.error(err);
		callback(err,body);
	});
	
}

exports.getTweet = function(id_str, callback){
	var db =getDb();
	db.get(id_str, function(err, body) { 
		callback(err,body);
	});
}

exports.addTweet = function(tweet) {
	var db =getDb();
	db.insert(tweet, tweet.id_str, function(err, body) { });
}




	