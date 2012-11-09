var assert = require('chai').assert;
var should = require('chai').should();
var SandboxedModule = require('sandboxed-module');
var sinon = require('sinon');

describe("rewriting requested urls", function(){
  beforeEach(function(done){
    this.fakeGet = sinon.spy();
    this.rewriteRules = SandboxedModule.require('../rewriteRules.js', {
      requires: {
          'request':{get:this.fakeGet}
      }
    });
    done();
  });

  it("should not to any rewriting for no rules", function(done){
    var next = {};
    var server = {
      use:function(callback){
        callback({}, {}, done);
      }
    };
    this.rewriteRules.apply(server, {});
  });
  it("should proxy to different place with host name change rule", function(done){
    var next = {};
    var self = this;
    var server = {
      use:function(callback){
        callback({}, {}, function(){
          self.fakeGet.called.should.equal(true);
          done();
        });
      }
    };
    this.rewriteRules.apply(server, {});
  });
});
