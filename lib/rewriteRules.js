var request = require('request');
var path = require("path");
var cachedRules = {};
var fs = require('fs');

var urlsMatch = function (url1, url2) {
	return url1.indexOf(url2) !== -1;
};

var checkForUrlRewrites = function (req, res, next) {
	if (cachedRules.urlRewrites) {
		var proxyHappend = false;
		cachedRules.urlRewrites.forEach(function (rule) {
			if (urlsMatch(req.url, rule.requestedUrl)) {
				proxyHappend = true;
				console.log(req.url + " -> " + rule.replacementUrl);
				request.get(rule.replacementUrl).pipe(res);
			}
		});
		if (proxyHappend === false) {
			next();
		}
	} else {
		next();
	}
};

var checkForErrorEndpoints = function (req, res, next) {
	if (cachedRules.errorEndpoints) {
		var proxyHappend = false;
		cachedRules.errorEndpoints.forEach(function (errorEndpoint) {
			if (urlsMatch(req.url, errorEndpoint.requestedUrl)) {
				console.log(req.url + " -> error:" + errorEndpoint.errorCode);
				proxyHappend = true;
				var fullFilePath = path.join(__dirname, '../responses/error/template.xml');
				fs.readFile(fullFilePath, "utf-8", function (err, data) {
					data = data.replace("error-code", errorEndpoint.errorCode);
					res.send(data);
				});
			}
		});
		if (proxyHappend === false) {
			next();
		}
	} else {
		next();
	}
};

var checkForHostChange = function (req, res, next) {
	if (cachedRules.host) {
		var newUrl = cachedRules.host + req.url;
		console.log(req.url + " -> " + newUrl);
		request.get(newUrl).pipe(res);
	} else {
		next();
	}
};

module.exports = {
	apply: function (server, rules) {
		cachedRules = rules;
		server.use(function (req, res, next) {
			checkForUrlRewrites(req, res, function () {
				checkForErrorEndpoints(req, res, function () {
					checkForHostChange(req, res, next);
				});
			});
		});
	},

	getRules: function (req, res) {
		res.send(cachedRules);
	}
};