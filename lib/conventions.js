var Guid = require('./guid'),
	path = require('path'),
	file = require('fs');

function endsWith(suffix, string) {
	return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

function statAndPipeFile(filePath, fileName, res) {
	var fullFilePath;

	fullFilePath = path.join(__dirname, '../responses', filePath, fileName + '.xml');

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

function findMatchingParameter(matcher, req) {
	var param;

	for (param in req.query) {
		if (!req.query.hasOwnProperty(param))
			continue;

		if (!matcher(param))
			continue;

		return param;
	}

	return undefined;
}

function ConventionalHandler() {
}

ConventionalHandler.prototype.serveDefault = function serveDefault(req, res, next){
	return statAndPipeFile(req.route.path, 'default', res);
};

ConventionalHandler.prototype.fileNamedAfterParameter = function fileNamedAfterParameter(matcher, req, res, next) {
	var slugIndex = req.route.path.indexOf(':'),
		path = slugIndex >= 0 ? req.route.path.substring(0, slugIndex) : req.route.path,
		fileName, param;

	fileName = matcher(req);

	if (fileName) {
		return statAndPipeFile(path, fileName, res);
	} else {
		return res.send(404);
	}

	return next();
};

function findIdParameter(req) {
	var matchingParameter = findMatchingParameter(function findIdParam(paramName) {
		return endsWith('id', paramName.toLowerCase());
	}, req);

	if (matchingParameter) {
		return matchingParameter.toLowerCase() + '-' + req.query[matchingParameter];
	}

	console.log('No matching id parameter found');
	return undefined;
}

ConventionalHandler.prototype.id = ConventionalHandler.prototype.fileNamedAfterParameter.bind(
	ConventionalHandler, findIdParameter);


ConventionalHandler.prototype.tags = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function tags(req) {
	var matchingParameter = findMatchingParameter(function findTagParam(paramName) {
		return paramName.toLowerCase() === 'tags';
	}, req);

	return req.query[matchingParameter];
});

ConventionalHandler.prototype.search = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function search(req) {
	var matchingParameter = findMatchingParameter(function findSearchParam(paramName) {
		return paramName.toLowerCase() === 'q';
	}, req);

	return req.query[matchingParameter];
});

ConventionalHandler.prototype.key = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function key(req) {
	var matchingParameter = findMatchingParameter(function findKeyParam(paramName) {
		return paramName.toLowerCase() === 'key';
	}, req);

	return req.query[matchingParameter];
});

ConventionalHandler.prototype.artistSlug = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function findArtistSlug(req) {
	
	return req.params.artistName;
});



module.exports = ConventionalHandler;
