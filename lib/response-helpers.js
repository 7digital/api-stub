'use strict';
var file = require('fs'),
	path = require('path');

// Helper function to test whether a file exists and pipe the file readstream
// into the response write stream
//
// @param {String} filePath - The path of the file relative to the responses
//                            folder
// @param {String} fileName - The name of the file without the xml extension
// @param {Object} res - The HTTP ServerResponse to pipe the file into
function statAndPipeFile(filePath, fileName, res, opts) {
	var fullFilePath;

	if (!opts) {
		opts = {
			format: 'xml',
			serveDefault: true
		};
	}

	fullFilePath = path.join(__dirname, '..', 'responses', filePath,
		fileName + '.' + opts.format);

	console.log('looking for %s', fullFilePath);
	file.stat(fullFilePath, function checkFile(err, stats) {
		var fileStream, isFile;
		if (err || !stats.isFile()) {
			if (opts.serveDefault) {
				opts.serveDefault = false;
				return statAndPipeFile(filePath, "default", res, opts);
			} else {
				console.error(err);
				return res.send(404);
			}
		}
		console.log("Serving %s", fullFilePath);
		fileStream = file.createReadStream(fullFilePath, {
			encoding: 'utf8'
		});
		return fileStream.pipe(res);
	});
}

module.exports.statAndPipeFile = statAndPipeFile;
