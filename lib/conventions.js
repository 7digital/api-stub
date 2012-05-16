var path = require('path'),
	file = require('fs');

function endsWith(suffix, string) {
	return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

function statAndPipeFile(filePath, fileName, res) {
	var fullFilePath = path.join(__dirname, '../responses', filePath, fileName + '.xml');

	console.log('looking for %s', fullFilePath);
	file.stat(fullFilePath, function checkFile(err, stats) {
		var fileStream, isFile;

		if (err || !stats.isFile()) {
			console.error(err);
			return res.send(404);
		}

		console.log("Serving %s", fullFilePath);
		fileStream = file.createReadStream(fullFilePath);
		return fileStream.pipe(res);
	});
}

conventions = {
	fileNamedAfterParameter: function fileNamedAfterParameter(matcher, req, res, next) {
		var path = req.route.path,
			fileName, param;

		fileName = matcher(req);

		if (fileName) {
			return statAndPipeFile(req.route.path, fileName, res);
		} else {
			return res.send(404);
		}

		return next();
	}
};


function findMatchingParameter(matcher, req){
	var param;

	for (param in req.query) {
		console.log(param);
		if (!req.query.hasOwnProperty(param))
			continue;

		if (!matcher(param))
			continue;

		return param;
	}

	return undefined;
}

conventions.id = conventions.fileNamedAfterParameter.bind(conventions, function id(req) {
	var matchingParameter = findMatchingParameter(function findIdParam(paramName) {
		return endsWith('id', paramName.toLowerCase());
	}, req);

	if (matchingParameter) {
		return matchingParameter.toLowerCase() + '-' + req.query[matchingParameter];
	}

	console.log('No matching id parameter found');
	return undefined;
});

conventions.tags = conventions.fileNamedAfterParameter.bind(conventions, function tags(req) {
	var matchingParameter = findMatchingParameter(function findTagParam(paramName) {
		return paramName.toLowerCase() === 'tags';
	}, req);

	return req.query[matchingParameter];
});

conventions.search = conventions.fileNamedAfterParameter.bind(conventions, function search(req) {
	var matchingParameter = findMatchingParameter(function findSearchParam(paramName) {
		return paramName.toLowerCase() === 'q';
	}, req);

	return req.query[matchingParameter];
});

conventions.key = conventions.fileNamedAfterParameter.bind(conventions, function key(req) {
	var matchingParameter = findMatchingParameter(function findKeyParam(paramName) {
		return paramName.toLowerCase() === 'key';
	}, req);

	return req.query[matchingParameter];
});

module.exports = conventions;
