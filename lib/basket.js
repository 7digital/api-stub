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

BasketHandler.prototype.getBasket = function getBasket(req, res, next) {
	var basketId = req.query.basketId,
		basketData;

	if (basketId === 'basket-with-two-items' || basketId === '17432a95-ec84-44e6-8d3d-93c6a696b836') {
		basketData = file.readFileSync(path.join(__dirname,
			'../responses/basket/two-items.xml'), 'utf-8');
	} else {

		eyes.inspect(baskets);
		if (!baskets[basketId]) {
			basketId = req.query.basketId || Guid.create();
			basketData = file.readFileSync(path.join(__dirname, '../responses/basket/default.xml'), 'utf-8');
			basketData = basketData.replace('00000000-0000-0000-0000-000000000000', basketId);
			baskets[basketId] = basketData;
		} else {
			basketData = baskets[basketId];
		}

	}

	return res.send(basketData);
};

BasketHandler.prototype.removeItem = function removeItem(req, res, next) {
	var basketData, basketId;

	eyes.inspect(baskets);

	basketId = req.query.basketId || Guid.create();
	basketData = file.readFileSync(path.join(__dirname, '../responses/basket/default.xml'), 'utf-8');
	basketData = basketData.replace('00000000-0000-0000-0000-000000000000', basketId);
	baskets[basketId] = basketData;

	return res.send(basketData);
};

module.exports = BasketHandler;
