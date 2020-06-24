var bll		= require('../bll/bll');
var router	= require('express').Router();

router.use(function timeLog(req, res, next) {
  	next();
});

router.post('/send', (req, res) => {
    var myModule = new bll.module();
    myModule.alerts.send(req, res);
});

router.post('/historical', (req, res) => {
	var myModule = new bll.module();
	myModule.alerts.historical(req, res);
});

module.exports = router;