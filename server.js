var express = require('express'),
	ConventionalHandler = require('./lib/conventions'),
	BasketHandler = require('./lib/basket'),
	FeatureHandler = require('./lib/feature'),
	feature = new FeatureHandler(),
	basket = new BasketHandler(),
	conventions = new ConventionalHandler(),
	server = express.createServer();

server.configure('development', function configureServerForDevelopment() {
	server.use(express.logger());
});

server.use(
	express.bodyParser()
);


server.use(function addDefaultHeaders(req, res, next) {
	res.header('Accept-Ranges',	'bytes');
	res.header('Content-Type', 'text/xml; charset=utf-8');
	res.header('X-RateLimit-Current', '37');
	res.header('X-RateLimit-Limit', '4000');
	res.header('X-RateLimit-Reset', '46968');
	res.header('x-7dig', 'localhost');
	return next();
});

// Feature
server.post('/feature/start', feature.logIt);
// Artist
server.get('/artist/bytag/top', conventions.tags);
server.get('/artist/chart', conventions.serveDefault);
server.get('/artist/recommend', conventions.id);
server.get('/artist/releases', conventions.id);
server.get('/artist/search', conventions.search);
server.get('/artist/similar', conventions.id);
server.get('/artist/tags', conventions.serveDefault);

// Release
server.get('/release/bytag/top', conventions.tags);
server.get('/release/bytag/new', conventions.tags);
server.get('/release/chart', conventions.serveDefault);
server.get('/release/details', conventions.id);
server.get('/release/recommend', conventions.id);
server.get('/release/search', conventions.search);
server.get('/release/tags', conventions.serveDefault);
server.get('/release/tracks', conventions.id);

//track
server.get('/track/chart', conventions.serveDefault);
server.get('/track/details', conventions.id);
server.get('/track/search2', conventions.search);

// Catalogue
server.get('/catalogue/artist/:artistName', conventions.serveDefault);
server.get('/catalogue/artist/:artistName/release/:releaseName', conventions.releaseSlug);
server.get('/catalogue/artist/:artistName/release/:releaseName/shopid/:shopid', conventions.releaseSlug);

// Basket
server.get('/basket', basket.getBasket);
server.get('/basket/additem', basket.addToBasket);
server.get('/basket/create', basket.createBasket);
server.get('/basket/removeitem', basket.removeItem);

//your music
server.get('/user/locker', conventions.locker);

// Merch
server.get('/merchandising/list/details', conventions.key);

// Territories
server.get('/countries', conventions.serveDefault);
server.get('/country/resolve', conventions.serveDefault);
server.get('/country/georestrictions/checkout', conventions.serveDefault);
//payment
server.get('/user/payment/card', conventions.userId);
server.post('/user/payment/card/select', conventions.serveDefault);
server.post('/user/payment/card/add', conventions.cardNumber);
server.post('/user/payment/card/delete', conventions.serveDefault);
server.get('/payment/card/type', conventions.serveDefault);

//tag
server.get('/tag', conventions.tag);

server.get("/status", function (req, res) {
	res.send("<status>7digital stub api is alive</status>");
});

server.get("*", function (req, res) {
	res.send("<status>Unrecognised URL: " + req.url + "</status>", 404);
});

var port = process.env.PORT || 3000;
server.listen(port, function serverListening() {
	console.log('Server listening on %s', port);
});
