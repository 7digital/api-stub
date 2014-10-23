// Run with node util/convert-to-json.js responses/path/to/response.xml
var xml2js = require('xml2js');
var _ = require('lodash');
var fs = require('fs');
var async = require('async');

var files = process.argv.slice(2);

function responseToJsonString(res, cb) {
	var json = JSON.stringify(res.response, null, 4);
	return cb(null, json);
}

function convertFile(src, cb) {
	var ext = src.slice(-3);
	if (ext !== 'xml') {
		return cb(new Error('Not an xml file: ' + src));
	}

	var pathAndBase = src.slice(0, -4);
	var dst = pathAndBase + '.json';

	var parser = new xml2js.Parser({
		mergeAttrs: true,
		explicitArray: false
	});

	async.waterfall([
		_.partial(fs.readFile, src, { encoding: 'utf8' }),
		parser.parseString,
		responseToJsonString,
		_.partial(fs.writeFile, dst)
	], function (err, res) {
		if (err) { return cb(err); }
		return cb();
	});
}

async.each(files, convertFile, function (err, res) {
	if (err) { console.log(err); }
});
