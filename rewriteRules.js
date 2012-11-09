var request = require('request');
var path = require("path");
var cachedRules = {};

module.exports = {
  apply:function(server, rules){
  	cachedRules = rules;
	server.use(function(req, res, next){
	  if(rules.urlRewrites){
		  rules.urlRewrites.forEach(function(rule){
			if(rule.requestedUrl === req.url){
			  console.log("proxying from "+rule.requestedUrl+" to "+rule.replacementUrl);
			  request.get(rule.replacementUrl).pipe(res);
			  return;
			}
		  });
	  }else if(rules.host){
		  request.get(rules.host+req.url).pipe(res);
	  }else{
		  next();
	  }
	});
  },

  getRules: function(req, res){
  	res.send(cachedRules);
  }


};
