var bll		= require('../bll/bll');
var router	= require('express').Router();

router.use(function timeLog(req, res, next) {
  	next();
});

router.put('/poll', (req, res) => {
    var myModule = new bll.module();
    myModule.healthcheck.poll(req, res);
});

module.exports = router;