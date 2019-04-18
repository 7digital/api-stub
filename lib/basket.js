var Guid = require('./guid'),
	path = require('path'),
	file = require('fs'),
	eyes = require('eyes'),
	baskets = {};


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

function idWhichIsNotBasket(paramName) {
	var loweredParamName = paramName.toLowerCase();

	return endsWith('id', loweredParamName)  && loweredParamName !== 'basketid';
}

function BasketHandler() {
}

BasketHandler.prototype.createBasket = function createBasket(req, res, next) {
	var fullFilePath = path.join(__dirname, '../responses/basket/create.xml');

	eyes.inspect(baskets);
	file.readFile(fullFilePath, 'utf-8', function substituteId(err, data) {
		var newId = Guid.create();

		data = data.replace('00000000-0000-0000-0000-000000000000', newId);
		baskets[newId] = data;

		return res.send(data);
	});
};

BasketHandler.prototype.addToBasket = function addToBasket(req, res, next) {
	var matchingParameter = findMatchingParameter(idWhichIsNotBasket, req),
		fileName, basketData, basketId = req.query.basketId;

	eyes.inspect(baskets);
	if (matchingParameter) {
		fileName = matchingParameter.toLowerCase() + '-' + req.query[matchingParameter];
	}

	basketData = file.readFileSync(path.join(__dirname, '../responses/basket/additem/' + fileName + '.xml'), 'utf-8');
	basketData = basketData.replace('00000000-0000-0000-0000-000000000000', basketId);
	baskets[basketId] = basketData;

	return res.send(basketData);
};

const getBasketResponse = location =>
	file.readFileSync(path.join(__dirname, '../responses', location), 'utf-8');

function getDefaultBasketResponse(basketId) {
	return getBasketResponse('../responses/basket/default.xml')
		.replace('00000000-0000-0000-0000-000000000000', basketId || Guid.create());
}

BasketHandler.prototype.getBasket = function getBasket(req, res, next) {
	const basketId = req.query.basketId;

	if (basketId === 'basket-with-two-items' || basketId === '17432a95-ec84-44e6-8d3d-93c6a696b836') {
		return res.send(getBasketResponse('basket/two-items.xml'));
	}

	if (basketId === 'erroring-basket') {
		return res.send(getBasketResponse('error/template.xml'));
	}

	if (basketId === 'free-basket') {
		return res.send(getBasketResponse('basket/free.xml'));
	}

	eyes.inspect(baskets);

	if (baskets[basketId]) {
		return res.send(baskets[basketId]);
	}

	const basket = getDefaultBasketResponse(req.query.basketId);
	baskets[basketId] = basket;
	return res.send(basket);
};

BasketHandler.prototype.removeItem = function removeItem(req, res, next) {
	eyes.inspect(baskets);
	const basket = getDefaultBasketResponse(req.query.basketId);
	baskets[basketId] = basket;
	return res.send(basket);
};

module.exports = BasketHandler;