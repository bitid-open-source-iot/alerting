const bll = require('../bll/bll');
const router = require('express').Router();

router.post('/get', (req, res) => {
    var myModule = new bll.module();
    myModule.alerts.get(req, res);
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