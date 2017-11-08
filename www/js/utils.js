function userDataInit() {
  window.localStorage.setItem('loggedIn', false);
  window.localStorage.setItem('launchCount', true);
  window.localStorage.setItem('nickname', 'Guest');
  window.localStorage.setItem('experiencePoint', 0);
  window.localStorage.setItem('rewards', '[]');
  window.localStorage.setItem('favoriteStations', '[]');
  window.localStorage.setItem('coins', 0);
}


function calculateAndDisplayRoute(origin, waypts) {
  var display = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  /* Choose the destination in waypts*/
  var max_distance = 0;
  var max_distance_index;
  waypts.forEach(function(point, index) {
    var _distance = distance(point['location']['lat'], point['location']['lng'], origin['lat'], origin['lng'], 1);
    if (_distance > max_distance) {
      max_distance = _distance;
      max_distance_index = index;
    }
  });
  var destination = waypts.splice(max_distance_index, 1)[0];

  directionsService.route({
    origin: origin,
    destination: destination,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'WALKING'
  }, function(response, status) {
    if (status === 'OK') {
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

function distance(lat1, lng1, lat2, lng2, type = 0) {
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

  if (type === 0) {
    if (dist < 1) {
      dist *= 1000;
      return dist.toFixed(0) + '公尺';
    }
    return dist.toFixed(1) + '公里';
  } else {
    return dist;
  }
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
    if (data[i].description.length > 10) {
      description = description.substring(0, 10) + '....';
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
                '<div href="#" class="card-content" style="height:28.5vw;">' +
                    '<div class="row no-gutter">' +
                        '<div class="col-40"><img src="' + currentData.image + '" class="lazy lazy-fadeIn" style="width:38vw;height:28.5vw;object-fit: cover;"></div>' +
                        '<div class="col-60" style="padding:8px; height:28.5vw; position:relative;">' +
                            '<div class="card-title"><span>' + currentData.name + '</span></div>' +
                            '<br>' +
                            '<div class="row" style="position:absolute; bottom:5px; right:5px;">' +
                                '<div class="col-35"></div>' +
                                '<div class="col-60" style="width:30vw;"><span>' + des + '</span></div>' +
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
                '<div href="#" class="card-content" style="height:28.5vw;">' +
                    '<div class="row no-gutter">' +
                        '<div class="col-40"><img src="' + currentData.image + '" class="lazy lazy-fadeIn" style="width:38vw;height:28.5vw;object-fit: cover;"></div>' +
                        '<div class="col-60" style="padding:8px; height:28.5vw; position:relative;">' +
                            '<div class="card-title"><span>' + currentData.name + '</span></div>' +
                            '<br>' +
                            '<div class="row" style="position:absolute; bottom:5px; right:5px;">' +
                                '<div class="col-35"></div>' +
                                '<div class="col-60" style="width:30vw;"><span>' + des + '</span></div>' +
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
                      '<div href="#" class="card-content" style="height:32vw;">' +
                          '<div class="row no-gutter">' +
                              '<img class="delete-route" id="' + currentFavorite.id + '" src="img/error.png" style="height:18px; width:18px;position:absolute;right:5px; top:5px;">' +
                              '<div class="col-50">' +
                                '<img src="' + currentFavorite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                                '<i class="f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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
          '<div href="#" class="card-content" style="height:32vw;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentFavorite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentFavorite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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
          '<div href="#" class="card-content" style="height:32vw;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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
          '<div href="#" class="card-content" style="height:32vw;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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
          '<div href="#" class="card-content" style="height:32vw;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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
          '<div href="#" class="card-content" style="height:32vw;">' +
              '<div class="row no-gutter">' +
                  '<div class="col-50">' +
                    '<img src="' + currentSite.image.primary + '" class="lazy lazy-fadeIn" style="width:50vw;height:32vw;object-fit: cover;">' +
                    '<i class="favorite-heart-' + currentSite.id + ' f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:43vw; text-shadow: 0px 0px 8px white;">heart_fill</i>' +
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

function backChoice(previous) {
    if (previous === 'themeRoute.html') {
      mainView.hideToolbar();
      mainView.router.back();
    } else {
      mainView.router.back({ url: 'customRoute.html', force: true, ignoreCache: true });
    }
}

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
              title: '成大校園導覽',
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