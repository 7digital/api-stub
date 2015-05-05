var fs = require('fs');
var path = require('path');
var Guid = require('./guid');

var responseBasePath = '../responses/user/payment/cardregistration';

function CardRegistration() {

	var registrations = {};

	return {
		createRegistrationId: function createRegistrationId(req, res, next) {

			var redirectUrl = req.body.redirectUrl,
				fullFilePath = path.join(__dirname, responseBasePath, 'createregistrationid.xml');

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
			registrations[id].cardHolderName = req.body.cardHolderName;
			registrations[id].cardExpiryMonth = req.body.cardExpiryMonth;
			registrations[id].cardExpiryYear = req.body.cardExpiryYear;
			registrations[id].cardStartMonth = req.body.cardStartMonth;
			registrations[id].cardStartYear = req.body.cardStartYear;
			registrations[id].cardPostCode = req.body.cardPostCode;
			registrations[id].cardVerificationCode = req.body.cardVerificationCode;
			return res.redirect(registrations[id].redirectUrl + '?cardRegistrationId=' + id);
		},

		checkRegistrationId: function checkRegistrationId(req, res, next) {
			var id = req.params.id,
				redirectUrl = registrations[id].redirectUrl,
				fullFilePath,
				fileNameEnding = 'default';

			if (registrations[id].cardNumber === '4111111111111111') { fileNameEnding = 'card-4111111111111111'; }
			if (registrations[id].cardNumber === 'invalid') { fileNameEnding = 'cardnumberinvalid'; }
			if (registrations[id].cardHolderName === 'invalid') { fileNameEnding = 'cardholdernameinvalid'; }

			//The dates that need to be passed to trigger these responses aren't really ideal :-(
			if (registrations[id].cardExpiryMonth === '01' && registrations[id].cardExpiryYear === '2014') {
				fileNameEnding = 'cardexpirydateinvalid';
			}
			if (registrations[id].cardExpiryMonth === '02' && registrations[id].cardExpiryYear === '2014') {
				fileNameEnding = 'cardexpirydateinthepast';
			}
			if (registrations[id].cardStartMonth === '01' && registrations[id].cardStartYear === '2009') {
				fileNameEnding = 'cardstartdateinvalid';
			}
			if (registrations[id].cardStartMonth === '02' && registrations[id].cardStartYear === '2009') {
				fileNameEnding = 'cardstartdateinthefuture';
			}

			if (registrations[id].cardPostCode === 'invalid') { fileNameEnding = 'cardpostcodeinvalid'; }
			if (registrations[id].cardVerificationCode === 'inv') { fileNameEnding = 'cardverificationcodeinvalid'; }

			fullFilePath = path.join(__dirname, responseBasePath, 'checkregistration-' + fileNameEnding + '.xml');

			if (!path.existsSync(fullFilePath)) {
				fullFilePath = path.join(__dirname, responseBasePath, 'checkregistration-card-default.xml');
			}

			fs.readFile(fullFilePath, 'utf-8', function fileRead(err, data) {
				data = data.replace('{{cardRegistrationId}}', id);
				return res.send(data);
			});
		}
	};
}

module.exports = CardRegistration;
