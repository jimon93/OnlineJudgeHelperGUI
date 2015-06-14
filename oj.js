var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var Promise = require("es6-promise").Promise;

var command = function(contest, filepath, problem){
  return ';python ' + __dirname + '/oj.py --' + contest + ' -i ' + filepath + ' ' + problem;
}

var download = function(dir, contest, filepath, problem) {
  var cmd = "cd " + dir + command(contest, filepath, problem) + " --download";
  return new Promise(function(resolve, reject) {
    exec(cmd, function(err, stdio, stderr){
      var result = path.existsSync(dir + "/" + problem + ".0.in.txt")
      result ? resolve(true) : reject({state: "fail download", message: ""});
    });
  });
};

var test = function(dir, contest, filepath, problem) {
  var cmd = "cd " + dir + command(contest, filepath, problem);
  return new Promise(function(resolve, reject){
    exec(cmd, function(err, stdio, stderr){
      if(stderr){
        reject({state: "fail compile", "message": stderr});
        return;
      }

      var testResults = stdio.split("\n")
      var testResult = testResults[testResults.length - 2];
      if(testResult.match(/^OK /)){
        resolve("all success");
      }else{
        reject({state: "fail test", message: stdio});
      }
    });
  });
};

var submit = function(dir, contest, filepath, problem, socket){
  var cmd = "cd " + __dirname + command(contest, filepath, problem) + ' --submit';
  exec(cmd, function(err, stdio, stderr){
    console.log([err, stdio, stderr]);
    socket.emit("submited");
  });
};

function check(contest, filepath, problem, socket) {
  var dir = __dirname + "/tests/" + contest;
  if(!path.existsSync(dir)){ fs.mkdirSync(dir); }

  return download(dir, contest, filepath, problem).then(function(success){
    return test(dir, contest, filepath, problem);
  }).then(function(success){
    socket.emit("all success")
  }, function(data){
    socket.emit(data.state, data); // "fail compile" | "fail test"
  });
}

var oj = function(io){
  io.on('connection', function(socket){
    socket.on("start", function(contest, filepath, problem) {
      check(contest, filepath, problem, socket);
      fs.watchFile(filepath, function(curr, prev) {
        check(contest, filepath, problem, socket);
      });
      socket.on("disconnect", function(){ fs.unwatchFile(filepath); });
    });

    socket.on("stop", function(filepath) {
      fs.unwatchFile(filepath);
    });

    socket.on("submit", function(contest, filepath, lang) {
      var dir = __dirname + "/tests/" + contest;
      if(!path.existsSync(dir)){ fs.mkdirSync(dir); }

      submit(dir, contest, filepath, lang, socket);
    });
  });
};

module.exports = oj;
