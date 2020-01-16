var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/splash', function(req, res, next) {
  res.render('splash.html', { root: './public' });
});

module.exports = router;
