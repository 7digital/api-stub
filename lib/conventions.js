// Dependencies
var Guid = require('./guid'),
	url = require('url'),
	path = require('path'),
	file = require('fs');

// Helper predicate to test whether a string ends with another string
//
// @param {String} suffix - The suffix to check for
// @param {String} string - The string to test
// @param {Boolean}
function endsWith(suffix, string) {
	return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

// Helper function to test whether a file exists and pipe the file readstream
// into the response write stream
//
// @param {String} filePath - The path of the file relative to the responses folder
// @param {String} fileName - The name of the file without th e xml extension
// @param {Object} res - The HTTP ServerResponse to pipe the file into
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

// Helper function to search a request for a given parameter using the provided matcher predicate.
// This function knows to search the post body for HTTP POST and the querystring for HTTP GET.
//
// @param {Function} matcher - A function which takes a parameter name and returns a Boolean
// to indicate whether this is the matchign parmaeter.
// @param {Object} res - The HTTP ServerResponse to pipe the file into
// @return {String} - The matching parameter name
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

// ConventionalHandler
//
// Creates a new ConventionalHandler
// - @constructor
function ConventionalHandler() {
}

// Finds a file named 'default.xml' in a folder under responses relative to the base
// path of the current request and serves that with an HTTP 200 or HTTP 404 if it does
// not exist.
//
// E.g. artist/tags   will serve   ../responses/artist/tags/default.xml
//
// - @param {Object} req - The HTTP ServerRequest
// - @param {Object} res - The HTTP ServerResponse
// - @param {Object} next - The next middleware function
ConventionalHandler.prototype.serveDefault = function serveDefault(req, res, next) {
	var path = url.parse(req.url).pathname;
	return statAndPipeFile(path, 'default', res);
};

// Finds a file named by calling the matcher with the reqquest in a folder under responses
// relative to the base path the current request if the matcher returns a string.
//
// Otherwise the matcher may return an object with the following properties:
//
// - *basePath* - The base path to the file relative to the responses directory
// - *fileName* - The fileName with no .xml extension
//
// The handler will attempt to serves that with an HTTP 200 or HTTP 404 if it cannot find the
// file.
//
//  See the tags handler below for a concrete example.
//
// - @param {Function} matcher - A function that takes the ServerRequest object and returns
// either a filename or object (see above)
// - @param {Object} req - The HTTP ServerRequest
// - @param {Object} res - The HTTP ServerResponse
// - @param {Object} next - The next middleware function
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

// Finds the first parameter in the querystring ending in 'id' and returns a filename
// formatted as parametername-parametervalue.
//
// E.g. releaseid-123
//
// - @param {Object} req - The HTTP ServerRequest
// - @return {String} - The filename
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

// Finds a file named by the first id parameter in the querystring and its value.
// fileNamedAfterParameter with the findIdParameter function partially applied as
// the matcher.  E.g. 'releaseid-123'
ConventionalHandler.prototype.id = ConventionalHandler.prototype.fileNamedAfterParameter.bind(
	ConventionalHandler, findIdParameter);

// Finds a file named by the value of a query string parameter named 'tags'  E.g. 'rock'
ConventionalHandler.prototype.tags = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function tags(req) {
	var matchingParameter = findMatchingParameter(function findTagParam(paramName) {
		return paramName.toLowerCase() === 'tags';
	}, req);

	return req.query[matchingParameter];
});
ConventionalHandler.prototype.tag = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function tag(req) {
	var matchingParameter = findMatchingParameter(function findTagParam(paramName) {
		return paramName.toLowerCase() === 'pagesize';
	}, req);
	
	if (matchingParameter) {
		return matchingParameter.toLowerCase() + '-' + req.query[matchingParameter];
	}
	return 'default';
});

// Finds a file named by the value of a query string parameter named 'userid' and its value  E.g. 'userid-123'
ConventionalHandler.prototype.userId = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function userId(req) {
	var matchingParameter = findMatchingParameter(function findUserIdParam(paramName) {
		return paramName.toLowerCase() === 'userid';
	}, req);

	return 'userid-' + req.query[matchingParameter];
});

// Finds a file named by the value of a query string parameter named 'q'  E.g. 'kylie'
ConventionalHandler.prototype.search = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function search(req) {
	var matchingParameter = findMatchingParameter(function findSearchParam(paramName) {
		return paramName.toLowerCase() === 'q';
	}, req);

	return req.query[matchingParameter];
});

// Finds a file named by the value of a query string parameter named 'key'  E.g. 'tabAlbums'
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

// Finds a file named by packing the querystring parameters and adjusting the basepath to enable different responses
// for different userids.  Prefixes the filename with either 'purchase_' for post-checkout queries or 'yourmusic_'
// for locker queries.
//
// The matcher will return an object with the following properties:
//
// - *basePath* - The base path to the file relative to the responses directory plus the user id. E.g. user/locker/123/
// - *fileName* - The fileName with no .xml extension - see above
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

// Finds a file named by the value of a query string parameter named 'key'  E.g. '4444333322221111'
ConventionalHandler.prototype.cardNumber = ConventionalHandler.prototype.fileNamedAfterParameter.bind(ConventionalHandler, function cardNumber(req) {
	var matchingParameter = findMatchingParameter(function findCardNumberParam(paramName) {
		return paramName.toLowerCase() === 'cardnumber';
	}, req);

	return req.body[matchingParameter];
});

module.exports = ConventionalHandler;
