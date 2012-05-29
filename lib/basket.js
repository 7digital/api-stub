var Guid = require('./guid'),
	path = require('path'),
	file = require('fs'),
	lastBasketId,
	lastBasketResponse;


function endsWith(suffix, string) {
	return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

function findMatchingParameter(matcher, req) {
	var param;

	for (param in req.query) {
		console.log(param);
		if (!req.query.hasOwnProperty(param))
			continue;

		if (!matcher(param))
			continue;

		return param;
	}

	return undefined;
}

function findIdParameter(req) {
	var matchingParameter = findMatchingParameter(function findIdParam(paramName) {
		return endsWith('id', paramName.toLowerCase());
	}, req);

	if (matchingParameter) {
		return matchingParameter.toLowerCase() + '-' + req.query[matchingParameter];
	}

	console.log('No matching id parameter found');
	return undefined;
}

function BasketHandler() {
}

BasketHandler.prototype.createBasket = function createBasket(req, res, next) {
	var fileStream, fullFilePath = path.join(__dirname, '../responses/basket/create.xml');

	file.readFile(fullFilePath, 'utf-8', function substituteId(err, data) {
		var newId = Guid.create();
		data = data.replace('00000000-0000-0000-0000-000000000000', newId);

		return res.send(data);
	});
};


BasketHandler.prototype.addToBasket = function addToBasket(req, res, next) {
	var fileName = findIdParameter(req),
		lastBasketId = lastBasketId || Guid.create();

	lastBasketResponse = file.readFileSync(path.join(__dirname, '../responses/basket/add/' + fileName + '.xml'), 'utf-8');
	lastBasketResponse = lastBasketResponse.replace('00000000-0000-0000-0000-000000000000', lastBasketId);

	return res.send(lastBasketResponse);
};

BasketHandler.prototype.getBasket = function getBasket(req, res, next) {
	if (!lastBasketResponse) {
		lastBasketId = Guid.create();
		lastBasketResponse = file.readFileSync(path.join(__dirname, '../responses/basket/default.xml'), 'utf-8');
		lastBasketResponse = lastBasketResponse.replace('00000000-0000-0000-0000-000000000000', lastBasketId);
	}

	return res.send(lastBasketResponse);
};


module.exports = BasketHandler;
