'use strict';
var Guid = require('../lib/guid');
var request = require('request');
var path = require('path');
var childProcess = require('child_process');
var should = require('chai').should();
var host = 'http://localhost';
var port = 3000;
var serverUrl = host + ':' + port;
var nodeProcessPath = path.join(__dirname, '../server.js');

describe('api stub', function () {
var serverProcess;

	before(function (done) {
		var processStarted, childProcessEnvironment = process.env;

		childProcessEnvironment.PORT = port;
		childProcessEnvironment.NODE_ENV = 'test';

		serverProcess = childProcess.spawn('node', [nodeProcessPath], {
			env: childProcessEnvironment
		});

		serverProcess.stdout.on('data', function (data) {
			if(!processStarted){
				processStarted = true;
				done();
			}
		});

		serverProcess.stderr.on('data', function (err) { throw err; });
	});

	after(function () {
		serverProcess.kill('SIGKILL');
	});

	var specs = [
		// feature
		{
			name: 'feature/start',
			path: '/feature/start',
			method: 'POST',
			data: { featureName: 'Test Feature', scenarioName: 'Test Scenario' }
		},
		//artists
		{
			name: 'artist/recommend',
			path: '/artist/recommend?artistId=1'
		}, {
			name: 'artist/bytag/top',
			path: '/artist/bytag/top?tags=pop'
		}, {
			name: 'artist/releases',
			path: '/artist/releases?artistId=1'
		}, {
			name: 'artist search',
			path: '/artist/search?q=kylie'
		}, {
			name: 'artist/similar',
			path: '/artist/similar?artistid=609'
		}, {
			name: 'artist/tags',
			path: '/artist/tags?artistid=1'
		}, {
			name: 'artist/chart',
			path: '/artist/chart'
		},
		//catalogue
		{
			name:'catalogue/artist',
			path: '/catalogue/artist/keane'
		}, {
			name:'catalogue/artist/blah/release/blah',
			path: '/catalogue/artist/keane/release/awesomeness'
		}, {
			name:'catalogue/artist/blah/release/blah with explicit shopid',
			path: '/catalogue/artist/keane/release/awesomeness/shopid/5'
		},
		//release
		{
			name: 'release/bytag/top',
			path: '/release/bytag/top?tags=rock'
		}, {
			name: 'release/bytag/new',
			path: '/release/bytag/new?tags=rock'
		}, {
			name: 'release/details',
			path: '/release/details?releaseid=2431'
		}, {
			name: 'release/recommend',
			path: '/release/recommend?releaseid=5'
		}, {
			name: 'release/search',
			path: '/release/search?q=kylie'
		}, {
			name: 'release/tags',
			path: '/release/tags?releaseid=1'
		}, {
			name: 'release/tracks',
			path: '/release/tracks?releaseid=2432'
		}, {
			name: 'release/chart',
			path: '/release/chart'
		},
		//track
		{
			name: 'track/chart',
			path: '/track/chart'
		},{
			name: 'track/search2',
			path: '/track/search2?q=kylie'
		},{
			name: 'track/details',
			path: '/track/details?trackid=12345'
		},
		//basket
		{
			name: 'basket/additem when adding a release',
			path: '/basket/additem?releaseid=2437&basketid=' + Guid.create()
		},{
			name: 'basket/additem when adding a track',
			path: '/basket/additem?trackid=2442&basketid=' + Guid.create()
		}, {
			name: 'basket/removeitem',
			path: '/basket/removeitem?itemId=2442&basketid=' + Guid.create()
		}, {
			name: 'basket/create',
			path: '/basket/create'
		}, {
			name: 'basket',
			path: '/basket'
		},
		//merchandising
		{
			name:'merchandising/list/details',
			path: '/merchandising/list/details?key=tabAlbums'
		},
		//territories
		{
			name:'country/resolve',
			path: '/country/resolve?ipAddress=84.45.95.241'
		},
		{
			name:'countries',
			path: '/countries'
		},
		//locker
		{
			name:'user/locker',
			path: '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc'
		},
		{
			name:'user/locker when requesting purchase',
			path: '/user/locker?userId=121&pageSize=10&page=1&sort=purchaseDate%20desc&purchaseId=1'
		},
		//payment
		{
			name:'user/payment/card',
			path: '/user/payment/card?userId=380'
		}, {
			name:'user/payment/card/select',
			path: '/user/payment/card/select',
			method: 'POST',
			data: {
				cardId: 1,
				userId: 380
			}
		}, {
			name:'payment/card/type',
			path: '/payment/card/type'
		},{
			name:'payment/card/add',
			path: '/user/payment/card/add',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		}, {
			name:'payment/card/delete',
			path: '/user/payment/card/delete',
			method: 'POST',
			data: { cardNumber: '4444333322221111' }
		},
		//media delivery
		{
			name:'media/user/downloadtrack',
			path: '/media/user/downloadtrack'
		},{
			name:'media/user/download/release',
			path: '/media/user/download/release'
		},{
			name:'media/user/download/purchase',
			path: '/media/user/download/purchase'
		}
	];

	specs.forEach(function (spec) {
		it(spec.name + ' responds with success', function (done) {
			var reqInfo;

			if (spec.method){
				reqInfo = {
					url: serverUrl + spec.path,
					method: spec.method,
					form: spec.data
				};
			} else {
				reqInfo = serverUrl + spec.path;
			}

			request(reqInfo, function (err, response, body) {
				if (err) { throw err; }

				response.statusCode.should.equal(200);
				body.length.should.not.equal(0);
				done();
			});
		});
	});

	it('simulates basket flow', function (done) {
		request(serverUrl + '/basket/create', function (err, response, createBody) {
			var guidPattern = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
			var basketId = createBody.match(guidPattern);

			var basketAddUrl = serverUrl + '/basket/additem?releaseid=353302&basketid=' + basketId;
			request(basketAddUrl, function (err, response, addBody) {
				should.not.exist(err);

				var basketGetUrl = serverUrl + '/basket?basketid=' + basketId;
				request(basketGetUrl, function (err, response, getBody) {
					addBody.should.equal(getBody);
					done();
				});
			});
		});
	});

	it('returns a 404 when requesting a "missing" release', function (done) {
		request(serverUrl + '/release/details?releaseId=missing', function (err, response, body) {
			if (err) { return done(err); }
			response.statusCode.should.equal(404);
			body.length.should.not.equal(0);
			done();
		});
	});
});
