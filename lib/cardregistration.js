var fs = require('fs');
var path = require('path');
var Guid = require('./guid');

var responseBasePath = '../responses/user/payment/cardregistration';

function CardRegistration() {

	var registrations = {};

	return {
		createRegistrationId: function createRegistrationId(req, res, next) {

			var redirectUrl = req.body.redirectUrl,
				fullFilePath = path.join(__dirname, responseBasePath, 'createRegistrationId.xml');

			fs.readFile(fullFilePath, 'utf-8', function fileRead(err, data) {
				var newId = Guid.create();

				data = data.replace('{{cardRegistrationId}}', newId);
				data = data.replace('{{redirectUrl}}', redirectUrl);

				registrations[newId] = {
					redirectUrl: redirectUrl
				};

				return res.send(data);
			});
		},

		handleCardDetails: function handleCardDetails(req, res, next) {
			var id = req.params.id;
			registrations[id].cardNumber = req.body.cardNumber;
			return res.redirect(registrations[id].redirectUrl + '?cardRegistrationId=' + id);
		},

		checkRegistrationId: function checkRegistrationId(req, res, next) {
			var id = req.params.id,
				cardNumber = registrations[id].cardNumber,
				redirectUrl = registrations[id].redirectUrl,
				fullFilePath = path.join(__dirname, responseBasePath, 'checkRegistration-card-' + cardNumber + '.xml');

			if (!path.existsSync(fullFilePath)) {
				fullFilePath = path.join(__dirname, responseBasePath, 'checkRegistration-card-default.xml');
			}

			fs.readFile(fullFilePath, 'utf-8', function fileRead(err, data) {
				data = data.replace('{{cardRegistrationId}}', id);
				return res.send(data);
			});
		}
	};
}

module.exports = CardRegistration;
