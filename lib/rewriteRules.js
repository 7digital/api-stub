var _ = require('lodash');
var forPathsMatching = require('en-garde').middlewares.forPathsMatching;
var request = require('request');
var path = require("path");
var cachedRules = { urls: {} };
var ruleApplier;
var fs = require('fs');
var errorTemplatePath = path.join(
	__dirname, '..', 'responses', 'error', 'template.xml');

function proxyRequest(rule, req, res, next) {
	var proxyUrl = rule.rewriteTo;
	request.get(proxyUrl).pipe(res);
}

function returnError(rule, req, res, next) {
	var errorCode = rule.returnError;

	fs.readFile(errorTemplatePath, "utf-8", function (err, data) {
		data = data.replace("error-code", errorCode);
		res.send(data);
	});
}

function serveFile(rule, req, res, next) {
	var filePath = rule.serveFile;

	fs.readFile(filePath, "utf-8", function (err, data) {
		if (err) { throw err; }
		res.send(data);
	});
}

function applyRule(req, res, next) {
	var longestMatch = _(cachedRules.urls)
							.keys()
							.sortBy('length')
							.filter(function (url) {
								return req.url.indexOf(url) === 0;
							}).last(),
		rule = cachedRules.urls[longestMatch];

	if (rule.rewriteTo) {
		return proxyRequest(rule, req, res, next);
	}

	if (rule.returnError) {
		return returnError(rule, req, res, next);
	}

	if (rule.serveFile) {
		return serveFile(rule, req, res, next);
	}
}

module.exports = {
	addRules: function addRules(rules) {
		if (rules && rules.urls) {
			_.merge(cachedRules.urls, rules.urls);
			ruleApplier = forPathsMatching(
				Object.keys(rules.urls),
				applyRule);
		}
	},

	setup: function setup(server) {
		server.use(function (req, res, next) {
			ruleApplier(req, res, next);
		});
	},

	getRules: function sendRules(req, res) {
		res.send(cachedRules);
	}
};
