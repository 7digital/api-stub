const path = require('path');

module.exports = {
	preparePurchase(req, res) {
		if (req.query.basketId === 'prepare-purchase-error') {
			return res.sendfile(path.join(__dirname, '../responses/error/template.xml'));
		}

		res.sendfile(path.join(__dirname, '../responses/user/purchase/prepare/default.xml'));
	}
};