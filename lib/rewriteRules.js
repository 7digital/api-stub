var util = require('util');
var _ = require('lodash');
var forPathsMatching = require('en-garde').middlewares.forPathsMatching;
var request = require('request');
var path = require("path");
var cachedConfig = { rules: { urls: {} } };
var qs = require('querystring');
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

function parse(url) {
	var parts = url.split('?');
	return {
		path: parts[0],
		query: qs.parse(parts[1])
	};
}

function ruleMatches(req, ruleUrl) {
	var parsedRuleUrl = parse(ruleUrl);
	if (req.path === parsedRuleUrl.path) {
		return _.all(parsedRuleUrl.query, function (value, key) {
			return req.query[key] === value;
		});
	}

	return false;
}

function applyRule(req, res, next) {

	var longestMatch =
		_(cachedConfig.rules.urls)
			.keys()
			.sortBy(function (url) {
				//More query params specified = more important rule
				var query = parse(url).query;
				return _.keys(query).length;
			})
			.filter(function (url) {
				return ruleMatches(req, url);
			}).last(),

		rule = cachedConfig.rules.urls[longestMatch];

	if (rule) {
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

	return next();
}

function sendRules(req, res) {
	res.send(cachedConfig);
}

function ruleUrlPath(ruleUrl) {
	return ruleUrl.split('?')[0];
}

module.exports = {
	getRules: function getRules() {
		return cachedConfig;
	},

	addRules: function addRules(config, server) {
		if (config) {
			cachedConfig = _.merge(cachedConfig, config);
			ruleApplier = forPathsMatching(
				_(cachedConfig.rules.urls).keys().map(ruleUrlPath).value(),
				applyRule);
		}
	},

	resetRoutes: function resetRoutes(server) {
		console.log('DISABLING STANDARD ROUTES');
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
