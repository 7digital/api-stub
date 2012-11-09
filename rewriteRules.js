var request = require('request');

module.exports = {
  apply:function(server, rules){
    server.use(function(req, res, next){
      //console.log(request);
      console.log(request.get)
      if(req.host){
	      request.get(req.host).pipe(res);
      }
      
      next();
    });
  }
};
