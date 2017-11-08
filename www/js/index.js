myApp.onPageInit('index', function(page) {
  $$('.login-form-to-json').off('click').on('click', function() {
    myApp.showPreloader();

    var formData = myApp.formToJSON('#login-form');
    console.log(formData);

    $$.post(
      url = HOOKURL + 'smart_campus/login/',
      data = {
        'email': formData['email'],
        'password': formData['password']
      },
      success = function success(data) {
        console.log('login success');
        data = JSON.parse(data);
        console.log(data);
        window.localStorage.setItem('loggedIn', true);
        window.localStorage.setItem('email', formData['email']);
        window.localStorage.setItem('experiencePoint', data['data']['experience_point']);
        window.localStorage.setItem('nickname', data['data']['nickname']);
        window.localStorage.setItem('coins', data['data']['coins']);
        window.localStorage.setItem('rewards', JSON.stringify(data['data']['rewards']));
        window.localStorage.setItem('favoriteStations', JSON.stringify(data['data']['favorite_stations']));
        myApp.hidePreloader();
        loginInit();
      },
      error = function error(data) {
        console.log('login fail');
        console.log(data);
        myApp.hidePreloader();
        myApp.alert('', '登入失敗，請重新輸入');
      }
    );
  });

  $$('.register-form-to-json').off('click').on('click', function() {
    myApp.showPreloader();

    var formData = myApp.formToJSON('#register-form');
    console.log(formData);

    $$.post(
      url = HOOKURL + 'smart_campus/signup/',
      data = {
        'email': formData['email'],
        'password': formData['password'],
        'nickname': formData['nickname']
      },
      success = function success(data) {
        console.log('register success');
        myApp.hidePreloader();
        myApp.alert('嗨！' + formData['nickname'] + '<br>請至註冊之信箱收取認證信件！', '註冊成功！', function() {
          myApp.closeModal();
        });
      },
      error = function error(data, status) {
        console.log('register fail');
        console.log(status, data);
        myApp.hidePreloader();
        if (status === 400) {
          myApp.alert('Email格式錯誤，請重新再試', '註冊失敗');
        } else if (status === 409) {
          myApp.alert('此Email已經註冊過', '註冊失敗');
        } else if (status === 422) {
          myApp.alert('輸入資料不完整，請重新再試', '註冊失敗');
        } else {
          myApp.alert('伺服器錯誤，請稍後再試', '註冊失敗');
        }
      }
    );
  });

  $$('.forget-pw').off('click').on('click', function() {
    myApp.prompt('請輸入註冊時的email', '忘記密碼',
      function(value) {
        myApp.showPreloader();
        $$.post(
          url = HOOKURL + 'smart_campus/reset_password/' + value + '/',
          success = function success(data) {
            console.log('reset password success');
            myApp.hidePreloader();
            myApp.alert('請至信箱收取信件以重置密碼！', '成功');
          },
          error = function error(data, status) {
            console.log('reset password fail');
            console.log(status, data);
            myApp.hidePreloader();

            if (status === 401) {
              myApp.confirm('你的信箱未認證，需要重發認證信至你的信箱嗎？', '認證失敗',
                function() {
                  myApp.showPreloader();
                  $$.post(
                    url = HOOKURL + 'smart_campus/resend_activation/' + value + '/',
                    success = function success(data) {
                      console.log('resend activation success');
                      myApp.hidePreloader();
                      myApp.alert('認證信已寄出，請至信箱查看', '');
                    },
                    error = function error(data) {
                      console.log('resend activation fail');
                      console.log(data);
                      myApp.hidePreloader();
                      myApp.alert('伺服器錯誤，請稍後再試', '失敗');
                    }
                  );
                }
              );
            } else {
              myApp.alert('輸入信箱格式錯誤或不存在', '失敗');
            }
          }
        );
      }
    );
  })

  if (JSON.parse(window.localStorage.getItem('loggedIn'))) {
    loginInit();
  }

  function loginInit() {
    $$('#login-form').hide();
    $$('#register-btn').hide();
    $$('.profile-pic').removeClass('hide');
    $$('.nickname').removeClass('hide');
    $$('.nickname>p').html(window.localStorage.getItem('nickname'));
  }
}).trigger();
