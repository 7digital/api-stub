var path = require('path');
var assert = require('chai').assert;
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var request = require('request');
var events = require("events");
var filePath = path.join(
	__dirname, '..', 'responses', 'error', 'template.xml');

describe("rewriting requested urls", function () {

	function createServer() {
		var middleware;

		return {
			use: function serverUse(passedMiddleWare) {
				middleware = passedMiddleWare;
			},
			sendRequest: function sendRequest(req, res) {
				middleware(req, res, function () {});
			}
		};
	}

	beforeEach(function (done) {
		this.stubRequest = sinon.stub();
		this.rewriteRules = SandboxedModule.require('../lib/rewriteRules.js', {
			requires: {
				'request': this.stubRequest,
			}
		});
		done();
	});

	it("should pipe to different url when given rule", function (done) {
		var newUrl = "http://new.host.com/somewhere/new?please=true";
		var oldUrl = "/path/here";
		var req = { host: "http://www.bla.com", url: oldUrl + "?query=here" };
		var res = {};

		var server = createServer();

		this.stubRequest.get = function (url) {
			assert.equal(url, newUrl);
			return {
				pipe: function pipe(desination) {
					assert.equal(desination, res);
					done();
				}
			};
		};
		var config = {
			rules: {
				urls: {}
			}
		};
		config.rules.urls[oldUrl] = { rewriteTo: newUrl };

		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(server);

		server.sendRequest(req, res);
	});

	it("should return json of rules when requested", function (done) {
		this.stubRequest.get = function () {
			return {
				pipe: function () {}
			};
		};
		var config = {
			rules: {
				urls: {
					"/old/url": {
						rewriteTo:  "http://new.url.com/path"
					},
					"/different/old/url": {
						rewriteTo: "http://new.other.com/path?param=important"
					}
				}
			}
		};
		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(createServer());

		var res = {
			send: function (data) {
				assert.deepEqual(data, config);
				done();
			}
		};

		this.rewriteRules.getRules({}, res);
	});

	it("should return a canned error response with error rule", function (done) {
		var oldUrl = "/going/here?param=important";
		var req = {
			host: "http://www.bla.com",
			url: oldUrl
		};
		var errorCode = "2001";
		var res = {
			send: function (data) {
				assert.isTrue(data.indexOf(errorCode) !== -1);
				done();
			}
		};
		var server = createServer();
		var config = { rules: { urls: {} } };
		config.rules.urls[oldUrl] = { returnError: errorCode };

		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(server);
		server.sendRequest(req, res);
	});

	it("should return a file response with serveFile rule", function (done) {
		var oldUrl = "/going/here?param=important";
		var req = {
			host: "http://www.bla.com",
			url: oldUrl
		};
		var res = {
			send: function (data) {
				assert.isTrue(
					data.indexOf(
						'<?xml version="1.0" encoding="utf-8" ?>') !== -1);
				done();
			}
		};
		var server = createServer();
		var config = { rules: { urls: {} } };
		config.rules.urls[oldUrl] = { serveFile: filePath };

		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(server);
		server.sendRequest(req, res);
	});

	it("should return a canned error response with error rule", function (done) {
		var oldUrl = "/going/here?param=important";
		var req = {
			host: "http://www.bla.com",
			url: oldUrl
		};
		var errorCode = "2001";
		var res = {
			send: function (data) {
				assert.isTrue(data.indexOf(errorCode) !== -1);
				done();
			}
		};
		var server = createServer();
		var config = { rules: { urls: {} } };
		config.rules.urls[oldUrl] = { returnError: errorCode };

		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(server);
		server.sendRequest(req, res);
	});

	it("should choose the most specific url " +
		"if multiple rules match", function (done) {
		var newUrl = "http://new.host.com/somewhere/new?please=true";
		var oldUrl = "/path/here";
		var req = { host: "http://www.bla.com", url: oldUrl + "?query=here" };
		var res = {};
		var server = createServer();

		this.stubRequest.get = function (url) {
			assert.equal(url, newUrl);
			return {
				pipe: function pipe(desination) {
					return done();
				}
			};
		};
		var config = { rules: { urls: {} } };
		config.rules.urls['/p'] = { rewriteTo: 'http://should.not.rewrite.here/' };
		config.rules.urls[oldUrl] = { rewriteTo: newUrl };
		config.rules.urls['/path'] = { rewriteTo: 'http://should.not.rewrite.here/' };

		this.rewriteRules.addRules(config);
		this.rewriteRules.setup(server);

		server.sendRequest(req, res);

	});

	it("should merge rules if addRules is called multiple times", function (done) {
		var initialConfig = {
			rules:  {
				urls: {
				"/first/url": { returnError: "1234" }
				}
			}
		};
		var extraConfig = {
			rules:  {
				urls: {
					"/second/url": { returnError: "2345" }
				}
			}
		};

		this.rewriteRules.addRules(initialConfig);
		this.rewriteRules.addRules(extraConfig);
		this.rewriteRules.setup(createServer());

		var fakeRes = {
			send: function(config) {
				assert.property(config.rules.urls, "/first/url",
								"expected first url to be present");
				assert.property(config.rules.urls, "/second/url",
								"expected second url to be present");
				done();
			}
		};

		this.rewriteRules.getRules({}, fakeRes);
	});
});
