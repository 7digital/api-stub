function FeatureHandler() {
}

FeatureHandler.prototype.logIt = function logIt(req, res, next) {
	if (!req.body || !req.body.featureName || !req.body.scenarioName) {
		console.log(req.body);
		return res.send("Invalid request, you must post form parameter encoded featureName and scenarioName", 400);
	}

	console.log(new Array(80).join('*'));
	console.log("FEATURE: %s", req.body.featureName);
	console.log("SCENRAIO: %s", req.body.scenarioName);
	console.log(new Array(80).join('*'));
	return res.send(req.body);
};

module.exports = FeatureHandler;