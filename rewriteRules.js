var request = require('request');
var path = require("path");
module.exports = {
  apply:function(server, rules){
	server.use(function(req, res, next){
	  if(rules.urlRewrites){
		  rules.urlRewrites.forEach(function(rule){
			if(rule.requestedUrl === req.url){
			  console.log("proxying from "+rule.requestedUrl+" to "+rule.replacementUrl);
			  request.get(rule.replacementUrl).pipe(res);
			  return;
			};
		  });
	  }else if(rules.host){
		  request.get(rules.host+req.url).pipe(res);
	  }else{
		  next();
	  }
	});
  }
};
