mainView.hideToolbar();

$$(document).on('page:init', function(e) {
  var page = e.detail.page;
  console.log(page);
});

$$(document).on('backbutton', function() {
  var view = myApp.getCurrentView();
  var page = view.activePage;

  if (page.name == "index") {
    var result = myApp.confirm("確定要離開嗎？", "成大校園導覽", function() {
      navigator.app.clearHistory();
      navigator.app.exitApp();
    });
  } else {
    view.router.back();
  }
});

$$(document).on('pause', function() {
  beacon_util.stopScanForBeacons();

  console.log("pause");
});

$$(document).on('resume', function() {
  beacon_util.startScanForBeacons();

  console.log("resume");
});

$$(document).on('online', function() {
  console.log("online");
});

$$(document).on('offline', function() {
  myApp.alert('需網路連線以正常運作！', '網路連線中斷');
  console.log("offline");
});



$$(document).on('deviceready', function() {
  console.log('Device is ready!');
  if (navigator.connection.type == Connection.NONE) {
    console.log('no network detected!');
    myApp.alert('需網路連線以正常運作！請重啟APP!', '無網路連線', function() {
      if (myApp.device.os == 'android') {
        navigator.app.clearHistory();
        navigator.app.exitApp();
      }
    });
  } else {
    beacon_util.init_setup_for_IBeacon();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

    var applaunchCount = window.localStorage.getItem('launchCount');
    if (!applaunchCount) {
      userDataInit();
      var welcomescreen = myApp.welcomescreen(
        welcomescreenSlides, {
          closeButton: false,
          onClosed: function() {
            beacon_util.startUpBeaconUtil();
          },
        }
      );
      $$(document).on('click', '#welcome-close-btn', function() {
        welcomescreen.close();
      });
    } else {
      console.log('App has launched: ' + window.localStorage.launchCount);
      beacon_util.startUpBeaconUtil();
    }

    $$.get(
      url = HOOKURL + 'smart_campus/get_all_rewards/',
      success = function success(data) {
        console.log('get rewards info success');
        window.sessionStorage.setItem('allRewardsInfo', JSON.stringify(JSON.parse(data).data));
      },
      error = function error(data) {
        console.log('get rewards info fail');
        console.log(data);
      }
    );
    $$.get(
      url = HOOKURL + 'smart_campus/get_all_stations/',
      success = function success(data) {
        console.log('get stations info success');
        window.sessionStorage.setItem('allStationsInfo', JSON.stringify(JSON.parse(data).data));
      },
      error = function error(data) {
        console.log('get stations info fail');
        console.log(data);
      }
    );

    $$.get(
      url = HOOKURL + 'smart_campus/get_all_travel_plans/',
      success = function success(data) {
        console.log('get plans info success');
        window.localStorage.setItem('allPlansInfo', JSON.stringify(JSON.parse(data).data));
      },
      error = function error(data) {
        console.log('get plans info fail');
        console.log(data);
      }
    );
  }
});

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

myApp.onPageInit('map', function(page) {
  $$('.open-filter').on('click', function() {
    $('#map-filter').toggle();
  });

  $$('.open-filter, .filter-table').on('click', function(event) {
    event.stopPropagation();
  })

  $$(window).on('click', function() {
    $$('#map-filter').hide();
  });

  $$('.filter-table div').on('click', function(e) {
    $$(e.currentTarget).children('span').toggleClass('filter-added');
    setGroupMarkerVisible(e.currentTarget.id);
  });

  $$('.marker-favorite').on('click', function(e) {
    var favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));
    $$(e.currentTarget).toggleClass('color-red');

    if ($$(e.currentTarget).hasClass('color-red')) {
      favoriteSequence = addFavorite(favoriteSequence, parseInt(e.currentTarget.id));
    } else {
      favoriteSequence = removeFavorite(favoriteSequence, parseInt(e.currentTarget.id));
    }
  });

  var markers = void 0;
  var stations = void 0;
  var waypts = [];
  var animateMarker = undefined;
  var Latitude = undefined;
  var Longitude = undefined;
  var Accuracy = undefined;
  var map = new google.maps.Map($$('#map')[0], {
    zoom: 16,
    center: { lat: 22.998089, lng: 120.217441 },
    disableDefaultUI: true,
    clickableIcons: false
  });
  var locationMarker = new google.maps.Marker({
    clickable: false,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 4,
      strokeWeight: 8,
      strokeColor: 'rgb(72, 106, 243)',
    },
    zIndex: 999,
    map: map
  });
  var locationMarkerFrame = new google.maps.Marker({
    clickable: false,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      strokeWeight: 10,
      strokeColor: 'white',
    },
    zIndex: 998,
    map: map
  });
  var locationCircle = new google.maps.Circle({
    fillColor: '#61a0bf',
    fillOpacity: 0.2,
    strokeColor: '#1bb6ff',
    strokeOpacity: 0.4,
    strokeWeight: 1,
    map: map
  });
  /*
  var walkingLineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1,
    scale: 3
  };
  var walkingPathLine = {
    strokeColor: '#0eb7f6',
    strokeOpacity: 0,
    fillOpacity: 0,
    icons: [{
      icon: walkingLineSymbol,
      offset: '0',
      repeat: '10px'
    }]
  };
  */

  map.addListener('click', hideMarkerInfo);
  directionOrMapOverview(page.context.isDirection);
  setMarkers();
  navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, { enableHighAccuracy: true });

  function directionOrMapOverview(isDirection) {
    if (isDirection) {
      console.log('Direction mode!');
      $$('.left>a').removeClass('back');
      $$('#page-title').html('導覽中');
      $$('.open-filter').css('visibility', 'hidden');
      directionsDisplay.setMap(map);

      stations = page.context.stations;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = stations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var station = _step.value;

          waypts.push({ location: { lat: station['location'][1], lng: station['location'][0] } });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      console.log('Map overview mode!');
      $$('#bluetooth-warn').hide();
      stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
    }
  }

  function addMarkerWithTimeout(station, timeout) {
    var icon = {
      '古蹟': 'img/markers/marker_red.png',
      '藝文': 'img/markers/marker_orange.png',
      '景觀': 'img/markers/marker_green.png',
      '行政單位': 'img/markers/marker_blue.png'
    };
    var scaledSize = new google.maps.Size(25, 36);
    var anchor = new google.maps.Point(12.5, 36);

    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        position: { lat: station['location'][1], lng: station['location'][0] },
        title: station['name'],
        map: map,
        icon: {
          url: icon[station['category']],
          scaledSize: scaledSize,
          anchor: anchor
        },
        animation: google.maps.Animation.DROP
      });
      marker.addListener('click', showMarkerInfo);
      markers[station['category']].push(marker);
    }, timeout)
  }

  function setMarkers() {
    markers = { '古蹟': [], '藝文': [], '景觀': [], '行政單位': [] };
    var timeout = 100
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;
    try {
      for (var _iterator2 = stations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var station = _step2.value;
        addMarkerWithTimeout(station, timeout);
        timeout += 40;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  function showMarkerInfo() {
    var _this = this;

    var station = stations.find(function(x) {
      return x.name === _this.title;
    });
    var _distance = '';
    if (Latitude !== undefined && Longitude !== undefined) {
      _distance = distance(Latitude, Longitude, station['location'][1], station['location'][0]);
    }

    if(animateMarker) {
      animateMarker.setAnimation(null);
    }
    animateMarker = _this;
    _this.setAnimation(google.maps.Animation.BOUNCE)
    $$('#marker-img').attr('src', station['image']['primary']);
    $$('#marker-category').html('/ ' + station['category'] + '主題 /');
    $$('#marker-name').html(station['name'].replace('/', '<br>/'));
    $$('#marker-distance').html(_distance);
    $$('.marker-favorite').attr('id', station['id']);
    $('.marker-favorite').toggleClass('color-red', isFavorite(station['id']));
    $$('.marker-info').css('display', 'block');
    $$('.marker-info').off('click').on('click', function(e) {
      if ($(e.target).closest(".marker-favorite").length > 0) {
        return false;
      }
      mainView.router.load({
        url: 'itemDetail.html',
        context: {
          site: station,
          isBeacon: false,
          favoriteSequence: JSON.parse(window.localStorage.getItem('favoriteStations')),
          favorite: isFavorite(parseInt(station['id'], 10)),
        },
      });
    });
  }

  function hideMarkerInfo() {
    if(animateMarker) {
      animateMarker.setAnimation(null);
    }
    $$('.marker-info').css('display', 'none');
  }

  function setGroupMarkerVisible(groupId) {
    var category = ['古蹟', '藝文', '景觀', '行政單位'];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = markers[category[groupId]][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var marker = _step3.value;

        marker.setVisible(!marker.visible);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  function getMap(latitude, longitude, accuracy) {
    locationMarker.setPosition({ lat: latitude, lng: longitude });
    locationMarkerFrame.setPosition({ lat: latitude, lng: longitude });
    locationCircle.setCenter({ lat: latitude, lng: longitude });
    locationCircle.setRadius(accuracy);
  }

  function onMapWatchSuccess(position) {
    var updatedLatitude = position.coords.latitude;
    var updatedLongitude = position.coords.longitude;
    var updatedAccuracy = position.coords.accuracy;

    if (updatedLatitude !== Latitude || updatedLongitude !== Longitude || updatedAccuracy !== Accuracy) {
      Latitude = updatedLatitude;
      Longitude = updatedLongitude;
      Accuracy = updatedAccuracy;

      getMap(updatedLatitude, updatedLongitude, updatedAccuracy);
      if (page.context.isDirection) {
        calculateAndDisplayRoute({ lat: Latitude, lng: Longitude }, waypts, display = true);
      }
    }
  };

  function onMapError(error) {
    console.log('code: ' + error.code + '\nmessage: ' + error.message + '\n');
    if (page.context.isDirection) {
      var origin = waypts.pop();
      myApp.alert('導覽無法進行定位', '未開啟GPS');
      calculateAndDisplayRoute({ lat: origin['location']['lat'], lng: origin['location']['lng'] }, waypts, display = true);
    }
  }
});

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
