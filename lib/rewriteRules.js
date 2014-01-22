var util = require('util');
var _ = require('lodash');
var forPathsMatching = require('en-garde').middlewares.forPathsMatching;
var request = require('request');
var path = require("path");
var cachedConfig = { rules: { urls: {} } };
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
	var longestMatch = _(cachedConfig.rules.urls)
							.keys()
							.sortBy('length')
							.filter(function (url) {
								return req.url.indexOf(url) === 0;
							}).last(),

		rule = cachedConfig.rules.urls[longestMatch];

	console.log('Applying rule: %j', rule);
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

function sendRules(req, res) {
	res.send(cachedConfig);
}

module.exports = {
	getRules: function getRules() {
		return cachedConfig;
	},

	addRules: function addRules(config, server) {
		if (config) {
			cachedConfig = _.merge(cachedConfig, config);
			ruleApplier = forPathsMatching(
				Object.keys(cachedConfig.rules.urls),
				applyRule);
		}
	},

	resetRoutes: function resetRoutes(server) {
		server.routes.routes.get = [];
		server.routes.routes.post = [];
		server.get('/rules', sendRules);
		server.get('*', function (req, res, next) {
			var body, bodyFormat;

			bodyFormat = 'Stub is configured using rules. \n\n';
			bodyFormat += 'Request URL: \n\n %s';
			bodyFormat += '\n\n The rules it knows about are: \n\n %s';

			body = util.format(bodyFormat, req.url, util.inspect(cachedConfig, {
				depth: null
			}));

			res.header('Content-Type', 'text/plain; charset=utf-8');
			res.send(body, 404);
		});
	},

	setup: function setup(server) {
		server.use(function (req, res, next) {
			if (ruleApplier) {
				return ruleApplier(req, res, next);
			}

			return next();
		});
	},

	sendRules: sendRules
};
