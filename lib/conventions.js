var underscore = require('underscore'),
	path = require('path'),
	file = require('fs');

function endsWith(suffix, string) {
	return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

function statAndPipeFile(filePath, fileName, res) {
	var fullFilePath = path.join(__dirname, '../responses', filePath, fileName + '.xml');

	file.stat(fullFilePath, function checkFile(err, stats) {
		var fileStream, isFile;

		if (err || !stats.isFile()) {
			console.dir(err);
			return res.send(404);
		}

		fileStream = file.createReadStream(fullFilePath);
		return fileStream.pipe(res);
	});
}

conventions = {
	fileNamedAfterParameter: function integerParameter(matcher, req, res, next) {
		var path = req.route.path,
			fileName, param;

		for (param in req.query) {
			if (!req.query.hasOwnProperty(param)) 
				continue;

			if (!matcher(param))
				continue;

			return statAndPipeFile(req.route.path, req.query[param], res);
		}

		return next();
	}
};

conventions.id = underscore.bind(conventions.fileNamedAfterParameter, conventions, 
								function id(paramName) {
	return endsWith('id', paramName.toLowerCase());
});

conventions.tags = underscore.bind(conventions.fileNamedAfterParameter, conventions, 
								function tags(paramName) {
	return paramName.toLowerCase() === 'tags';
});

conventions.search = underscore.bind(conventions.fileNamedAfterParameter, conventions, 
									function search(paramName) {
	return paramName.toLowerCase() === 'q';
});

module.exports = conventions;
