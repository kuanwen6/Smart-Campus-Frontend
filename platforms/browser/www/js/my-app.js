// Initialize your app
const myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  swipeBackPage: false,
});

// Export selectors engine
const $$ = Dom7;

// Add view
const mainView = myApp.addView('.view-main', {
  // Because we use fixed-through navbar we can enable dynamic navbar
  dynamicNavbar: true,
});

// Callbacks to run specific code for specific pages, for example for About page:
$$(document).on('page:init', (e) => {
  // Page Data contains all required information about loaded and initialized page 
  const page = e.detail.page;
  console.log(page);
});

mainView.hideToolbar();

const mySwiper = myApp.swiper('.swiper-container', {
  pagination: '.swiper-pagination',
});

const welcomescreenSlides = [{
    id: 'slide0',
    picture: '<img src="../img/welcome_page1.png">',
  },
  {
    id: 'slide1',
    title: 'Slide 1', // optional
    picture: '<div class="tutorialicon">✲</div>',
    text: 'This is slide 2',
  },
  {
    id: 'slide2',
    title: 'Slide 2', // optional
    picture: '<div class="tutorialicon">♫</div>',
    text: 'This is slide 3',
  },
  {
    id: 'slide3',
    picture: '<div class="tutorialicon">☆</div>',
    text: 'Thanks for reading! .<br><br><a class="welcome-close-btn" href="#">End Tutorial</a>',
  },
];
const HOOKURL = 'https://smartcampus.csie.ncku.edu.tw/';

// experience per level
const EXP_PER_LEVEL = 50;

$$(document).on('deviceready', () => {
  console.log('Device is ready!');

  var applaunchCount = window.localStorage.getItem('launchCount');
  if (!applaunchCount) {
    window.localStorage.setItem('launchCount', 1);
    window.localStorage.setItem('nickname', 'Guest');
    window.localStorage.setItem('experience_point', 0);
    window.localStorage.setItem('rewards', '[]');
    window.localStorage.setItem('favorite_stations', '[]');
    window.localStorage.setItem('coins', 0);
    const welcomescreen = myApp.welcomescreen(welcomescreenSlides, { closeButton: true, });
    $$(document).on('click', '.welcome-close-btn', () => {
      welcomescreen.close();
    });
  } else {
    console.log('App has launched ' + ++localStorage.launchCount + ' times.');
  }

  if (window.localStorage.getItem('logged_in')) {
    $$('#login-form').hide();
    $$('#register-btn').hide();
    $$('.profile_pic').removeClass('hide');
    $$('.nickname').removeClass('hide');
  }

  $$.get(
    url = HOOKURL + 'smart_campus/get_all_rewards/',
    success = function(data) {
      console.log('get rewards info success');
      window.localStorage.setItem('all_rewards_info', data);
    },
    error = function(data) {
      console.log('get rewards info fail');
      console.log(data);
    }
  )

});


$$('.login-form-to-json').on('click', () => {
  const formData = myApp.formToJSON('#login-form');
  console.log(formData);

  $$.post(
    url = HOOKURL + 'smart_campus/login/',
    data = {
      'email': formData['email'],
      'password': formData['password']
    },
    success = function(data) {
      console.log('login success');
      $$('#login-form').hide();
      $$('#register-btn').hide();
      $$('.profile_pic').removeClass('hide');
      $$('.nickname').removeClass('hide');

      data = JSON.parse(data);
      console.log(data);
      window.localStorage.setItem('logged_in', true);
      window.localStorage.setItem('email', formData['email']);
      window.localStorage.setItem('experience_point', data['data']['experience_point']);
      window.localStorage.setItem('nickname', data['data']['nickname']);
      window.localStorage.setItem('coins', data['data']['coins']);
      window.localStorage.setItem('rewards', JSON.stringify(data['data']['rewards']));
      window.localStorage.setItem('favorite_stations', JSON.stringify(data['data']['favorite_stations']));
    },
    error = function(data) {
      console.log('login fail');
      console.log(data);
      myApp.alert('', '登入失敗，請重新輸入');
    }
  );
});

$$('.register-form-to-json').on('click', () => {
  const formData = myApp.formToJSON('#register-form');
  console.log(formData);

  $$.post(
    url = HOOKURL + 'smart_campus/signup/',
    data = {
      'email': formData['email'],
      'password': formData['password'],
      'nickname': formData['nickname']
    },
    success = function(data) {
      console.log('register success');
      myApp.alert('嗨! ' + formData['nickname'], '註冊成功!', function() {
        myApp.closeModal();
      });
    },
    error = function(data) {
      console.log('register fail');
      console.log(data);
      myApp.alert(data['responseText'], '註冊失敗');
    }
  );
});

var monuments = [
  ['Confucius Temple', 22.998279, 120.214809],
  ['Chikan House', 22.998299, 120.216794],
];

var arts = [
  ['Flutter', 22.998171, 120.216955],
  ['Thinker', 23.000831, 120.215108],
];

var landscapes = [
  ['Yung Park', 22.999003, 120.215434],
  ['Lake', 22.99768339, 120.2157563],
];

var administrativeUnit = [
  ['Post Office', 22.998166, 120.214360],
  ['Cool', 22.998640, 120.217943],
];

myApp.onPageInit('map', (page) => {

  $$('.open-filter').on('click', () => {
    $$('#map_filter').css('display', 'block');
  });

  $$(window).on('click', (event) => {
    if (event.target === $$('#map_filter')[0]) {
      $$('#map_filter').css('display', 'none');
    }
  });

  $$('.filter_table div').on('click', (e) => {
    $$(e.currentTarget).children('span').toggleClass('filter_added');
    setGroupMarkerVisible(e.currentTarget.id);
  });


  var Latitude = undefined;
  var Longitude = undefined;
  var Accuracy = undefined;
  var image = {
    url: './icon/mobileimgs2.png',
    size: new google.maps.Size(22, 22),
    origin: new google.maps.Point(0, 18),
    anchor: new google.maps.Point(11, 11)
  };
  var locationMarker = new google.maps.Marker({
    clickable: false,
    icon: image,
    shadow: null,
    zIndex: 999,
  });
  var locationCircle = new google.maps.Circle({
    fillColor: '#61a0bf',
    fillOpacity: 0.4,
    strokeColor: '#1bb6ff',
    strokeOpacity: 0.4,
    strokeWeight: 1,
  });
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: { lat: 23, lng: 120.22 },
    disableDefaultUI: true,
    clickableIcons: false,
  });


  var markers = [monuments, arts, landscapes, administrativeUnit];
  setMarkers(map);

  locationMarker.setMap(map);
  locationCircle.setMap(map);

  map.addListener('click', hideMarkerInfo);
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
    }],
  };

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true, });
  directionsDisplay.setMap(map);

  function calculateAndDisplayRoute(directionsService, directionsDisplay, origin) {
    var waypts = [];
    var totalDistance = 0;
    var totalDuration = 0;

    for (const markerGroup of markers) {
      for (const marker of markerGroup) {
        waypts.push({ location: { lat: marker[1], lng: marker[2] } });
      }
    }

    directionsService.route({
      origin: origin,
      destination: origin,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status === 'OK') {
        response.routes[0].legs = response.routes[0].legs.slice(0, -1);
        directionsDisplay.setDirections(response);
        console.log(response);
        for (const leg of response.routes[0].legs) {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        }
        console.log(totalDistance + ' m, ' + totalDuration + ' s');
      } else
        window.alert('Directions request failed due to ' + status);
    });
  }

  function setMarkers(map) {
    var icon = ['img/markers/marker_red.png', 'img/markers/marker_orange.png', 'img/markers/marker_green.png', 'img/markers/marker_blue.png'];

    for (var i = 0; i < markers.length; i++) {
      for (var j = 0; j < markers[i].length; j++) {
        var dot = markers[i][j];
        var marker = new google.maps.Marker({
          position: { lat: dot[1], lng: dot[2] },
          title: dot[0],
          map: map,
          icon: {
            url: icon[i],
            scaledSize: new google.maps.Size(25, 36),
            anchor: new google.maps.Point(12.5, 36),
          },
        });

        marker.addListener('click', showMarkerInfo);
        dot.push(marker);
      }
    }
  }

  function showMarkerInfo() {
    $$('.marker_info').css('display', 'block');
  }

  function hideMarkerInfo() {
    $$('.marker_info').css('display', 'none');
  }

  function setGroupMarkerVisible(groupId) {
    for (var i = 0; i < markers[groupId].length; i++) {
      markers[groupId][i][3].setVisible(!markers[groupId][i][3].visible);
    }
  }

  function getMap(latitude, longitude, accuracy) {
    locationMarker.setPosition({ lat: latitude, lng: longitude });
    locationCircle.setCenter({ lat: latitude, lng: longitude });
    locationCircle.setRadius(accuracy);

    console.log('added marker!');
    //myApp.alert('lat:' + latitude + '\nlng:' + longitude + '\nacc:' + accuracy);
  }

  var onMapWatchSuccess = function(position) {

    if (!onMapWatchSuccess.first) {
      calculateAndDisplayRoute(directionsService, directionsDisplay, { lat: position.coords.latitude, lng: position.coords.longitude });
    }
    onMapWatchSuccess.first = true;

    var updatedLatitude = position.coords.latitude;
    var updatedLongitude = position.coords.longitude;
    var updatedAccuracy = position.coords.accuracy;

    if (updatedLatitude !== Latitude || updatedLongitude !== Longitude || updatedAccuracy !== Accuracy) {

      Latitude = updatedLatitude;
      Longitude = updatedLongitude;
      Accuracy = updatedAccuracy;

      getMap(updatedLatitude, updatedLongitude, updatedAccuracy);
    }
  };

  function onMapError(error) {
    console.log('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }

  navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
  calculateAndDisplayRoute(directionsService, directionsDisplay, { lat: 22.995267, lng: 120.220237 });
});


myApp.onPageInit('info', (page) => {
  var level = Math.floor(parseInt(window.localStorage.getItem('experience_point')) / 10);
  $$('#level').html(level);
  $$('#coin').html(window.localStorage.getItem('coins'));
  $$('.nickname>p').html(window.localStorage.getItem('nickname'));
  for (var i = 0; i < 16; i++) {
    $$('.collections').append('<div></div>');
  }

  if (window.localStorage.getItem('rewards')) {
    rewards = JSON.parse(window.localStorage.getItem('rewards'));
    all_rewards_info = JSON.parse(window.localStorage.getItem('all_rewards_info'));
    for (var i = 0; i < rewards.length; i++) {
      reward_img = all_rewards_info['data'].find(x => x.id === rewards[i]).image_url;
      $$('.collections > div').eq(i).append('<img src="' + reward_img + '"/>');
    }
  }
});


/*             wen                */
function distance(lat1, lng1, lat2, lng2) {
  if (lat1 === -1 && lng1 === -1) {
    return '未開啟GPS';
  }

  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lng1 - lng2;
  const radtheta = Math.PI * theta / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist *= 69.09;
  dist *= 1.609344;

  if (dist < 1) {
    dist *= 1000;
    return `${dist.toFixed(0)} 公尺`;
  }
  return `${dist.toFixed(1)} 公里`;
}


function createCards(data, callback) {
  for (let i = 0; i < data.length; i += 1) {
    let description = data[i].description;
    if (data[i].description.length > 12) {
      description = `${description.substring(0, 12)}...`;
    }

    $$('.big-card').append(`<div class="card" id="${data[i].id}">
                    <div href="#" class="card-content" style="height:15vh;">
                        <div class="row no-gutter">\
                            <div class="col-35"><img src="${data[i].image}" style="width:20vh;height:15vh;object-fit: cover;"></div>
                            <div class="col-60" style="padding:8px;">
                                <div class="card-title"><span>${data[i].name}</span></div>
                                <br>
                                <div class="row">
                                    <div class="col-35"></div>
                                    <div class="col-60"><span>${description}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer"><span>預估時間: 10 分鐘</span></div>
                </div>`);
  }

  callback();
}

function createFavoriteCards(favorite, lat, lng, callback) {
  let distanceBetween;
  for (let i = 0; i < favorite.length; i += 1) {
    distanceBetween = distance(lat, lng, favorite[i].location[1], favorite[i].location[0]);

    $$('*[data-page="customRoute"] .swipe-list').append(`<li class="swipeout" id="${favorite[i].id}" style="z-index:100;">
                <div class="card swipeout-content">
                    <div href="#" class="card-content" style="height:18vh;">
                        <div class="row no-gutter">
                            <img class="delete-route" id="${favorite[i].id}" src="img/error.png" style="height:18px; width:18px;position:absolute;right:5px; top:5px;">
                            <div class="col-50">
                              <img src="${favorite[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                              <i class="f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                            </div>
                            <div class="col-50" style="padding:8px;">
                                <div class="card-title"><span>${favorite[i].name}</span></div>
                                <div style="position:absolute; right:0; bottom:5px;">
                                  <span>${distanceBetween}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swipeout-actions-right">
                  <a href="#" class="swipeout-delete swipeout-overswipe" id="${favorite[i].id}">
                    <div>
                      <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">trash_fill</i>
                      <br>
                      <p style="font-size:13px;">確認刪除</p>
                    </div>
                  </a>
                </div>
              </li>`);
  }

  callback();
}

function createFavorite(favorite, lat, lng, callback) {
  let distanceBetween;
  for (let i = 0; i < favorite.length; i += 1) {
    distanceBetween = distance(lat, lng, favorite[i].location[1], favorite[i].location[0]);

    $$('.favorite-swipe-list').append(`<li class="swipeout swipeout-favorite-${favorite[i].id}" id="${favorite[i].id}" style="z-index:100;">
    <div class="card swipeout-content">
        <div href="#" class="card-content" style="height:18vh;">
            <div class="row no-gutter">
                <div class="col-50">
                  <img src="${favorite[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                  <i class="favorite-heart-${favorite[i].id} f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                </div>
                <div class="col-50" style="padding:8px;">
                    <div class="card-title"><span>${favorite[i].name}</span></div>
                    <div style="position:absolute; right:0; bottom:5px;">
                        <span>${distanceBetween}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="swipeout-actions-right">
      <a href="#" class="remove-favorite swipeout-overswipe" id="${favorite[i].id}">
        <div>
          <i class="favorite-heart-${favorite[i].id} f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
          <br>
          <p style="font-size:13px;">移出最愛</p>
        </div>
      </a>
    </div>
  </li>`);
  }

  callback();
}

function createSites(sites, favorite, lat, lng, callback) {
  let category;
  let distanceBetween;
  for (let i = 0; i < sites.length; i += 1) {
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

    if ($.inArray(sites[i].id, favorite) === -1) {
      $$(`.${category}-list`).append(`<li class="swipeout swipeout-${sites[i].id}" id="${sites[i].id}" style="z-index:100;">
      <div class="card swipeout-content">
          <div href="#" class="card-content" style="height:18vh;">
              <div class="row no-gutter">
                  <div class="col-50">
                    <img src="${sites[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                    <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                  </div>
                  <div class="col-50" style="padding:8px;">
                      <div class="card-title"><span>${sites[i].name}</span></div>
                      <div style="position:absolute; right:0; bottom:5px;">
                          <span>${distanceBetween}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="swipeout-actions-right">
        <a href="#" class="add-favorite swipeout-overswipe" id="${sites[i].id}">
          <div>
            <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
            <br>
            <p style="font-size:13px;">加入最愛</p>
          </div>
        </a>
      </div>
    </li>`);

      //  take apart of this two class is because of the swipeoutClose(), this function can only operate 'a' element at the same time
      $$('.search-all-list').append(`<li class="swipeout swipeout-search-${sites[i].id}" id="${sites[i].id}">
    <div class="card swipeout-content">
        <div href="#" class="card-content" style="height:18vh;">
            <div class="row no-gutter">
                <div class="col-50">
                  <img src="${sites[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                  <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                </div>
                <div class="col-50" style="padding:8px;">
                    <div class="card-title"><span>${sites[i].name}</span></div>
                    <div style="position:absolute; right:0; bottom:5px;">
                        <span>10 公尺</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="swipeout-actions-right">
      <a href="#" class="add-favorite swipeout-overswipe" id="${sites[i].id}">
        <div>
          <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
          <br>
          <p style="font-size:13px;">加入最愛</p>
        </div>
      </a>
    </div>
  </li>`);
    } else {
      $$(`.${category}-list`).append(`<li class="swipeout swipeout-${sites[i].id}" id="${sites[i].id}" style="z-index:100;">
      <div class="card swipeout-content">
          <div href="#" class="card-content" style="height:18vh;">
              <div class="row no-gutter">
                  <div class="col-50">
                    <img src="${sites[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                    <i class="favorite-heart-${sites[i].id} f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                  </div>
                  <div class="col-50" style="padding:8px;">
                      <div class="card-title"><span>${sites[i].name}</span></div>
                      <div style="position:absolute; right:0; bottom:5px;">
                          <span>${distanceBetween}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="swipeout-actions-right">
        <a href="#" class="remove-favorite swipeout-overswipe" id="${sites[i].id}">
          <div>
            <i class="favorite-heart-${sites[i].id} f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
            <br>
            <p style="font-size:13px;">移出最愛</p>
          </div>
        </a>
      </div>
    </li>`);

      //  take apart of this two class is because of the swipeoutClose(), this function can only operate 'a' element at the same time
      $$('.search-all-list').append(`<li class="swipeout swipeout-search-${sites[i].id}" id="${sites[i].id}">
    <div class="card swipeout-content">
        <div href="#" class="card-content" style="height:18vh;">
            <div class="row no-gutter">
                <div class="col-50">
                  <img src="${sites[i].image.primary}" style="width:28vh;height:18vh;object-fit: cover;">
                  <i class="favorite-heart-${sites[i].id} f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                </div>
                <div class="col-50" style="padding:8px;">
                    <div class="card-title"><span>${sites[i].name}</span></div>
                    <div style="position:absolute; right:0; bottom:5px;">
                        <span>10 公尺</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="swipeout-actions-right">
      <a href="#" class="remove-favorite swipeout-overswipe" id="${sites[i].id}">
        <div>
          <i class="favorite-heart-${sites[i].id} f7-icons color-red" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
          <br>
          <p style="font-size:13px;">移出最愛</p>
        </div>
      </a>
    </div>
  </li>`);
    }
  }

  callback();
}

function findRoute(routes, id) {
  for (let i = 0; i < routes.length; i += 1) {
    if (routes[i].id === parseInt(id, 10)) {
      return routes[i];
    }
  }
}

function findSequence(stations, sequence) {
  let result = [];

  for (let i = 0; i < sequence.length; i += 1) {
    result.push(stations.filter((entry) => { return entry.id === sequence[i]; })[0]);
  }

  return result;
}

function findStation(stations, id) {
  return stations.filter((entry) => { return entry.id === id; })[0];
}

function modifyMoney(money, change) {
  if (window.localStorage.getItem("logged_in") !== null) {
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

function experienceUp(experience_point) {
  if (window.localStorage.getItem("logged_in") !== null) {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/update_user_experience_point/',
      data = {
        'email': window.localStorage.getItem('email'),
        'experience_point': experience_point + 10,
      },
      success = function(data) {
        data = JSON.parse(data);
        window.localStorage.setItem('experience_point', data.data.experience_point);
      },
      error = function(data) {
        console.log("add fail");
      }
    );
  } else {
    window.localStorage.setItem('experience_point', experience_point + 10);
  }
  return experience_point + 10;
}

function isFavorite(id) {
  if ($.inArray(id, JSON.parse(window.localStorage.getItem('favorite_stations'))) === -1) {
    return false;
  }
  return true;
}

function addFavorite(favorite, id) {
  favorite.push(id);

  if (window.localStorage.getItem("logged_in") !== null) {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_user_favorite_stations/',
      data = {
        'email': window.localStorage.getItem('email'),
        'station_id': id,
      },
      success = function(data) {
        data = JSON.parse(data);
        console.log(data);
        window.localStorage.setItem('favorite_stations', JSON.stringify(data.stations));
      },
      error = function(data) {
        console.log("add fail");
      }
    );
    return favorite;
  } else {
    window.localStorage.setItem('favorite_stations', JSON.stringify(favorite));
    return favorite;
  }
}

function removeFavorite(favorite, id) {
  const index = favorite.indexOf(id);
  if (index > -1) {
    favorite.splice(index, 1);
  }

  if (window.localStorage.getItem("logged_in") !== null) {
    $$.post(
      url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/remove_user_favorite_stations/',
      data = {
        'email': window.localStorage.getItem('email'),
        'station_id': id,
      },
      success = function(data) {
        data = JSON.parse(data);
        console.log(data);
        window.localStorage.setItem('favorite_stations', JSON.stringify(data.stations));
      },
      error = function(data) {
        console.log("add fail");
      }
    );
    return favorite;
  } else {
    window.localStorage.setItem('favorite_stations', JSON.stringify(favorite));
    return favorite;
  }
}

function itemDetailRemove(favorite, id) {
  $$('.detailHeart').removeClass('color-red').addClass('color-white');

  $$(`.favorite-heart-${id}`).removeClass('color-red').addClass('color-white');
  $(`#${id}.remove-favorite`).removeClass('remove-favorite').addClass('add-favorite');
  myApp.swipeoutClose($$(`li.swipeout-${id}`));
  myApp.swipeoutClose($$(`li.swipeout-search-${id}`));
  $(`#${id}.swipeout-overswipe`).children('div').children('p').html('加入最愛');

  favorite = removeFavorite(favorite, id);

  $$('.detailHeart').attr("onclick",`itemDetailAdd([${favorite}],${id})`);
}

function itemDetailAdd(favorite, id) {
  $$('.detailHeart').removeClass('color-white').addClass('color-red');

  $$(`.favorite-heart-${id}`).removeClass('color-white').addClass('color-red');
  $(`#${id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
  myApp.swipeoutClose($$(`li.swipeout-${id}`));
  myApp.swipeoutClose($$(`li.swipeout-search-${id}`));
  $(`#${id}.swipeout-overswipe`).children('div').children('p').html('移出最愛');

  favorite = addFavorite(favorite, id);

  $$('.detailHeart').attr("onclick",`itemDetailRemove([${favorite}],${id})`);
}

function moneySelect() {
  $$('#money-select-modal').css('display', 'block');
}

myApp.onPageInit('route', () => {
  mainView.hideToolbar();
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: 'index.html', force: true });
  });
});

myApp.onPageInit('themeRoute', () => {
  $$.ajax({
    url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (stations) => {
      const stationsObj = JSON.parse(stations).data;

      $$.ajax({
        url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_travel_plans',
        type: 'get',
        success: (plans) => {
          const plansObj = JSON.parse(plans).data;

          function cardOnclick() {
            $$('.card').on('click', function() { // if change to () => { ,it will go wrong!
              const route = findRoute(plansObj, this.id);
              const itemList = findSequence(stationsObj, route.station_sequence);

              mainView.router.load({
                url: 'routeDetail.html',
                context: {
                  title: route.name,
                  time: '10',
                  previous: 'themeRoute.html',
                  introduction: route.description,
                  img: route.image,
                  itemList,
                },
              });
            });
          }

          createCards(plansObj, cardOnclick);
        },
        error: (data) => {
          console.log(data);
        },
      });
    },
    error: (data) => {
      console.log(data);
    },
  });
});

myApp.onPageInit('themeSite', () => {
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: 'index.html', force: true });
  });

  $$.ajax({
    url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (data) => {
      const stations = JSON.parse(data).data;
      let favoriteSequence = JSON.parse(window.localStorage.getItem('favorite_stations'));

      //  because haved to wait for appened fininshed
      function onclickFunc() {
        $$('*[data-page="themeSite"] li.swipeout').on('click', function () {
          const site = findStation(stations, parseInt(this.id, 10));
          console.log(this);
          mainView.router.load({
            url: 'itemDetail.html',
            context: {
              site,
              favoriteSequence,
              previous: 'themeSite.html',
              favorite: isFavorite(parseInt(this.id, 10)),
            },
          });
        });

        $$('*[data-page="themeSite"] .swipeout').on('swipeout:closed', () => {
          $$('*[data-page="themeSite"] li.swipeout').on('click', function () {
            const site = findStation(stations, parseInt(this.id, 10));
            console.log(site);
            mainView.router.load({
              url: 'itemDetail.html',
              context: {
                site,
                favoriteSequence,
                previous: 'themeSite.html',
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
            
            favoriteSequence = addFavorite(favoriteSequence ,parseInt(this.id, 10));
            console.log(favoriteSequence);

            $$(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
            $(`#${this.id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
            myApp.swipeoutClose($$(`li.swipeout-${this.id}`));
            myApp.swipeoutClose($$(`li.swipeout-search-${this.id}`));
            $$(this).children('div').children('p').html('移出最愛');
          } else {
            // remove this.id to favorite
            console.log('remove toggle');

            favoriteSequence = removeFavorite(favoriteSequence ,parseInt(this.id, 10));

            $$(`.favorite-heart-${this.id}`).removeClass('color-red').addClass('color-white');
            $(`#${this.id}.remove-favorite`).removeClass('remove-favorite').addClass('add-favorite');
            myApp.swipeoutClose($$(`li.swipeout-${this.id}`));
            myApp.swipeoutClose($$(`li.swipeout-search-${this.id}`));
            $$(this).children('div').children('p').html('加入最愛');
          }
        }

        $$('*[data-page="themeSite"] .swipeout-overswipe').on('click', favorites);
      }

      function onSuccess(position) {
        createSites(stations, favoriteSequence, position.coords.latitude, position.coords.longitude, onclickFunc);
      }

      function onError() {
        createSites(stations, favoriteSequence, -1, -1, onclickFunc);
      }
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
    error: (data) => {
      console.log(data);
    },
  });
});

myApp.onPageInit('routeDetail', () => {
  $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀<i class="f7-icons color-red toolbar-icon">navigation_fill</i></a></div>');
  myApp.accordionOpen($$('li#introduction'));
});

myApp.onPageInit('favorite', () => {
  mainView.hideToolbar();

  $$('.back-force').on('click', () => {
    mainView.router.back({ url: 'themeSite.html', force: true });
  });

  $$.ajax({
    url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (data) => {
      const stations = JSON.parse(data).data;
      let favoriteSequence = JSON.parse(window.localStorage.getItem('favorite_stations'));
      let itemList = findSequence(stations, favoriteSequence);

      $$('*[data-page="favorite"] li.swipeout').off('click');
      $$('*[data-page="favorite"] .swipeout-overswipe').off('click');

      //  because haved to wait for appened fininshed
      function onclickFunc() {
        $$('*[data-page="favorite"] li.swipeout').on('click', function () {
          const site = findStation(itemList, parseInt(this.id, 10));
          console.log(this);
          mainView.router.load({
            url: 'itemDetail.html',
            context: {
              site,
              favoriteSequence,
              previous: 'favorite.html',
              favorite: isFavorite(parseInt(this.id, 10)),
            },
          });
        });

        $$('*[data-page="favorite"] .swipeout').on('swipeout:closed', () => {
          $$('*[data-page="favorite"] li.swipeout').on('click', function () {
            const site = findStation(itemList, parseInt(this.id, 10));
            console.log(site);
            mainView.router.load({
              url: 'itemDetail.html',
              context: {
                site,
                favoriteSequence,
                previous: 'favorite.html',
                favorite: isFavorite(parseInt(this.id, 10)),
              },
            });
          });
        });
        
        function favorites() { // if change to () => { , it will go wrong!
          $$('*[data-page="favorite"] li.swipeout').off('click');
          if ($$(this).hasClass('add-favorite')) {
            console.log('add toggle');

            favoriteSequence = addFavorite(favoriteSequence ,parseInt(this.id, 10));

            $$(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
            $(`#${this.id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
            myApp.swipeoutClose($$(`li.swipeout-favorite-${this.id}`));
            $$(this).children('div').children('p').html('移出最愛');
          } else {
            console.log('remove toggle');

            favoriteSequence = removeFavorite(favoriteSequence ,parseInt(this.id, 10));

            $$(`.favorite-heart-${this.id}`).removeClass('color-red').addClass('color-white');
            $(`#${this.id}.remove-favorite`).removeClass('remove-favorite').addClass('add-favorite');
            myApp.swipeoutClose($$(`li.swipeout-favorite-${this.id}`));
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
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
    error: (data) => {
      console.log(data);
    },
  });
});

myApp.onPageInit('customRoute', () => {
  $$('.back-force').on('click', () => {
    mainView.router.back({ url: 'route.html', force: true });
  });

  $$.ajax({
    url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (data) => {
      const stations = JSON.parse(data).data;
      const favoriteSequence = JSON.parse(window.localStorage.getItem('favorite_stations'));
      let itemList = findSequence(stations, favoriteSequence);

      function deleteFunc() {
        $$('.delete-route').on('click', function() { // if change to () => { , it will go wrong!
          myApp.swipeoutOpen($(`li#${this.id}`));
          myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
          myApp.swipeoutDelete($(`li#${this.id}`));

          const index = favoriteSequence.indexOf(parseInt(this.id, 10));
          if (index > -1) {
            favoriteSequence.splice(index, 1);
          }
        });

        $$('*[data-page="customRoute"] .swipeout-overswipe').on('click', function () {
          console.log(this.id);
          const index = favoriteSequence.indexOf(parseInt(this.id, 10));
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
      navigator.geolocation.getCurrentPosition(onSuccess, onError);

      mainView.showToolbar(); 
      $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto; height:48px;">確定行程</a></div>');

      $$('.toolbar').off('click'); // avoid append multiple onclicked on toolbar
      $$('.toolbar').on('click', () => {
        if (favoriteSequence.length === 0) {
          myApp.alert('並沒有選擇任何站點喔!', '注意');
        } else {
          itemList = findSequence(stations, favoriteSequence);
          mainView.router.load({
            url: 'routeDetail.html',
            context: {
              title: '自訂行程',
              time: 'unknown',
              previous: 'customRoute.html',
              introduction: '自己想的好棒喔',
              img: itemList[0].image.primary,
              itemList,
            },
          });
        }
      });
    },
  });
});


myApp.onPageInit('routeDetail', () => {
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: this.id, force: true });
  });
});

myApp.onPageInit('itemDetail', (page) => {
//  detect if this station have question to answered
  if (localStorage.getItem("logged_in") !== null) {
    $$.ajax({
      url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
      type: 'get',
      data: {
        'email': window.localStorage.getItem('email'),
        'station_id': page.context.site.id,
      },
      success: (data) => {
        const questionData = JSON.parse(data);
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
  }


  $$('.custom-money-content').on('click', (e) => {
    const pHeight = $$('.custom-money-content').height();
    const pOffset = $$('.custom-money-content').offset();
    const y = e.pageY - pOffset.top;
    console.log(pHeight);
    console.log(y);
    let money = parseInt(window.localStorage.getItem('coins'),10);

    if (y > pHeight * 0.5 && y <= pHeight) {
      console.log('200');
      mainView.router.load({
        url: 'gamePage.html',
        context: {
          id: page.context.site.id,
          gain: 200,
        },
      });
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
            gain: 1000,
          },
        });
      }
    }
    $$('#money-select-modal').css('display', 'none');
    mainView.hideToolbar();
    $$('.page-content').css('padding-bottom', 0);
  });
});

function answerQuestion(question, options, answer, question_id, gain) {
  let money = parseInt(window.localStorage.getItem('coins'),10);
  let experience_point = parseInt(window.localStorage.getItem('experience_point'),10);

  $$('#questionTextArea').html(question);
  for (let i = 0; i < 4; i += 1) {
    $$(`#answer${i+1}`).html(options[i]);
  }

  console.log('money ' + money);
  console.log('experience_point ' + experience_point);
  console.log('progress '+ (experience_point % EXP_PER_LEVEL) * 2)

  $$('.money_reward').html(gain);
  myApp.setProgressbar($$('#level-progress'), (experience_point % EXP_PER_LEVEL) * 2);

  $$('.answer').on('click', function answerClicked() {
    $$('.answer').off('click', answerClicked); // lock the button

    if (this.id === 'answer' + answer.toString()) {
      money = modifyMoney(money, gain);
      experience_point = experienceUp(experience_point);
      myApp.setProgressbar($$('#level-progress'), (experience_point % EXP_PER_LEVEL) * 2, 1300);

      $$(`#${this.id}`).css('background', '#40bf79');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
        <polyline class="path check" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
      </svg>`);
      $$('#endImg').attr('src', 'img/success-board.png');
      setTimeout(() => {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append(`<div class="end-board-message" style="position: relative;top: calc(53% - 22px);text-align:center;">
          <span style="font-size:6vw;font-weight:bold;">等級${Math.floor(experience_point / EXP_PER_LEVEL + 1)}</span><br><br>
          <img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;
          <span style="font-size:9vw; font-weight:bold; vertical-align: middle;">${money}</span>
        </div>`);
      }, 1200);

      if (window.localStorage.getItem('logged_in') !== null) {
        $$.post(
          url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_answered_question/',
          data = {
            'question_id': question_id,
            'email':  window.localStorage.getItem('email'),
          },
          success = function(data) {
            console.log('add answered success');
          },
        );
      }   
      
    } else {
      console.log('fail');
      $$(`#${this.id}`).css('background', '#ff4d4d');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
        <line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>
        <line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>
      </svg>`);
      $$('#endImg').attr('src', 'img/fail-board.png');

      setTimeout(() => {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append(`<div class="end-board-message" style="position: relative;top: 54%;text-align:center;">
          <img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;
          <span style="font-size:9vw; font-weight:bold; vertical-align: middle;">${money}</span>
        </div>`);
      }, 1200);
    }
  });
}

myApp.onPageInit('gamePage', (page) => {
  setTimeout(() => {
    $$('#gameStart-modal').css('display', 'none');
  }, 5000);

  $$('#endImg').on('click', (e) => {
    const pHeight = $$('#endImg').height();
    const pOffset = $$('#endImg').offset();
    const y = e.pageY - pOffset.top;
    console.log('Y: ' + e.pageY);
    console.log('Off: ' + pOffset.top);
    console.log('H: ' + pHeight);

    if (y > pHeight * 0.78 && y <= pHeight) {
      mainView.router.back();
    }
  });

  if (localStorage.getItem("logged_in") !== null) {
    $$.ajax({
      url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
      type: 'get',
      data: {
        'email': window.localStorage.getItem('email'),
        'station_id': page.context.id,
      },
      success: (data) => {
        const questionData = JSON.parse(data);
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain);
      },
      error: (data) => {
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
      success: (data) => {
        const questionData = JSON.parse(data);
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain);
      },
      error: (data) => {
        console.log("get question error");
      }
    });
  }
});
