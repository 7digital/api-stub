var serverProcess,
	request = require('request'),
	mocha = require('mocha'),
	path = require('path'),
	childProcess = require('child_process'),
	should = require('chai').should(),
	assert = require('assert'),
	port = 3000;

before(function(done) {
	var nodeProcessPath = path.join(__dirname, '../server.js'),
		processStarted, 
		childProcessEnvironment = process.env;

	childProcessEnvironment.PORT = port;

	console.log('spwaning node process : ' + nodeProcessPath);
	serverProcess = childProcess.spawn('node', [nodeProcessPath], {
		env : childProcessEnvironment
	});

	serverProcess.stdout.on('data', function(data) {
		if(!processStarted){
			processStarted = true;
			done();
		}
	});

	serverProcess.stderr.on('data', function(data) {
		console.log('' + data);
	});
});

after(function () {
	serverProcess.kill('SIGKILL');
});

describe("should return successful responses for ", function(){
	var suiteContext = this, specs = [
		//artists
		{
			name: "artist/recommend",
			url: 'http://localhost:' + port + '/artist/recommend?artistId=1'
		}, {
			name: "artist/bytag/top",
			url: 'http://localhost:' + port + '/artist/bytag/top?tags=pop'
		},{
			name: "artist/releases",
			url: 'http://localhost:' + port + '/artist/releases?artistId=1'
		},{
			name: "artist search",
			url: 'http://localhost:' + port + '/artist/search?q=kylie'
		},{
			name: "artist/similar",
			url: 'http://localhost:' + port + '/artist/similar?artistid=609'
		},{
			name: "artist/tags",
			url: 'http://localhost:' + port + '/artist/tags?artistid=1'
		},{
			name: "artist/chart",
			url: 'http://localhost:' + port + '/artist/chart'
		},
		//catalogue
		{
			name:"catalogue/artist",
			url: 'http://localhost:' + port + '/catalogue/artist/webdevteam'
		},
		{
			name:"catalogue/artist/blah/release/blah",
			url: 'http://localhost:' + port + '/catalogue/artist/webdevteam/release/awesomeness'
		},
		//release
		{
			name: "release/details",
			url: 'http://localhost:' + port + '/release/details?releaseid=2431'
		},{
			name: "release/recommend",
			url: 'http://localhost:' + port + '/release/recommend?releaseid=5'
		},{
			name: "release/search",
			url: 'http://localhost:' + port + '/release/search?q=kylie'
		},{
			name: "release/tags",
			url: 'http://localhost:' + port + '/release/tags?releaseid=1'
		},{
			name: "release/tracks",
			url: 'http://localhost:' + port + '/release/tracks?releaseid=2432'
		},{
			name: "release/chart",
			url: 'http://localhost:' + port + '/release/chart'
		},
		//track
		{
			name: "track/chart",
			url: 'http://localhost:' + port + '/track/chart'
		},{
			name: "track/search",
			url: 'http://localhost:' + port + '/track/search?q=kylie'
		},{
			name: "track/details",
			url: 'http://localhost:' + port + '/track/details?trackid=12345'
		},
		//basket
		{
			name: "basket/add when adding a release",
			url: 'http://localhost:' + port + '/basket/add/?releaseid=2437'
		},{
			name: "basket/add when adding a track",
			url: 'http://localhost:' + port + '/basket/add/?trackid=2442'
		}, {
			name: "basket/create",
			url: 'http://localhost:' + port + '/basket/create'
		}, {
			name: "basket",
			url: 'http://localhost:' + port + '/basket'
		},
		//merchandising
		{
			name:"merchandising/list/details",
			url: 'http://localhost:' + port + '/merchandising/list/details?key=tabAlbums'
		},
		//territories
		{
			name:"country/resolve",
			url: 'http://localhost:' + port + '/country/resolve?ipAddress=84.45.95.241'
		},
		//locker
		{
			name:"user/locker",
			url: 'http://localhost:' + port + '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc'
		},
		{
			name:"user/locker when requesting purchase",
			url: 'http://localhost:' + port + '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc&purchaseId=1'
		},
		//payment
		{
			name:"user/payment/card/add",
			url: 'http://localhost:' + port + '/user/payment/card/add',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		},
		{
			name:"user/payment/card/delete",
			url: 'http://localhost:' + port + '/user/payment/card/delete',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		}
	];

	specs.forEach(function (spec) {
		it(spec.name, function (done) {
			var requestParameters;

			if(spec.method){
				requestParameters = {};
				requestParameters.url = spec.url;
				requestParameters.method = spec.method;
				requestParameters.form = spec.data;
			}
			else 
				requestParameters = spec.url;

			request(requestParameters, function(err, response, body){
				if (err) {
					console.error(err);
					throw err;
				}

				response.statusCode.should.equal(200);
				body.length.should.not.equal("");
				done();
			});
		});
	});
});

describe('when adding to basket', function(){
	it('should return the added item in basket', function(done){
		request('http://localhost:' + port + '/basket/add?releaseid=2437', function(err, response, addedBody){
			var basketId = addedBody.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);
			request('http://localhost:' + port + '/basket?basketid=' + basketId, function(err, response, getBody){
				assert.equal(addedBody, getBody);
				done();
			});
		});
	});
});
