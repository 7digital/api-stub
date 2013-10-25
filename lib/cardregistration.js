var fs = require('fs');
var path = require('path');
var Guid = require('./guid');

function CardRegistration() {

	var registrations = {};

	return {
		createToken: function createToken(req, res, next) {

			var redirectUrl = req.body.redirectUrl,
				fullFilePath = path.join(__dirname, '../responses/user/payment/cardregistration/createToken.xml');

			fs.readFile(fullFilePath, 'utf-8', function fileRead(err, data) {
				var newId = Guid.create();

				data = data.replace('{{token}}', newId);
				data = data.replace('{{redirectUrl}}', redirectUrl);

				registrations[newId] = {
					redirectUrl: redirectUrl
				};

				return res.send(data);
			});
		},

		handleCardDetails: function createToken(req, res, next) {
			var token = req.params.token;
			registrations[token].cardNumber = req.body.cardNumber;
			return res.redirect(registrations[token].redirectUrl + '?token=' + token);
		},

		checkToken: function createToken(req, res, next) {
			var token = req.params.token,
				cardNumber = registrations[token].cardNumber,
				redirectUrl = registrations[token].redirectUrl,
				fullFilePath = path.join(__dirname, '../responses/user/payment/cardregistration/checkRegistration-card-' + cardNumber + '.xml');

			fs.readFile(fullFilePath, 'utf-8', function fileRead(err, data) {
				data = data.replace('{{token}}', token);
				data = data.replace('{{redirectUrl}}', redirectUrl);
				return res.send(data);
			});
		}
	};
}

module.exports = CardRegistration;
