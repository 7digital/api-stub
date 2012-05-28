var serverProcess,
	request = require('request'),
	mocha = require('mocha'),
	path = require('path'),
	process = require('child_process'),
	should = require('chai').should(),
	assert = require('assert'),
	port = 3000;

before(function(done) {
	var nodeProcessPath = path.join(__dirname, '../server.js'),
		processStarted;

	console.log('spwaning node process : ' + nodeProcessPath);
	serverProcess = process.spawn('node', [nodeProcessPath], {
		env : { PORT:port }
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

describe("should hit endpoints", function(){
	var suiteContext = this, specs = [
		//artists
		{
			name: "returns xml for artist recommend",
			url: 'http://localhost:' + port + '/artist/recommend?artistId=1'
		}, {
			name: "returns xml for artist top tags",
			url: 'http://localhost:' + port + '/artist/bytag/top?tags=pop'
		},{
			name: "returns xml for artist releases",
			url: 'http://localhost:' + port + '/artist/releases?artistId=1'
		},{
			name: "returns xml for artist search",
			url: 'http://localhost:' + port + '/artist/search?q=kylie'
		},{
			name: "returns xml for similar artist",
			url: 'http://localhost:' + port + '/artist/similar?artistid=609'
		},{
			name: "returns xml for artist tags",
			url: 'http://localhost:' + port + '/artist/tags?artistid=1'
		},{
			name: "returns xml for artist chart",
			url: 'http://localhost:' + port + '/artist/chart'
		},
		//release
		{
			name: "returns xml for release details",
			url: 'http://localhost:' + port + '/release/details?releaseid=2431'
		},{
			name: "returns xml for release recommend",
			url: 'http://localhost:' + port + '/release/recommend?releaseid=5'
		},{
			name: "returns xml for release search",
			url: 'http://localhost:' + port + '/release/search?q=kylie'
		},{
			name: "returns xml for release tags",
			url: 'http://localhost:' + port + '/release/tags?releaseid=1'
		},{
			name: "returns xml for release tracks",
			url: 'http://localhost:' + port + '/release/tracks?releaseid=2432'
		},{
			name: "returns xml for release chart",
			url: 'http://localhost:' + port + '/release/chart'
		},
		//track
		{
			name: "returns xml for track chart",
			url: 'http://localhost:' + port + '/track/chart'
		},{
			name: "returns xml for track search",
			url: 'http://localhost:' + port + '/track/search?q=kylie'
		},{
			name: "returns xml for track details",
			url: 'http://localhost:' + port + '/track/details?trackid=12345'
		},
		//basket
		{
			name: "returns xml when adding release to basket",
			url: 'http://localhost:' + port + '/basket/add/?releaseid=2437'
		},{
			name: "returns xml when adding track to basket",
			url: 'http://localhost:' + port + '/basket/add/?trackid=2442'
		}, {
			name: "returns xml when creating a basket",
			url: 'http://localhost:' + port + '/basket/create'
		}, {
			name: "returns xml when getting a basket",
			url: 'http://localhost:' + port + '/basket'
		},
		//merchandising
		{
			name:"returns xml when requesting merchandising endpoint",
			url: 'http://localhost:' + port + '/merchandising/list/details?key=tabAlbums'
		}

	];

	specs.forEach(function (spec) {
		it(spec.name, function (done) {
			request(spec.url, function(err, response, body){
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
			console.log(basketId);
			request('http://localhost:' + port + '/basket?basketid=' + basketId, function(err, response, getBody){
				assert.equal(addedBody, getBody);
				done();
			});
		});
	});
});
