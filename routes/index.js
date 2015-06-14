var express = require('express');
var router = express.Router();
var fs = require("fs");

var settings = JSON.parse(fs.readFileSync(__dirname + "/../setting.json"));
var source_dir = settings.source_directory;

/* GET home page. */
router.get('/contest/:contest/problem/:problem/lang/:lang', function(req, res, next) {
  var contest = req.params.contest;
  var problem = req.params.problem;
  var lang = req.params.lang;

  res.render('index', {
    contest: contest,
    lang: lang,
    problem: problem,
    filepath: source_dir + contest + "/" + problem + "." + lang
  });
});

module.exports = router;
