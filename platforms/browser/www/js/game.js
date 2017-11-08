myApp.onPageInit('gamePage', function(page) {
  //beacon_util.stopScanForBeacons();

  setTimeout(function() {
    $$('#gameStart-modal').css('display', 'none');
  }, 5000);

  $$('#endImg').on('click', function(e) {
    var pHeight = $$('#endImg').height();
    var pOffset = $$('#endImg').offset();
    var y = e.pageY - pOffset.top;
    console.log('Y: ' + e.pageY);
    console.log('Off: ' + pOffset.top);
    console.log('H: ' + pHeight);

    if (y > pHeight * 0.78 && y <= pHeight) {
      mainView.router.back();

      //beacon_util.startScanForBeacons()
    }
  });

  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.ajax({
      url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
      type: 'get',
      data: {
        'email': window.localStorage.getItem('email'),
        'station_id': page.context.id,
      },
      success: function(data) {
        var questionData = JSON.parse(data);
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain, page.context.rewardID);
      },
      error: function(data) {
        console.log(data);
        console.log("get question error");
      }
    });
  } else {
    $$.ajax({
      url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
      type: 'get',
      data: {
        'email': 'visitMode@gmail.com',
        'station_id': page.context.id,
      },
      success: function(data) {
        var questionData = JSON.parse(data);
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain, page.context.rewardID);
      },
      error: function(data) {
        console.log("get question error");
      }
    });
  }
});
