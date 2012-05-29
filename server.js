var express = require('express'),
	ConventionalHandler = require('./lib/conventions'),
	BasketHandler = require('./lib/basket'),
	basket = new BasketHandler(),
	conventions = new ConventionalHandler(),
	server = express.createServer();

	console.log(conventions);

server.use(function addDefaultHeaders(req, res, next) {
	res.header('Accept-Ranges',	'bytes');
	res.header('Content-Type', 'text/xml; charset=utf-8');
	res.header('X-RateLimit-Current', '37');
	res.header('X-RateLimit-Limit', '4000');
	res.header('X-RateLimit-Reset','46968');
	res.header('x-7dig', 'localhost');
	return next();
});

// Artist
server.get('/artist/bytag/top', conventions.tags);
server.get('/artist/chart', conventions.serveDefault);
server.get('/artist/recommend', conventions.id);
server.get('/artist/releases', conventions.id);
server.get('/artist/search', conventions.search);
server.get('/artist/similar', conventions.id);
server.get('/artist/tags', conventions.id);

// Release
server.get('/release/chart', conventions.serveDefault);
server.get('/release/details', conventions.id);
server.get('/release/recommend', conventions.id);
server.get('/release/search', conventions.search);
server.get('/release/tags', conventions.id);
server.get('/release/tracks', conventions.id);

//track
server.get('/track/chart', conventions.serveDefault);
server.get('/track/details', conventions.id);
server.get('/track/search', conventions.search);

// Catalogue
server.get('/catalogue/artist/:artistName', conventions.serveDefault);
server.get('/catalogue/artist/:artistName/release/:releaseName', conventions.releaseSlug);


// Basket
server.get('/basket', basket.getBasket);
server.get('/basket/add', basket.addToBasket);
server.get('/basket/create', basket.createBasket);
server.get('/basket/remove', conventions.serveDefault);

// Merch
server.get('/merchandising/list/details', conventions.key);

// Territories
server.get('/country/resolve', conventions.serveDefault);

server.listen(+process.env.PORT || 3000, function serverListening() {
	console.log('Server listening on %s', +process.env.PORT || 3000);
});
