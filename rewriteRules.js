var request = require('request');
var path = require("path");
var cachedRules = {};
var fs = require('fs');

var urlsMatch = function(url1, url2){
	return url1.indexOf(url2) != -1
}

module.exports = {
  apply:function(server, rules){
  	cachedRules = rules;
	server.use(function(req, res, next){
	  var proxyHappend = false;
	  

	  if(rules.urlRewrites){
		  rules.urlRewrites.forEach(function(rule){
			if(urlsMatch(req.url, rule.requestedUrl)){
			  console.log("proxying from "+rule.requestedUrl+" to "+rule.replacementUrl);
			  request.get(rule.replacementUrl).pipe(res);
			  proxyHappend = true
			  return;
			}
		  });
	  }


	  if(rules.errorEndpoints && !proxyHappend){
	  	rules.errorEndpoints.forEach(function(errorEndpoint){
	  		if(urlsMatch(req.url, errorEndpoint.requestedUrl)){
	  			var fullFilePath = path.join(__dirname, './responses/error/template.xml');
				var stream = fs.readFile(fullFilePath, "utf-8", function(err, data){
					data = data.replace("error-code", errorEndpoint.errorCode);
					res.send(data);
				});
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
