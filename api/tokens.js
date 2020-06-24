var bll		= require('../bll/bll');
var router	= require('express').Router();

router.use(function timeLog(req, res, next) {
  	next();
});

router.post('/register', (req, res) => {
	var myModule = new bll.module();
	myModule.tokens.register(req, res);
});

router.post('/deregister', (req, res) => {
	var myModule = new bll.module();
	myModule.tokens.deregister(req, res);
});

module.exports = router;