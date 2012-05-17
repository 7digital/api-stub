var serverProcess,
	request = require('request'),
	mocha = require('mocha'),
	path = require('path'),
	process = require('child_process'),
	should = require('chai').should();

before(function(done) {
	var nodeProcessPath = path.join(__dirname, '../server.js'),
		processStarted;

	console.log('spwaning node process : '+nodeProcessPath);
	serverProcess = process.spawn('node', [nodeProcessPath]);
	serverProcess.stdout.on('data', function(data) {
		if(!processStarted){
			processStarted = true;
			done();
		}

	});

	serverProcess.stderr.on('data', function(data) {
		console.log(''+data);
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
			url: 'http://localhost:3000/artist/recommend?artistId=1'
		}, {
			name: "returns xml for artist top tags",
			url: 'http://localhost:3000/artist/bytag/top?tags=pop'
		},{
			name: "returns xml for artist releases",
			url: 'http://localhost:3000/artist/releases?artistId=1'
		},{
			name: "returns xml for artist search",
			url: 'http://localhost:3000/artist/search?q=kylie'
		},{
			name: "returns xml for similar artist",
			url: 'http://localhost:3000/artist/similar?artistid=609'
		},{
			name: "returns xml for artist tags",
			url: 'http://localhost:3000/artist/tags?artistid=1'
		},
		//release
		{
			name: "returns xml for release details",
			url: 'http://localhost:3000/release/details?releaseid=2431'
		},{
			name: "returns xml for release recommend",
			url: 'http://localhost:3000/release/recommend?releaseid=5'
		},{
			name: "returns xml for release search",
			url: 'http://localhost:3000/release/search?q=kylie'
		},{
			name: "returns xml for release tags",
			url: 'http://localhost:3000/release/tags?releaseid=1'
		},{
			name: "returns xml for release tracks",
			url: 'http://localhost:3000/release/tracks?releaseid=2432'
		},
		//basket
		{
			name: "returns xml for when adding release to basket",
			url: 'http://localhost:3000/basket/add/?releaseid=2437'
		},{
			name: "returns xml for when adding track to basket",
			url: 'http://localhost:3000/basket/add/?trackid=2442'
		}, {
			name: "returns xml for when creating a basket",
			url: 'http://localhost:3000/basket/create'
		}, {
			name: "returns xml when getting a basket",
			url: 'http://localhost:3000/basket'
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
