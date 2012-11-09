var request = require('request');

module.exports = {
  apply:function(server, rules){
    server.use(function(req, res, next){
      request.get();
      next();
    });
  }

};
