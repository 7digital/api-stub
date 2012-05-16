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

describe("should hit artist endpoints", function(){
	var suiteContext = this, specs = [
		{
			name: "returns xml for recommend",
			url: 'http://localhost:3000/artist/recommend?artistId=1'
		},
		{
			name: "returns xml for top tags",
			url: 'http://localhost:3000/artist/bytag/top?tags=pop'
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
