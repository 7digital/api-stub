var Guid = require('./guid'),
	url = require('url'),
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
	var param,
		paramsToSearch;

	paramsToSearch = req.method === 'POST' ? req.body : req.query;
	for (param in paramsToSearch) {
		if (!paramsToSearch.hasOwnProperty(param))
			continue;

		if (!matcher(param))
			continue;

		return param;
	}

	return undefined;
}

function ConventionalHandler() {
}

ConventionalHandler.prototype.serveDefault = function serveDefault(req, res, next) {
	var path = url.parse(req.url).pathname;
	return statAndPipeFile(path, 'default', res);
};

ConventionalHandler.prototype.fileNamedAfterParameter = function fileNamedAfterParameter(matcher, req, res, next) {
	var slugIndex = req.route.path.indexOf(':'),
		path = slugIndex >= 0 ? req.route.path.substring(0, slugIndex) : req.route.path,
		fileName, param;

	fileName = matcher(req);
	if (typeof fileName !== "string") {
		path = fileName.basePath;
		fileName = fileName.fileName;
	}

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

ConventionalHandler.prototype.userId = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function userId(req) {
	var matchingParameter = findMatchingParameter(function findUserIdParam(paramName) {
		return paramName.toLowerCase() === 'userid';
	}, req);

	return 'userid-' + req.query[matchingParameter];
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

ConventionalHandler.prototype.releaseSlug = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function findArtistSlug(req) {
	var reqPath = url.parse(req.url).pathname,
		releaseName = req.params.releaseName;

	reqPath = reqPath.substring(0, reqPath.indexOf('/release/'));
	return {
		basePath: reqPath,
		fileName: req.params.releaseName
	};
});

ConventionalHandler.prototype.locker = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function buildLockerXmlFileName(req) {
	var parsedUrl = url.parse(req.url, true),
		query = parsedUrl.query,
		filePath = path.join(parsedUrl.pathname, query.userId),
		sort = query.sort ? query.sort.replace(' ', '_') : 'purchaseDate_desc',
		lockerXmlFileName = 'yourmusic_' + query.pageSize + '_' + query.page + '_' + sort;

	if (query.purchaseId)
		lockerXmlFileName = 'purchase_' + query.purchaseId;

	return {
		basePath: filePath,
		fileName: lockerXmlFileName
	};
});

ConventionalHandler.prototype.cardNumber = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function cardNumber(req) {
	var matchingParameter = findMatchingParameter(function findCardNumberParam(paramName) {
		return paramName.toLowerCase() === 'cardnumber';
	}, req);

	return req.body[matchingParameter];
});

module.exports = ConventionalHandler;