var request = require('request');
var path = require("path");
var cachedRules = {};

module.exports = {
  apply:function(server, rules){
  	cachedRules = rules;
	server.use(function(req, res, next){
	  var proxyHappend = false;
	  if(rules.urlRewrites){
		  rules.urlRewrites.forEach(function(rule){
			if(req.url.indexOf(rule.requestedUrl) != -1){
			  console.log("proxying from "+rule.requestedUrl+" to "+rule.replacementUrl);
			  request.get(rule.replacementUrl).pipe(res);
			  proxyHappend = true
			  return;
			}
		  });
	  }
	  if(rules.host && !proxyHappend){
	  	  var newUrl = rules.host+req.url;
	  	  console.log("sending request data from new url: "+newUrl);
		  request.get(newUrl).pipe(res);
	  }else if (!proxyHappend){
	  	  console.log("next")
		  next();
	  }
	});
  },

  getRules: function(req, res){
  	res.send(cachedRules);
  }


};
