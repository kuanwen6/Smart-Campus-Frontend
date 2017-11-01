var directionsService = void 0;
var directionsDisplay = void 0;

mainView.hideToolbar();

$$(document).on('page:init', function(e) {
  var page = e.detail.page;
  console.log(page);
});

$$(document).on('backbutton', function() {
  var view = myApp.getCurrentView();
  var page = view.activePage;

  if (page.name == "index") {
    var result = myApp.confirm("確定要離開嗎？", "成大藏奇圖", function() {
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

function userDataInit() {
  window.localStorage.setItem('loggedIn', false);
  window.localStorage.setItem('launchCount', true);
  window.localStorage.setItem('nickname', 'Guest');
  window.localStorage.setItem('experiencePoint', 0);
  window.localStorage.setItem('rewards', '[]');
  window.localStorage.setItem('favoriteStations', '[]');
  window.localStorage.setItem('coins', 0);
}

$$(document).on('deviceready', function() {
  console.log('Device is ready!');

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
});

myApp.onPageInit('index', function(page) {
  $$('.login-form-to-json').on('click', function() {
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

  $$('.register-form-to-json').on('click', function() {
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
        if (status===400) {
          myApp.alert('Email格式錯誤，請重新再試', '註冊失敗');
        } else if (status===409) {
          myApp.alert('此Email已經註冊過', '註冊失敗');
        } else if (status===422) {
          myApp.alert('輸入資料不完整，請重新再試', '註冊失敗');
        } else {
          myApp.alert('伺服器錯誤，請稍後再試', '註冊失敗');
        }
      }
    );
  });

  $$('.forget-pw').on('click', function() {
    myApp.prompt('請輸入註冊時的email', '忘記密碼',
      function (value) {
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

            if(status===401) {
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
  var Latitude = undefined;
  var Longitude = undefined;
  var Accuracy = undefined;
  var image = {
    url: './icon/mobileimgs2.png',
    size: new google.maps.Size(22, 22),
    origin: new google.maps.Point(0, 18),
    anchor: new google.maps.Point(11, 11)
  };
  var map = new google.maps.Map($$('#map')[0], {
    zoom: 16,
    center: { lat: 22.998089, lng: 120.217441 },
    disableDefaultUI: true,
    clickableIcons: false
  });
  var locationMarker = new google.maps.Marker({
    clickable: false,
    icon: image,
    shadow: null,
    zIndex: 999,
    map: map
  });
  var locationCircle = new google.maps.Circle({
    fillColor: '#61a0bf',
    fillOpacity: 0.4,
    strokeColor: '#1bb6ff',
    strokeOpacity: 0.4,
    strokeWeight: 1,
    map: map
  });
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

  map.addListener('click', hideMarkerInfo);
  directionOrMapOverview(page.context.isDirection);
  setMarkers(map);
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

  function setMarkers(map) {
    var icon = {
      '古蹟': 'img/markers/marker_red.png',
      '藝文': 'img/markers/marker_orange.png',
      '景觀': 'img/markers/marker_green.png',
      '行政單位': 'img/markers/marker_blue.png'
    };
    var scaledSize = new google.maps.Size(25, 36);
    var anchor = new google.maps.Point(12.5, 36);
    markers = { '古蹟': [], '藝文': [], '景觀': [], '行政單位': [] };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = stations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var station = _step2.value;

        var marker = new google.maps.Marker({
          position: { lat: station['location'][1], lng: station['location'][0] },
          title: station['name'],
          map: map,
          icon: {
            url: icon[station['category']],
            scaledSize: scaledSize,
            anchor: anchor
          }
        });
        marker.addListener('click', showMarkerInfo);
        markers[station['category']].push(marker);
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

    $$('#marker-img').attr('src', station['image']['primary']);
    $$('#marker-category').html('/ ' + station['category'] + '主題 /');
    $$('#marker-name').html(station['name'].replace('/', '<br>/'));
    $$('#marker-distance').html(_distance);
    $$('.marker-favorite').attr('id', station['id']);
    $('.marker-favorite').toggleClass('color-red', isFavorite(station['id']));
    $$('.marker-info').css('display', 'block');
  }

  function hideMarkerInfo() {
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

  $$('#logout').on('click', function() {
    myApp.confirm('', '確認登出?', function () {
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

function calculateAndDisplayRoute(origin, waypts) {
  var display = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  directionsService.route({
    origin: origin,
    destination: origin,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'WALKING'
  }, function(response, status) {
    if (status === 'OK') {
      response.routes[0].legs = response.routes[0].legs.slice(0, -1);
      console.log(response);
      if (display) {
        directionsDisplay.setDirections(response);
      } else {
        var totalDistance = 0;
        var totalDuration = 0;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = response.routes[0].legs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var leg = _step4.value;

            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        callback(totalDistance, totalDuration);
      }
    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
}

function distance(lat1, lng1, lat2, lng2) {
  if (lat1 === -1 && lng1 === -1) {
    return '未開啟GPS';
  }

  var radlat1 = Math.PI * lat1 / 180;
  var radlat2 = Math.PI * lat2 / 180;
  var theta = lng1 - lng2;
  var radtheta = Math.PI * theta / 180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist *= 69.09;
  dist *= 1.609344;

  if (dist < 1) {
    dist *= 1000;
    return dist.toFixed(0) + '公尺';
  }
  return dist.toFixed(1) + '公里';
}

function getLocationArray(idArray) {
  var returnValue = [];
  var stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  var site;

  for (var i = 0; i < idArray.length; i++) {
    site = findStation(stations, idArray[i]);
    returnValue.push({ location: { lat: site.location[1], lng: site.location[0] } });
  }

  return returnValue;
}

function createCards(data, onclickCallback) {
  for (var i = 0; i < data.length; i += 1) {
    var description = data[i].description;
    if (data[i].description.length > 12) {
      description = description.substring(0, 12) + '...';
    }
    var routeLocation = getLocationArray(data[i].station_sequence);
    console.log(routeLocation);

    if (routeLocation.length > 1) {
      (function(currentData, des){
        calculateAndDisplayRoute(
          routeLocation[0].location,
          routeLocation.slice(1),
          display = false,
          callback = function(d, t) {
            $$('.big-card').append('<div class="card" id="' + currentData.id + '">' +
                '<div href="#" class="card-content" style="height:15vh;">' +
                    '<div class="row no-gutter">' +
                        '<div class="col-35"><img src="' + currentData.image + '" class="lazy lazy-fadeIn" style="width:20vh;height:15vh;object-fit: cover;"></div>' +
                        '<div class="col-60" style="padding:8px;">' +
                            '<div class="card-title"><span>' + currentData.name + '</span></div>' +
                            '<br>' +
                            '<div class="row">' +
                                '<div class="col-35"></div>' +
                                '<div class="col-60"><span>' + des + '</span></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
              '<div class="card-footer"><span>預估時間: ' + (t/60).toFixed(0) + '分鐘</span></div>' +
            '</div>');
            onclickCallback();
          }
        );
      })(data[i], description);
    } else {
      (function(currentData, des){
        calculateAndDisplayRoute(
          routeLocation[0].location,
          routeLocation.slice(1),
          display = false,
          callback = function(d, t) {
            $$('.big-card').append('<div class="card" id="' + currentData.id + '">' +
                '<div href="#" class="card-content" style="height:15vh;">' +
                    '<div class="row no-gutter">' +
                        '<div class="col-35"><img src="' + currentData.image + '" class="lazy lazy-fadeIn" style="width:20vh;height:15vh;object-fit: cover;"></div>' +
                        '<div class="col-60" style="padding:8px;">' +
                            '<div class="card-title"><span>' + currentData.name + '</span></div>' +
                            '<br>' +
                            '<div class="row">' +
                                '<div class="col-35"></div>' +
                                '<div class="col-60"><span>' + des + '</span></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
              '<div class="card-footer"><span>預估時間: 0分鐘</span></div>' +
            '</div>');
            onclickCallback();
          }
        );
      })(data[i], description);
    }
  }
}

function createFavoriteCards(favorite, lat, lng, callback) {
  var distanceBetween;
  for (var i = 0; i < favorite.length; i += 1) {
    distanceBetween = distance(lat, lng, favorite[i].location[1], favorite[i].location[0]);

    (function(currentFavorite, dis){
      $$('*[data-page="customRoute"] .swipe-list').append('<li class="swipeout" id="' + currentFavorite.id + '" style="z-index:100;">' +
                  '<div class="card swipeout-content">' +
                      '<div href="#" class="card-content" style="height:18vh;">' +
                          '<div class="row no-gutter">' +
                              '<img class="delete-route" id="' + currentFavorite.id + '" src="img/error.png" style="height:18px; width:18px;position:absolute;right:5px; top:5px;">' +
                              '<div class="col-50">' +
                                '<img src="' + currentFavorite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                                '<i class="f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                              '</div>'+
                              '<div class="col-50" style="padding:8px;">' +
                                  '<div class="card-title"><span>' + currentFavorite.name + '</span></div>' +
                                  '<div style="position:absolute; right:0; bottom:5px;">' +
                                    '<span>' + dis + '</span>' +
                                  '</div>' +
                              '</div>' +
                          '</div>' +
                      '</div>' +
                  '</div>' +
                  '<div class="swipeout-actions-right">' +
                    '<a href="#" class="swipeout-delete swipeout-overswipe" id="' + currentFavorite.id+ '">' +
                      '<div>' +
                        '<i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">trash_fill</i>' +
                        '<br>' +
                        '<p style="font-size:13px;">確認刪除</p>' +
                      '</div>' +
                    '</a>' +
                  '</div>' +
                '</li>');
    })(favorite[i], distanceBetween);
  }

  callback();
}

function createFavorite(favorite, lat, lng, callback) {
  var distanceBetween;
  for (var i = 0; i < favorite.length; i += 1) {
    distanceBetween = distance(lat, lng, favorite[i].location[1], favorite[i].location[0]);

    (function(currentFavorite, dis){
      $$('.favorite-swipe-list').append('<li class="swipeout swipeout-favorite-' + currentFavorite.id + '" id="' + currentFavorite.id + '" style="z-index:100;">' + 
      '<div class="card swipeout-content">' +
          '<div href="#" class="card-content" style="height:18vh;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentFavorite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentFavorite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                  '</div>' +
                  '<div class="col-50" style="padding:8px;">' +
                      '<div class="card-title"><span>' + currentFavorite.name + '</span></div>' +
                      '<div style="position:absolute; right:0; bottom:5px;">' +
                          '<span>' + dis + '</span>' +
                      '</div>' +
                  '</div>' +
              '</div>' +
          '</div>' +
      '</div>' +
      '<div class="swipeout-actions-right">' +
        '<a href="#" class="remove-favorite swipeout-overswipe" id="' + currentFavorite.id + '">' +
         '<div>' +
            '<i class="favorite-heart-' + currentFavorite.id + ' f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>' +
            '<br>' +
            '<p style="font-size:13px;">移出最愛</p>' +
          '</div>' +
        '</a>' +
      '</div>' +
    '</li>');
    })(favorite[i], distanceBetween);
  }

  callback();
}

function createSites(sites, favorite, lat, lng, callback) {
  console.log("creating site");
  var category;
  var distanceBetween;
  console.log("creating site num" + sites.length);
  for (var i = 0; i < sites.length; i += 1) {
    switch (sites[i].category) {
      case '藝文':
        category = 'art';
        break;
      case '古蹟':
        category = 'history';
        break;
      case '景觀':
        category = 'nature';
        break;
      case '行政單位':
        category = 'business';
        break;
      default:
        category = 'art';
    }

    distanceBetween = distance(lat, lng, sites[i].location[1], sites[i].location[0]);

    (function(currentSite, cate, dis){
    if ($.inArray(currentSite.id, favorite) === -1) {
      $$('.' + cate + '-list').append('<li class="swipeout swipeout-' + currentSite.id + '" id="' + currentSite.id+ '" style="z-index:100;">' +
      '<div class="card swipeout-content">' +
          '<div href="#" class="card-content" style="height:18vh;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                  '</div>' +
                  '<div class="col-50" style="padding:8px;">' +
                      '<div class="card-title"><span>' + currentSite.name + '</span></div>' +
                     '<div style="position:absolute; right:0; bottom:5px;">' +
                         '<span>' + dis + '</span>' +
                      '</div>' +
                  '</div>' +
              '</div>' +
          '</div>' +
      '</div>' +
      '<div class="swipeout-actions-right">' +
        '<a href="#" class="add-favorite swipeout-overswipe" id="' + currentSite.id + '">' +
          '<div>' +
            '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>' +
            '<br>' +
            '<p style="font-size:13px;">加入最愛</p>' +
          '</div>' +
        '</a>' +
      '</div>' +
    '</li>');

      //  take apart of this two class is because of the swipeoutClose(), this function can only operate 'a' element at the same time
      $$('.search-all-list').append('<li class="swipeout swipeout-search-' + currentSite.id + '" id="' + currentSite.id+ '" style="z-index:100;">' +
      '<div class="card swipeout-content">' +
          '<div href="#" class="card-content" style="height:18vh;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                  '</div>' +
                  '<div class="col-50" style="padding:8px;">' +
                      '<div class="card-title"><span>' + currentSite.name + '</span></div>' +
                     '<div style="position:absolute; right:0; bottom:5px;">' +
                         '<span>' + dis + '</span>' +
                      '</div>' +
                  '</div>' +
              '</div>' +
          '</div>' +
      '</div>' +
      '<div class="swipeout-actions-right">' +
        '<a href="#" class="add-favorite swipeout-overswipe" id="' + currentSite.id + '">' +
          '<div>' +
            '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>' +
            '<br>' +
            '<p style="font-size:13px;">加入最愛</p>' +
          '</div>' +
        '</a>' +
      '</div>' +
    '</li>');
    } else {
      $$('.' + cate + '-list').append('<li class="swipeout swipeout-' + currentSite.id + '" id="' + currentSite.id+ '" style="z-index:100;">' +
      '<div class="card swipeout-content">' +
          '<div href="#" class="card-content" style="height:18vh;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                  '</div>' +
                  '<div class="col-50" style="padding:8px;">' +
                      '<div class="card-title"><span>' + currentSite.name + '</span></div>' +
                     '<div style="position:absolute; right:0; bottom:5px;">' +
                         '<span>' + dis + '</span>' +
                      '</div>' +
                  '</div>' +
              '</div>' +
          '</div>' +
      '</div>' +
      '<div class="swipeout-actions-right">' +
        '<a href="#" class="remove-favorite swipeout-overswipe" id="' + currentSite.id + '">' +
          '<div>' +
            '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>' +
            '<br>' +
            '<p style="font-size:13px;">移出最愛</p>' +
          '</div>' +
        '</a>' +
      '</div>' +
    '</li>');

      //  take apart of this two class is because of the swipeoutClose(), this function can only operate 'a' element at the same time
      $$('.search-all-list').append('<li class="swipeout swipeout-search-' + currentSite.id + '" id="' + currentSite.id+ '" style="z-index:100;">' +
      '<div class="card swipeout-content">' +
          '<div href="#" class="card-content" style="height:18vh;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
                  '</div>' +
                  '<div class="col-50" style="padding:8px;">' +
                      '<div class="card-title"><span>' + currentSite.name + '</span></div>' +
                     '<div style="position:absolute; right:0; bottom:5px;">' +
                         '<span>' + dis + '</span>' +
                      '</div>' +
                  '</div>' +
              '</div>' +
          '</div>' +
      '</div>' +
      '<div class="swipeout-actions-right">' +
        '<a href="#" class="remove-favorite swipeout-overswipe" id="' + currentSite.id + '">' +
          '<div>' +
            '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>' +
            '<br>' +
            '<p style="font-size:13px;">移出最愛</p>' +
          '</div>' +
        '</a>' +
      '</div>' +
    '</li>');
    }
    })(sites[i], category, distanceBetween);
  }

  callback();
}

function findRoute(routes, id) {
  return routes.find(function(entry) { return entry.id === parseInt(id, 10); });
}

function findSequence(stations, sequence) {
  var result = [];

  for (var i = 0; i < sequence.length; i += 1) {
    result.push(stations.find(function(entry) { return entry.id === sequence[i]; }));
  }

  return result;
}

function findStation(stations, id) {
  return stations.find(function(entry) { return entry.id === id; });
}

function getRewards(rewards, rewardID) {
  rewards.push(rewardID);
  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_user_reward/',
      data = {
        'email': window.localStorage.getItem('email'),
        'reward_id': rewardID,
      },
      success = function(data) {
        // data = JSON.parse(data);
        window.localStorage.setItem('rewards', JSON.stringify(rewards));
      },
      error = function(data) {
        console.log("add fail");
      }
    );
  } else {
    window.localStorage.setItem('rewards', JSON.stringify(rewards));
  }
  return rewards;
}

function modifyMoney(money, change) {
  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/update_user_coins/',
      data = {
        'email': window.localStorage.getItem('email'),
        'coins': money + change,
      },
      success = function(data) {
        data = JSON.parse(data);
        window.localStorage.setItem('coins', data.data.coins);
      },
      error = function(data) {
        console.log("add fail");
      }
    );
  } else {
    window.localStorage.setItem('coins', money + change);
  }
  return money + change;
}

function experienceUp(experiencePoint) {
  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/update_user_experience_point/',
      data = {
        'email': window.localStorage.getItem('email'),
        'experience_point': experiencePoint + 10,
      },
      success = function(data) {
        data = JSON.parse(data);
        window.localStorage.setItem('experiencePoint', data.data.experience_point);
      },
      error = function(data) {
        console.log("add fail");
      }
    );
  } else {
    window.localStorage.setItem('experiencePoint', experiencePoint + 10);
  }
  return experiencePoint + 10;
}

function isFavorite(id) {
  if ($.inArray(id, JSON.parse(window.localStorage.getItem('favoriteStations'))) === -1) {
    return false;
  }
  return true;
}

function addFavorite(favorite, id) {
  favorite.push(id);

  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_user_favorite_stations/',
      data = {
        'email': window.localStorage.getItem('email'),
        'station_id': id,
      },
      success = function(data) {
        data = JSON.parse(data);
        console.log(data);
        window.localStorage.setItem('favoriteStations', JSON.stringify(data.stations));
      },
      error = function(data) {
        console.log("add fail");
      }
    );
    return favorite;
  } else {
    window.localStorage.setItem('favoriteStations', JSON.stringify(favorite));
    return favorite;
  }
}

function removeFavorite(favorite, id) {
  var index = favorite.indexOf(id);
  if (index > -1) {
    favorite.splice(index, 1);
  }

  if (window.localStorage.getItem("loggedIn") !== "false") {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/remove_user_favorite_stations/',
      data = {
        'email': window.localStorage.getItem('email'),
        'station_id': id,
      },
      success = function(data) {
        data = JSON.parse(data);
        console.log(data);
        window.localStorage.setItem('favoriteStations', JSON.stringify(data.stations));
      },
      error = function(data) {
        console.log("add fail");
      }
    );
    return favorite;
  } else {
    window.localStorage.setItem('favoriteStations', JSON.stringify(favorite));
    return favorite;
  }
}

function itemDetailRemove(favorite, id) {
  $$('.detailHeart').removeClass('color-red').addClass('color-white');

  $$('.favorite-heart-' + id).removeClass('color-red').addClass('color-white');
  $('#' + id + '.remove-favorite').removeClass('remove-favorite').addClass('add-favorite');
  myApp.swipeoutClose($$('li.swipeout-' + id));
  myApp.swipeoutClose($$('li.swipeout-search-' + id));
  $('#' + id + '.swipeout-overswipe').children('div').children('p').html('加入最愛');

  favorite = removeFavorite(favorite, id);

  $$('.detailHeart').attr("onclick", 'itemDetailAdd([' + favorite + '],' + id + ')');
}

function itemDetailAdd(favorite, id) {
  $$('.detailHeart').removeClass('color-white').addClass('color-red');

  $$('.favorite-heart-' + id).removeClass('color-white').addClass('color-red');
  $('#' + id + '.add-favorite').removeClass('add-favorite').addClass('remove-favorite');
  myApp.swipeoutClose($$('li.swipeout-' + id));
  myApp.swipeoutClose($$('li.swipeout-search-' + id));
  $('#' + id + '.swipeout-overswipe').children('div').children('p').html('移出最愛');

  favorite = addFavorite(favorite, id);

  $$('.detailHeart').attr("onclick", 'itemDetailRemove([' + favorite + '],' + id + ')');
}

function moneySelect() {
  $$('#money-select-modal').css('display', 'block');
}

myApp.onPageInit('route', function() {
  mainView.hideToolbar();
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: 'index.html', force: false });
  });
});

myApp.onPageInit('themeRoute', function() {
  var stationsObj = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  var plansObj = JSON.parse(window.localStorage.getItem('allPlansInfo'));
  
  function cardOnclick() {
    $$('img.lazy').trigger('lazy');
    $$('.card').on('click', function() { // if change to () => { ,it will go wrong!
      var route = findRoute(plansObj, this.id);
      var itemList = findSequence(stationsObj, route.station_sequence);
      var time = $$(this).children('.card-footer').find('span').html();

      mainView.router.load({
        url: 'routeDetail.html',
        context: {
          title: route.name,
          time: time,
          custom: false,
          previous: 'themeRoute.html',
          introduction: route.description,
          img: route.image,
          itemList: itemList
        },
      });
    });
  }
  createCards(plansObj, cardOnclick);
});

myApp.onPageInit('themeSite', function() {
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: 'index.html', force: false });
  });

  var stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  var favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));

  //  because haved to wait for appened fininshed
  function onclickFunc() {
    $$('img.lazy').trigger('lazy');
    $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
      var site = findStation(stations, parseInt(this.id, 10));
      console.log(this);
      mainView.router.load({
        url: 'itemDetail.html',
        context: {
          site: site,
          isBeacon: false,
          favoriteSequence: favoriteSequence,
          favorite: isFavorite(parseInt(this.id, 10)),
        },
      });
    });

    $$('*[data-page="themeSite"] .swipeout').on('swipeout:closed', function() {
      $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
        var site = findStation(stations, parseInt(this.id, 10));
        console.log(site);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
            site: site,
            isBeacon: false,
            favoriteSequence: favoriteSequence,
            favorite: isFavorite(parseInt(this.id, 10)),
          },
        });
      });
    });

    function favorites() { // if change to () => { , it will go wrong!
      $$('*[data-page="themeSite"] li.swipeout').off('click');

      if ($$(this).hasClass('add-favorite')) {
        // add this.id to favorite
        console.log('add toggle');

        favoriteSequence = addFavorite(favoriteSequence, parseInt(this.id, 10));
        console.log(favoriteSequence);

        $$('.favorite-heart-' + this.id).removeClass('color-white').addClass('color-red');
        $('#' + this.id + '.add-favorite').removeClass('add-favorite').addClass('remove-favorite');
        myApp.swipeoutClose($$('li.swipeout-' + this.id));
        myApp.swipeoutClose($$('li.swipeout-search-' + this.id));
        $$(this).children('div').children('p').html('移出最愛');
      } else {
        // remove this.id to favorite
        console.log('remove toggle');

        favoriteSequence = removeFavorite(favoriteSequence, parseInt(this.id, 10));

        $$('.favorite-heart-' + this.id).removeClass('color-red').addClass('color-white');
        $('#' + this.id + '.remove-favorite').removeClass('remove-favorite').addClass('add-favorite');
        myApp.swipeoutClose($$('li.swipeout-' + this.id));
        myApp.swipeoutClose($$('li.swipeout-search-' + this.id));
        $$(this).children('div').children('p').html('加入最愛');
      }
    }

    $$('*[data-page="themeSite"] .swipeout-overswipe').on('click', favorites);
  }

  function onSuccess(position) {
    console.log("themeSite onSuccess start")
    createSites(stations, favoriteSequence, position.coords.latitude, position.coords.longitude, onclickFunc);
    console.log("themeSite onSuccess finish");
  }

  function onError() {
    console.log("themeSite onSuccess start no loc")
    createSites(stations, favoriteSequence, -1, -1, onclickFunc);
    console.log("themeSite onSuccess finish no loc");
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3500, enableHighAccuracy: true });

});

// cover the onclick function
myApp.onPageAfterAnimation('themeSite', function(p) {
  if (p.fromPage.name != 'index') {
    console.log('back');
    $$('*[data-page="themeSite"] li.swipeout').off('click');
    $$('*[data-page="themeSite"] .swipeout-overswipe').off('click');
    
    var stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
    var favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));
  
    onclickFunc();

    //  because haved to wait for appened fininshed
    function onclickFunc() {
      $$('img.lazy').trigger('lazy');
      $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
        var site = findStation(stations, parseInt(this.id, 10));
        console.log(this);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
            site: site,
            isBeacon: false,
            favoriteSequence: favoriteSequence,
            favorite: isFavorite(parseInt(this.id, 10)),
          },
        });
      });
  
      $$('*[data-page="themeSite"] .swipeout').on('swipeout:closed', function() {
        $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
          var site = findStation(stations, parseInt(this.id, 10));
          console.log(site);
          mainView.router.load({
            url: 'itemDetail.html',
            context: {
              site: site,
              isBeacon: false,
              favoriteSequence: favoriteSequence,
              favorite: isFavorite(parseInt(this.id, 10)),
            },
          });
        });
      });

      function favorites() { // if change to () => { , it will go wrong!
        $$('*[data-page="themeSite"] li.swipeout').off('click');
  
        if ($$(this).hasClass('add-favorite')) {
          // add this.id to favorite
          console.log('add toggle');
  
          favoriteSequence = addFavorite(favoriteSequence, parseInt(this.id, 10));
          console.log(favoriteSequence);
  
          $$('.favorite-heart-' + this.id).removeClass('color-white').addClass('color-red');
          $('#' + this.id + '.add-favorite').removeClass('add-favorite').addClass('remove-favorite');
          myApp.swipeoutClose($$('li.swipeout-' + this.id));
          myApp.swipeoutClose($$('li.swipeout-search-' + this.id));
          $$(this).children('div').children('p').html('移出最愛');
        } else {
          // remove this.id to favorite
          console.log('remove toggle');
  
          favoriteSequence = removeFavorite(favoriteSequence, parseInt(this.id, 10));
  
          $$('.favorite-heart-' + this.id).removeClass('color-red').addClass('color-white');
          $('#' + this.id + '.remove-favorite').removeClass('remove-favorite').addClass('add-favorite');
          myApp.swipeoutClose($$('li.swipeout-' + this.id));
          myApp.swipeoutClose($$('li.swipeout-search-' + this.id));
          $$(this).children('div').children('p').html('加入最愛');
        }
      }
  
      $$('*[data-page="themeSite"] .swipeout-overswipe').on('click', favorites);

    }
  }
});

myApp.onPageInit('routeDetail', function(page) {
  $$('.toolbar').off('click');
  $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀<i class="f7-icons color-red toolbar-icon">navigation_fill</i></a></div>');
  if (!page.context.custom) {
    myApp.accordionOpen($$('li#introduction'));
  } else {
    myApp.accordionOpen($$('li#itemList'));
  }
  $$('.toolbar').on('click', function() {
    mainView.router.load({
      url: 'map.html',
      context: {
        isDirection: true,
        stations: page.context.itemList,
      },
    });
  });
});

myApp.onPageInit('favorite', function() {
  mainView.hideToolbar();

  var stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  var favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));

  if (favoriteSequence.length === 0) {
    myApp.alert('快去加入你所感興趣的站點吧!', '尚未有任何最愛站點', function() {
      mainView.router.back();
    });
  }

  var itemList = findSequence(stations, favoriteSequence);

  $$('*[data-page="favorite"] li.swipeout').off('click');
  $$('*[data-page="favorite"] .swipeout-overswipe').off('click');

  //  because haved to wait for appened fininshed
  function onclickFunc() {
    $$('img.lazy').trigger('lazy');
    $$('*[data-page="favorite"] li.swipeout').on('click', function() {
      var favoriteSite = findStation(itemList, parseInt(this.id, 10));
      console.log(this);
      mainView.router.load({
        url: 'itemDetail.html',
        context: {
          site: favoriteSite,
          isBeacon: false,
          favoriteSequence: favoriteSequence,
          favorite: isFavorite(parseInt(this.id, 10)),
        },
      });
    });

    $$('*[data-page="favorite"] .swipeout').on('swipeout:closed', function() {
      $$('*[data-page="favorite"] li.swipeout').on('click', function() {
        var site = findStation(itemList, parseInt(this.id, 10));
        console.log(site);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
            site: favoriteSite,
            isBeacon: false,
            favoriteSequence: favoriteSequence,
            favorite: isFavorite(parseInt(this.id, 10)),
          },
        });
      });
    });

    function favorites() { // if change to () => { , it will go wrong!
      $$('*[data-page="favorite"] li.swipeout').off('click');
      if ($$(this).hasClass('add-favorite')) {
        console.log('add toggle');

        favoriteSequence = addFavorite(favoriteSequence, parseInt(this.id, 10));

        $$('.favorite-heart-' + this.id).removeClass('color-white').addClass('color-red');
        $('#' + this.id + '.add-favorite').removeClass('add-favorite').addClass('remove-favorite');
        myApp.swipeoutClose($$('li.swipeout-favorite-' + this.id));
        $$(this).children('div').children('p').html('移出最愛');
      } else {
        console.log('remove toggle');

        favoriteSequence = removeFavorite(favoriteSequence, parseInt(this.id, 10));

        $$('.favorite-heart-' + this.id).removeClass('color-red').addClass('color-white');
        $('#' + this.id + '.remove-favorite').removeClass('remove-favorite').addClass('add-favorite');
        myApp.swipeoutClose($$('li.swipeout-favorite-' + this.id));
        $$(this).children('div').children('p').html('加入最愛');
      }
    }

    $$('*[data-page="favorite"] .swipeout-overswipe').off('click');
    $$('*[data-page="favorite"] .swipeout-overswipe').on('click', favorites);
  }

  function onSuccess(position) {
    createFavorite(itemList, position.coords.latitude, position.coords.longitude, onclickFunc);
  }

  function onError() {
    createFavorite(itemList, -1, -1, onclickFunc);
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3500, enableHighAccuracy: true });
});

function backChoice(previous) {
  if (previous === 'themeRoute.html') {
    mainView.hideToolbar();
    mainView.router.back();
  } else {
    mainView.router.back({ url: 'customRoute.html', force: true, ignoreCache: true });
  }
}

myApp.onPageInit('customRoute', function() {
  $$('.back-force').on('click', function() {
    console.log('back click');
    mainView.router.back({ url: 'route.html', force: true });
  });

  

  var stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  var favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));
  console.log(favoriteSequence);
  var itemList = findSequence(stations, favoriteSequence);

  if (favoriteSequence.length === 0) {
    myApp.alert('快去加入你所感興趣的站點吧!', '尚未有任何最愛站點', function() {
      mainView.router.back();
    });
  }

  function deleteFunc() {
    $$('img.lazy').trigger('lazy');
    $$('.delete-route').on('click', function() { // if change to () => { , it will go wrong!
      myApp.swipeoutOpen($('li#' + this.id));
      myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
      myApp.swipeoutDelete($('li#' + this.id));

      var index = favoriteSequence.indexOf(parseInt(this.id, 10));
      if (index > -1) {
        favoriteSequence.splice(index, 1);
      }
    });

    $$('*[data-page="customRoute"] .swipeout-overswipe').on('click', function() {
      console.log(this.id);
      var index = favoriteSequence.indexOf(parseInt(this.id, 10));
      if (index > -1) {
        favoriteSequence.splice(index, 1);
      }
    });
  }

  function onSuccess(position) {
    createFavoriteCards(itemList, position.coords.latitude, position.coords.longitude, deleteFunc);
  }

  function onError() {
    createFavoriteCards(itemList, -1, -1, deleteFunc);
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3500, enableHighAccuracy: true });

  mainView.showToolbar();
  $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto; height:48px;">確定行程</a></div>');

  $$('.toolbar').off('click'); // avoid append multiple onclicked on toolbar
  $$('.toolbar').on('click', function() {
    if (favoriteSequence.length === 0) {
      myApp.alert('並沒有選擇任何站點喔!', '注意');
    } else {
      itemList = findSequence(stations, favoriteSequence);
      var routeLocation = getLocationArray(favoriteSequence);

      if (routeLocation.length > 1) {
        calculateAndDisplayRoute(
          routeLocation[0].location,
          routeLocation.slice(1),
          display = false,
          callback = function(d, t) {
            mainView.router.load({
              url: 'routeDetail.html',
              context: {
                title: '自訂行程',
                time: '預估時間: ' + (t/60).toFixed(0) +  '分鐘',
                custom: true,
                previous: 'customRoute.html',
                introduction: '自己想的好棒喔',
                img: itemList[0].image.primary,
                itemList: itemList,
              },
            });
          }
        );
      } else {
        mainView.router.load({
          url: 'routeDetail.html',
          context: {
            title: '自訂行程',
            time: '預估時間: 0分鐘',
            custom: true,
            previous: 'customRoute.html',
            introduction: '自己想的好棒喔',
            img: itemList[0].image.primary,
            itemList: itemList,
          },
        });
      }
    }
  });
});

myApp.onPageInit('itemDetail', function (page) {
  $$('.toolbar').off('click');
  //  detect if this station have question to answered
  if (page.context.isBeacon) {
    if (localStorage.getItem("loggedIn") !== "false") {
      $$.ajax({
        url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
        type: 'get',
        data: {
          'email': window.localStorage.getItem('email'),
          'station_id': page.context.site.id,
        },
        success: function(data) {
          var questionData = JSON.parse(data);
          console.log(questionData);
          if ($.isEmptyObject(questionData)) {
            mainView.hideToolbar();
            console.log('empty');
          } else {
            mainView.showToolbar();
            $$('.page-content').css('padding-bottom', '9.5vh');
            $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">接受挑戰</a></div>');
            $$('.toolbar').on('click', moneySelect);
            console.log('not');
          }
        },
      });
    } else {
      mainView.showToolbar();
      $$('.page-content').css('padding-bottom', '9.5vh');
      $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">接受挑戰</a></div>');
      $$('.toolbar').on('click', moneySelect);
    }
  }

  var link = $('*[data-page="itemDetail"] #site-content  a').attr('href');
  $$('*[data-page="itemDetail"] #site-content  a').attr('onclick', 'window.open("' + link + '", "_system")');
  $$('*[data-page="itemDetail"] #site-content  a').attr('href', '#');

  $$('.custom-money-content').on('click', function(e) {
    var pHeight = $$('.custom-money-content').height();
    var pOffset = $$('.custom-money-content').offset();
    var y = e.pageY - pOffset.top;
    console.log(pHeight);
    console.log(y);
    var money = parseInt(window.localStorage.getItem('coins'), 10);

    if (y > pHeight * 0.5 && y <= pHeight) {
      console.log('200');
      mainView.router.load({
        url: 'gamePage.html',
        context: {
          id: page.context.site.id,
          rewardID: page.context.site.rewards,
          gain: 200,
        },
      });
      $$('#money-select-modal').css('display', 'none');
      mainView.hideToolbar();
      $$('.page-content').css('padding-bottom', 0);
    } else {
      console.log('500');
      if (money < 500) {
        myApp.alert('擁有金幣不足!', '下注失敗');
      } else {
        money = modifyMoney(money, -500);
        mainView.router.load({
          url: 'gamePage.html',
          context: {
            id: page.context.site.id,
            rewardID: page.context.site.rewards,
            gain: 1000,
          },
        });
        $$('#money-select-modal').css('display', 'none');
        mainView.hideToolbar();
        $$('.page-content').css('padding-bottom', 0);
      }
    }
  });
});

function answerQuestion(question, options, answer, question_id, gain, rewardID) {
  var money = parseInt(window.localStorage.getItem('coins'), 10);
  var experiencePoint = parseInt(window.localStorage.getItem('experiencePoint'), 10);

  $$('#questionTextArea').html(question);
  for (var i = 0; i < 4; i += 1) {
    $$('#answer' + (i+1)).html(options[i]);
  }

  console.log('money ' + money);
  console.log('experiencePoint ' + experiencePoint);
  console.log('progress ' + (experiencePoint % EXP_PER_LEVEL) * 2)

  $$('.money_reward').html(gain);
  myApp.setProgressbar($$('#level-progress'), (experiencePoint % EXP_PER_LEVEL) * 2);

  $$('.answer').on('click', function answerClicked() {
    $$('.answer').off('click', answerClicked); // lock the button

    if (this.id === 'answer' + answer.toString()) {
      money = modifyMoney(money, gain);
      experiencePoint = experienceUp(experiencePoint);
      myApp.setProgressbar($$('#level-progress'), (experiencePoint % EXP_PER_LEVEL) * 2, 1300);

      $$('#' + this.id).css('background', '#40bf79');
      $$('#' + this.id).append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">' +
        '<circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>' +
        '<polyline class="path check" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>' +
      '</svg>');
      $$('#endImg').attr('src', 'img/success-board.png');
      setTimeout(function() {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append('<div class="end-board-message" style="position: relative;top: calc(53% - 22px);text-align:center;">' +
          '<span style="font-size:6vw;font-weight:bold;">等級' + Math.floor(experiencePoint / EXP_PER_LEVEL + 1) + '</span><br><br>' +
          '<img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;' +
          '<span style="font-size:9vw; font-weight:bold; vertical-align: middle;">' + money + '</span>' +
        '</div>');
      }, 1200);

      if (window.localStorage.getItem('loggedIn') !== "false") {
        $$.post(
          url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_answered_question/',
          data = {
            'question_id': question_id,
            'email': window.localStorage.getItem('email'),
          },
          success = function(data) {
            console.log('add answered success');
          }
        );
      }

      var rewards = JSON.parse(window.localStorage.getItem('rewards'));
      console.log('rewardID');
      if (rewardID.length > 0) {
        console.log(rewardID);
        console.log(rewards);

        if ($.inArray(rewardID[0], rewards) === -1) {
          rewards = getRewards(rewards, rewardID[0]);

          var rewardsInfo = JSON.parse(window.sessionStorage.getItem('allRewardsInfo'));
          var rewardInfo = findStation(rewardsInfo, rewardID[0]);

          myApp.addNotification({
            title: '成大藏奇圖',
            message: '您已獲得收藏品:  「' + rewardInfo.name + '」',
            media: '<img width="44" height="44" style="border-radius:100%" src="' + rewardInfo.image_url + '">',
            hold: 8000,
            closeOnClick: true,
          });
        }
      }
    } else {
      console.log('fail');
      $$('#' + this.id).css('background', '#ff4d4d');
      $$('#' + this.id).append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">' +
        '<circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>' +
        '<line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>' +
        '<line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>' +
      '</svg>');
      $$('#endImg').attr('src', 'img/fail-board.png');

      setTimeout(function() {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append('<div class="end-board-message" style="position: relative;top: 54%;text-align:center;">' +
          '<img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;' +
          '<span style="font-size:9vw; font-weight:bold; vertical-align: middle;">' + money + '</span>' +
        '</div>');
      }, 1200);
    }
  });
}

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
