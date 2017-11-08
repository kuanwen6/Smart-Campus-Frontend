myApp.onPageInit('info', function(page) {
  var level = Math.floor(parseInt(window.localStorage.getItem('experiencePoint')) / EXP_PER_LEVEL);
  $$('#level').html(level);
  $$('#coin').html(window.localStorage.getItem('coins'));
  $$('.nickname>p').html(window.localStorage.getItem('nickname'));
  for (var i = 0; i < 12; i++) {
    $$('.collections').append('<div></div>');
  }

  var rewards = JSON.parse(window.localStorage.getItem('rewards'));
  var allRewardsInfo = JSON.parse(window.sessionStorage.getItem('allRewardsInfo'));
  for (var i = 0; i < rewards.length; i++) {
    if (i > 11 && i % 4 === 0) {
      for (var j = 0; j < 4; j++) {
        $$('.collections').append('<div></div>');
      }
    }

    var rewardImg = allRewardsInfo.find(function(x) {
      return x.id === rewards[i];
    })['image_url'];
    $$('.collections > div').eq(i).append('<img src="' + rewardImg + '"/>');
  }

  if (!JSON.parse(window.localStorage.getItem('loggedIn'))) {
    $$('#logout').css('visibility', 'hidden');
  }

  $$('#logout').off('click').on('click', function() {
    myApp.confirm('', '確認登出?', function() {
      myApp.showPreloader();
      $$.post(
        url = HOOKURL + 'smart_campus/logout/',
        data = {
          'email': window.localStorage.getItem('email')
        },
        success = function success(data) {
          console.log('logout success');
          userDataInit();
          myApp.hidePreloader();
          myApp.alert('', '已成功登出！', function() {
            mainView.router.refreshPage();
            $$('#login-form').show();
            $$('#register-btn').show();
            $$('.profile-pic').addClass('hide');
            $$('.nickname').addClass('hide');
            $$('.nickname>p').html(window.localStorage.getItem('nickname'));
          });
        },
        error = function error(data, status) {
          console.log('logout fail');
          myApp.hidePreloader();
          myApp.alert('', '登出失敗！');
        }
      );
    });
  });
});
