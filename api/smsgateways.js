var express 	= require('express');
var router 		= express.Router();
var bllModule 	= require('../bll/bll');

router.use(function timeLog(req, res, next) {
  	next();
});

router.post('/add', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.add(req, res);
});

router.post('/get', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.get(req, res);
});

router.post('/list', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.list(req, res);
});

router.post('/share', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.share(req, res);
});

router.post('/update', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.update(req, res);
});

router.post('/delete', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.delete(req, res);
});

router.post('/unsubscribe', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.unsubscribe(req, res);
});

router.post('/updatesubscriber', (req, res) => {
	var myModule = new bllModule.module();
	myModule.smsgateways.updatesubscriber(req, res);
});

module.exports = router;