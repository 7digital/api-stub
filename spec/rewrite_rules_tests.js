var assert = require('chai').assert;
var should = require('chai').should();
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');
var request = require('request');

describe("rewriting requested urls", function(){
  beforeEach(function(done){
    this.stubRequest = sinon.stub();
    this.rewriteRules = SandboxedModule.require('../rewriteRules.js', {
      requires: {
          'request':this.stubRequest
      }
    });
    done();
  });

  it("should not do any rewriting for no rules", function(done){
    this.stubRequest.get = sinon.spy();
    var server = {
      use:function(callback){
        callback({host:""}, {}, done);
      }
    };
    this.rewriteRules.apply(server, {});
  });

  it("should pipe request to new host when host change rule is implemented", function(done){
    var newHost = "http://new.host.com";
    var req = {host:"http://www.bla.com", url:"/going/here?param=important"};
    var res = {};
    var pipeSpy = sinon.spy();
    this.stubRequest.get = function(url){
      url.should.equal(newHost+req.url);
      return{ pipe: function(desination){
        desination.should.equal(res);
        done();
      }};
    };
    var server = {
      use:function(callback){
        callback(req, res, function(){});
      }
    };
    this.rewriteRules.apply(server, {host:newHost});
  });

  it("should pipe to different url when given rule", function(done){
    var newUrl = "http://new.host.com/somewhere/new?please=true";
    var oldUrl = "/path/here"
    var req = {host:"http://www.bla.com", url:oldUrl+"?query=here"};
    var res = {};
    var pipeSpy = sinon.spy();
    this.stubRequest.get = function(url){
      url.should.equal(newUrl);
      return{ pipe: function(desination){
        desination.should.equal(res);
        done();
      }};
    };
    var server = {
      use:function(callback){
        callback(req, res, function(){});
      }
    };
    this.rewriteRules.apply(server, {urlRewrites:[{requestedUrl: oldUrl, replacementUrl: newUrl}]});
  });

  it("should do urlRewrite before host change", function(done){
    var newHost = "http://new.host.com";
    var newUrl = "http://new.host.com/somewhere/new?please=true";
    var req = {host:"http://www.bla.com", url:"/old/path"};
    var res = {};
    var pipeSpy = sinon.spy();
    this.stubRequest.get = function(url){
      url.should.equal(newUrl);
      return{ pipe: function(desination){
        //desination.should.equal(res);
        done();
      }};
    };
    var server = {
      use:function(callback){
        callback(req, res, function(){});
      }
    };
    this.rewriteRules.apply(server, {host:newHost, urlRewrites:[{requestedUrl: req.url, replacementUrl: newUrl}]});
  });

  it("should return json of rules when requested", function(done){
    this.stubRequest.get = function(){
      return{pipe:function(){}}
    }
    var server = {
      use:function(callback){
        callback({url:""}, {}, function(){});
      }
    };
    var rules = {host:"http://new.host.com", urlRewrites:[{requestedUrl: "/old/url" , replacementUrl: "http://new.url.com/path"}, {requestedUrl: "/different/old/url" , replacementUrl: "http://new.other.com/path?param=important"}]};
    this.rewriteRules.apply(server, rules);
    var res = {send: function(data){
      data.should.equal(rules);
      done();
    }};
    this.rewriteRules.getRules({}, res);
  });
});
