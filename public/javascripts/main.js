;$(function(){
  var socket = io.connect();


  var contest = $("#contest").text();
  var problem = $("#problem").text();
  var lang = $("#lang").text();
  var filepath = $("#filepath").text();

  $("body").on("click", "#start", function(e){
    socket.emit("start", contest, filepath, problem);
    $("#start").addClass("hide");
    $("#stop").removeClass("hide");
    $("#watching-panel").removeClass("hide");
  });

  $("body").on("click", "#stop", function(e){
    socket.emit("stop", filepath);
    $("#start").removeClass("hide");
    $("#stop").addClass("hide");
    $("#watching-panel").addClass("hide");
  });

  $("body").on("click", "#submit", function(e){
    $("#submit").addClass("disabled");
    socket.emit("submit", contest, filepath, problem);
  });

  socket.on("fail download", function(){
    setProgress(ERROR, NONE, NONE, NONE);
    $("#message").text(contest + " に ID: " + problem + " の問題が見つかりません");
  });

  socket.on("fail compile", function(data){
    setProgress(SUCCESS, ERROR, NONE, NONE);
    $("#message").text(data.message);
  });

  socket.on("fail test", function(data){
    setProgress(SUCCESS, SUCCESS, ERROR, NONE);
    $("#message").text(data.message);
  });

  socket.on("all success", function(){
    setProgress(SUCCESS, SUCCESS, SUCCESS, SUCCESS);
    $("#message").html(
      '<div id="submit" class="btn btn-primary btn-block btn-lg">Submit</div>'
    );
  });

  socket.on("submited", function(){
    $("#submit").removeClass("disabled");
  });

  var ERROR = 0;
  var SUCCESS = 1;
  var NONE = 2;

  function setProgress(download, compile, test, success){
    var changeButton = function($el, mode){
      $el.toggleClass("btn-danger", mode === ERROR);
      $el.toggleClass("btn-success", mode === SUCCESS);
      $el.toggleClass("btn-default", mode === NONE);
    };

    changeButton($("#progress>#download"), download);
    changeButton($("#progress>#compile"), compile);
    changeButton($("#progress>#test"), test);
    changeButton($("#progress>#success"), success);
  }

  $("#start").click();
});
