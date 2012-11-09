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
    var oldPath = "/old/place";
    var req = {host:"http://www.bla.com", url:oldPath};
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
    this.rewriteRules.apply(server, {urlRewrites:[{requestedUrl: oldPath, replacementUrl: newUrl}]});
  });

});
