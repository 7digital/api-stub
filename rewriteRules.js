var request = require('request');
var path = require("path");
module.exports = {
  apply:function(server, rules){
    server.use(function(req, res, next){
      //console.log(request);
      console.log(request.get)
      if(req.host){
	      request.get(rules.host+req.url).pipe(res);
      }
      
      next();
    });
  }
};
