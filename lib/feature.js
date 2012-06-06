function FeatureHandler() {
}

FeatureHandler.prototype.logIt = function logIt(req, res, next) {
	if (!req.body || !req.body.featureName || !req.body.scenarioName)
		return res.send(400, "Invalid request, you must post form parameter encoded featureName and scenarioName");

	console.log(new Array(80).join('*'));
	console.log("FEATURE: %s", req.body.featureName);
	console.log("SCENRAIO: %s", req.body.scenarioName);
	console.log(new Array(80).join('*'));
	return res.send(req.body);
};

module.exports = FeatureHandler;