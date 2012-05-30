var serverProcess,
	Guid = require('../lib/guid'),
	request = require('request'),
	mocha = require('mocha'),
	path = require('path'),
	childProcess = require('child_process'),
	should = require('chai').should(),
	assert = require('assert'),
	baseAddress = 'http://localhost'
	port = 3000
	root = baseAddress + ':' + port;

before(function(done) {
	var nodeProcessPath = path.join(__dirname, '../server.js'),
		processStarted, 
		childProcessEnvironment = process.env;

	childProcessEnvironment.PORT = port;
	childProcessEnvironment.NODE_ENV = 'test';

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
			url: '/artist/recommend?artistId=1'
		}, {
			name: "artist/bytag/top",
			url: '/artist/bytag/top?tags=pop'
		}, {
			name: "artist/releases",
			url: '/artist/releases?artistId=1'
		}, {
			name: "artist search",
			url: '/artist/search?q=kylie'
		}, {
			name: "artist/similar",
			url: '/artist/similar?artistid=609'
		}, {
			name: "artist/tags",
			url: '/artist/tags?artistid=1'
		}, {
			name: "artist/chart",
			url: '/artist/chart'
		},
		//catalogue
		{
			name:"catalogue/artist",
			url: '/catalogue/artist/keane'
		}, {
			name:"catalogue/artist/blah/release/blah",
			url: '/catalogue/artist/keane/release/awesomeness'
		},
		//release
		{
			name: "release/bytag/top",
			url: '/release/bytag/top?tags=rock'
		}, {
			name: "release/bytag/new",
			url: '/release/bytag/new?tags=rock'
		}, {
			name: "release/details",
			url: '/release/details?releaseid=2431'
		}, {
			name: "release/recommend",
			url: '/release/recommend?releaseid=5'
		}, {
			name: "release/search",
			url: '/release/search?q=kylie'
		}, {
			name: "release/tags",
			url: '/release/tags?releaseid=1'
		}, {
			name: "release/tracks",
			url: '/release/tracks?releaseid=2432'
		}, {
			name: "release/chart",
			url: '/release/chart'
		},
		//track
		{
			name: "track/chart",
			url: '/track/chart'
		},{
			name: "track/search",
			url: '/track/search?q=kylie'
		},{
			name: "track/details",
			url: '/track/details?trackid=12345'
		},
		//basket
		{
			name: "basket/additem when adding a release",
			url: '/basket/additem?releaseid=2437&basketid=' + Guid.create()
		},{
			name: "basket/add when adding a track",
			url: '/basket/additem?trackid=2442&basketid=' + Guid.create()
		}, {
			name: "basket/create",
			url: '/basket/create'
		}, {
			name: "basket",
			url: '/basket'
		},
		//merchandising
		{
			name:"merchandising/list/details",
			url: '/merchandising/list/details?key=tabAlbums'
		},
		//territories
		{
			name:"country/resolve",
			url: '/country/resolve?ipAddress=84.45.95.241'
		},
		//locker
		{
			name:"user/locker",
			url: '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc'
		},
		{
			name:"user/locker when requesting purchase",
			url: '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc&purchaseId=1'
		},
		//payment
		{
			name:"user/payment/card",
			url: '/user/payment/card?userId=380'
		}, {
			name:"user/payment/card/select",
			url: '/user/payment/card/select',
			method: 'POST',
			data: { 
				cardId: 1,
				userId: 380
			}
		}, {
			name:"payment/card/type",
			url: '/payment/card/type'
		},{
			name:"payment/card/add",
			url: '/payment/card/add',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		}, {
			name:"payment/card/delete",
			url: '/payment/card/delete',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		}
	];

	specs.forEach(function (spec) {
		it(spec.name, function (done) {
			var requestParameters;

			if(spec.method){
				requestParameters = {};
				requestParameters.url = root + spec.url;
				requestParameters.method = spec.method;
				requestParameters.form = spec.data;
			}
			else 
				requestParameters = root + spec.url;

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
		request(root + '/basket/create', function(err, response, createBody){
			var basketId = createBody.match(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);
			request(root + '/basket/additem?releaseid=353302&basketid' + basketId, function(err, response, addedBody) {
				should.not.exist(err);
				request(root + '/basket?basketid=' + basketId, function(err, response, getBody) {
					addedBody.should.equal(getBody);
					done();
				});
			});
		});
	});
});
