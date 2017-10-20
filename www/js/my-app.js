let directionsService;
let directionsDisplay;

mainView.hideToolbar();

$$(document).on('page:init', (e) => {
  const page = e.detail.page;
  console.log(page);
});

$$(document).on('deviceready', () => {
  console.log('Device is ready!');

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

  const applaunchCount = window.localStorage.getItem('launchCount');
  if (!applaunchCount) {
    window.localStorage.setItem('launchCount', true);
    window.localStorage.setItem('nickname', 'Guest');
    window.localStorage.setItem('experiencePoint', 0);
    window.localStorage.setItem('rewards', '[]');
    window.localStorage.setItem('favoriteStations', '[]');
    window.localStorage.setItem('coins', 0);
    const welcomescreen = myApp.welcomescreen(
      welcomescreenSlides, {
        closeButton: false,
        onClosed: function() {
          //iBeacon Setup
          beacon_util.init_beacon_detection();
          beacon_util.startScanForBeacons();
        },
      }
    );
    $$(document).on('click', '#welcome-close-btn', () => {
      welcomescreen.close();
    });
  } else {
    console.log(`App has launched: ${window.localStorage.launchCount}`);
    //iBeacon Setup
    beacon_util.init_beacon_detection();
    beacon_util.startScanForBeacons();
  }

  $$.get(
    url = `${HOOKURL}smart_campus/get_all_rewards/`,
    success = function(data) {
      console.log('get rewards info success');
      window.sessionStorage.setItem('allRewardsInfo', JSON.stringify(JSON.parse(data).data));
    },
    error = function(data) {
      console.log('get rewards info fail');
      console.log(data);
    }
  )
  $$.get(
    url = `${HOOKURL}smart_campus/get_all_stations/`,
    success = function(data) {
      console.log('get stations info success');
      window.sessionStorage.setItem('allStationsInfo', JSON.stringify(JSON.parse(data).data));
    },
    error = function(data) {
      console.log('get stations info fail');
      console.log(data);
    }
  )
});

myApp.onPageInit('index', function(page) {
  $$('.login-form-to-json').on('click', () => {
    const formData = myApp.formToJSON('#login-form');
    console.log(formData);

    $$.post(
      url = `${HOOKURL}smart_campus/login/`,
      data = {
        'email': formData['email'],
        'password': formData['password'],
      },
      success = function(data) {
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
        loginInit();
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
      url = `${HOOKURL}smart_campus/signup/`,
      data = {
        'email': formData['email'],
        'password': formData['password'],
        'nickname': formData['nickname'],
      },
      success = function(data) {
        console.log('register success');
        myApp.alert(`嗨! ${formData['nickname']}`, '註冊成功!', function() {
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

  if (window.localStorage.getItem('loggedIn')) {
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

myApp.onPageInit('map', (page) => {
  $$('.open-filter').on('click', () => {
    $$('#map-filter').css('display', 'block');
  });

  $$(window).on('click', (event) => {
    if (event.target === $$('#map-filter')[0]) {
      $$('#map-filter').css('display', 'none');
    }
  });

  $$('.filter-table div').on('click', (e) => {
    $$(e.currentTarget).children('span').toggleClass('filter-added');
    setGroupMarkerVisible(e.currentTarget.id);
  });

  $$('.marker-favorite').on('click', (e) => {
    let favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));
    $$(e.currentTarget).toggleClass('color-red');

    if ($$(e.currentTarget).hasClass('color-red')) {
      favoriteSequence = addFavorite(favoriteSequence, parseInt(e.currentTarget.id));
    } else {
      favoriteSequence = removeFavorite(favoriteSequence, parseInt(e.currentTarget.id));
    }
  });

  let markers;
  let stations;
  let waypts = [];
  let Latitude = undefined;
  let Longitude = undefined;
  let Accuracy = undefined;
  const image = {
    url: './icon/mobileimgs2.png',
    size: new google.maps.Size(22, 22),
    origin: new google.maps.Point(0, 18),
    anchor: new google.maps.Point(11, 11),
  };
  const map = new google.maps.Map($$('#map')[0], {
    zoom: 16,
    center: { lat: 22.998089, lng: 120.217441 },
    disableDefaultUI: true,
    clickableIcons: false,
  });
  const locationMarker = new google.maps.Marker({
    clickable: false,
    icon: image,
    shadow: null,
    zIndex: 999,
    map: map,
  });
  const locationCircle = new google.maps.Circle({
    fillColor: '#61a0bf',
    fillOpacity: 0.4,
    strokeColor: '#1bb6ff',
    strokeOpacity: 0.4,
    strokeWeight: 1,
    map: map,
  });
  const walkingLineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1,
    scale: 3,
  };
  const walkingPathLine = {
    strokeColor: '#0eb7f6',
    strokeOpacity: 0,
    fillOpacity: 0,
    icons: [{
      icon: walkingLineSymbol,
      offset: '0',
      repeat: '10px',
    }],
  };

  map.addListener('click', hideMarkerInfo);
  directionOrMapOverview(page.context.isDirection);
  setMarkers(map);
  navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, { enableHighAccuracy: true });

  function directionOrMapOverview(isDirection) {
    if (isDirection) {
      console.log('Direction mode!');
      $$('#page-title').html('導覽中');
      $$('.open-filter').css('visibility', 'hidden');
      directionsDisplay.setMap(map);

      stations = page.context.stations;
      for (const station of stations) {
        waypts.push({ location: { lat: station['location'][1], lng: station['location'][0] } });
      }
    } else {
      console.log('Map overview mode!');
      $$('#bluetooth-warn').hide();
      stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
    }
  }

  function setMarkers(map) {
    const icon = {
      '古蹟': 'img/markers/marker_red.png',
      '藝文': 'img/markers/marker_orange.png',
      '景觀': 'img/markers/marker_green.png',
      '行政單位': 'img/markers/marker_blue.png',
    };
    const scaledSize = new google.maps.Size(25, 36);
    const anchor = new google.maps.Point(12.5, 36);
    markers = { '古蹟': [], '藝文': [], '景觀': [], '行政單位': [] };

    for (const station of stations) {
      const marker = new google.maps.Marker({
        position: { lat: station['location'][1], lng: station['location'][0] },
        title: station['name'],
        map: map,
        icon: {
          url: icon[station['category']],
          scaledSize: scaledSize,
          anchor: anchor,
        },
      });
      marker.addListener('click', showMarkerInfo);
      markers[station['category']].push(marker);
    }
  }

  function showMarkerInfo() {
    const station = stations.find(x => x.name === this.title);
    let _distance = '';
    if (Latitude !== undefined && Longitude !== undefined) {
      _distance = distance(Latitude, Longitude, station['location'][1], station['location'][0]);
    }

    $$('#marker-img').attr('src', station['image']['primary']);
    $$('#marker-category').html(`/ ${station['category']}主題 /`);
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
    const category = ['古蹟', '藝文', '景觀', '行政單位'];
    for (const marker of markers[category[groupId]]) {
      marker.setVisible(!marker.visible);
    }
  }

  function getMap(latitude, longitude, accuracy) {
    locationMarker.setPosition({ lat: latitude, lng: longitude });
    locationCircle.setCenter({ lat: latitude, lng: longitude });
    locationCircle.setRadius(accuracy);
  }

  function onMapWatchSuccess(position) {
    let updatedLatitude = position.coords.latitude;
    let updatedLongitude = position.coords.longitude;
    let updatedAccuracy = position.coords.accuracy;

    if (updatedLatitude !== Latitude || updatedLongitude !== Longitude || updatedAccuracy !== Accuracy) {
      Latitude = updatedLatitude;
      Longitude = updatedLongitude;
      Accuracy = updatedAccuracy;

      getMap(updatedLatitude, updatedLongitude, updatedAccuracy);
      if (page.context.isDirection) {
        calculateAndDisplayRoute({ lat: Latitude, lng: Longitude },
          waypts,
          display = true
        );
      }
    }
  };

  function onMapError(error) {
    console.log(`code: ${error.code}\nmessage: ${error.message}\n`);
    if (page.context.isDirection) {
      const origin = waypts.pop();
      myApp.alert('導覽無法進行定位', '未開啟GPS');
      calculateAndDisplayRoute({ lat: origin['location']['lat'], lng: origin['location']['lng'] },
        waypts,
        display = true
      );
    }
  }
});

myApp.onPageInit('info', (page) => {
  const level = Math.floor(parseInt(window.localStorage.getItem('experiencePoint')) / EXP_PER_LEVEL);
  $$('#level').html(level);
  $$('#coin').html(window.localStorage.getItem('coins'));
  $$('.nickname>p').html(window.localStorage.getItem('nickname'));
  for (let i = 0; i < 16; i++) {
    $$('.collections').append('<div></div>');
  }

  const rewards = JSON.parse(window.localStorage.getItem('rewards'));
  const allRewardsInfo = JSON.parse(window.sessionStorage.getItem('allRewardsInfo'));
  for (let i = 0; i < rewards.length; i++) {
    const rewardImg = allRewardsInfo.find(x => x.id === rewards[i])['image_url'];
    $$('.collections > div').eq(i).append(`<img src="${rewardImg}"/>`);
  }
});

function calculateAndDisplayRoute(origin, waypts, display = false, callback = null) {
  directionsService.route({
    origin: origin,
    destination: origin,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'WALKING',
  }, function(response, status) {
    if (status === 'OK') {
      response.routes[0].legs = response.routes[0].legs.slice(0, -1);
      console.log(response);
      if (display) {
        directionsDisplay.setDirections(response);
      } else {
        let totalDistance = 0;
        let totalDuration = 0;
        for (const leg of response.routes[0].legs) {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        }
        callback(totalDistance, totalDuration);
      }
    } else {
      console.log(`Directions request failed due to ${status}`);
    }
  });
}

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

function getLocationArray(idArray) {
  const returnValue = [];
  const stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  let site;

  for (let i = 0; i < idArray.length; i++) {
    site = findStation(stations, idArray[i]);
    returnValue.push({ location: { lat: site.location[1], lng: site.location[0] } });
  }

  return returnValue;
}

function createCards(data, onclickCallback) {
  for (let i = 0; i < data.length; i += 1) {
    let description = data[i].description;
    if (data[i].description.length > 12) {
      description = `${description.substring(0, 12)}...`;
    }
    const routeLocation = getLocationArray(data[i].station_sequence);
    console.log(routeLocation);

    if (routeLocation.length > 1) {
      calculateAndDisplayRoute(
        routeLocation[0].location,
        routeLocation.slice(1),
        display = false,
        callback = function(d, t) {
          $$('.big-card').append(`<div class="card" id="${data[i].id}">
              <div href="#" class="card-content" style="height:15vh;">
                  <div class="row no-gutter">\
                      <div class="col-35"><img src="${data[i].image}" class="lazy lazy-fadeIn" style="width:20vh;height:15vh;object-fit: cover;"></div>
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
              <div class="card-footer"><span>預估時間: ${(t/60).toFixed(0)} 分鐘</span></div>
          </div>`);
          onclickCallback();
        },
      );
    } else {
      $$('.big-card').append(`<div class="card" id="${data[i].id}">
          <div href="#" class="card-content" style="height:15vh;">
              <div class="row no-gutter">\
                  <div class="col-35"><img src="${data[i].image}" class="lazy lazy-fadeIn" style="width:20vh;height:15vh;object-fit: cover;"></div>
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
          <div class="card-footer"><span>預估時間: 0 分鐘</span></div>
      </div>`);
      onclickCallback();
    }
  }
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
                              <img src="${favorite[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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
                  <img src="${favorite[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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
  console.log("creating site");
  let category;
  let distanceBetween;
  console.log("creating site num" + sites.length);
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
                    <img src="${sites[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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
                  <img src="${sites[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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
                    <img src="${sites[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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
                  <img src="${sites[i].image.primary}" class="lazy lazy-fadeIn" style="width:28vh;height:18vh;object-fit: cover;">
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

function getRewards(rewards, rewardID) {
  rewards.push(rewardID);
  if (window.localStorage.getItem("loggedIn") !== null) {
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
  if (window.localStorage.getItem("loggedIn") !== null) {
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
  if (window.localStorage.getItem("loggedIn") !== null) {
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

  if (window.localStorage.getItem("loggedIn") !== null) {
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
  const index = favorite.indexOf(id);
  if (index > -1) {
    favorite.splice(index, 1);
  }

  if (window.localStorage.getItem("loggedIn") !== null) {
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

  $$(`.favorite-heart-${id}`).removeClass('color-red').addClass('color-white');
  $(`#${id}.remove-favorite`).removeClass('remove-favorite').addClass('add-favorite');
  myApp.swipeoutClose($$(`li.swipeout-${id}`));
  myApp.swipeoutClose($$(`li.swipeout-search-${id}`));
  $(`#${id}.swipeout-overswipe`).children('div').children('p').html('加入最愛');

  favorite = removeFavorite(favorite, id);

  $$('.detailHeart').attr("onclick", `itemDetailAdd(${favorite},${id})`);

}

function itemDetailAdd(favorite, id) {
  $$('.detailHeart').removeClass('color-white').addClass('color-red');

  $$(`.favorite-heart-${id}`).removeClass('color-white').addClass('color-red');
  $(`#${id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
  myApp.swipeoutClose($$(`li.swipeout-${id}`));
  myApp.swipeoutClose($$(`li.swipeout-search-${id}`));
  $(`#${id}.swipeout-overswipe`).children('div').children('p').html('移出最愛');

  favorite = addFavorite(favorite, id);

  $$('.detailHeart').attr("onclick", `itemDetailRemove(${favorite},${id})`);

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
  const stationsObj = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  $$.ajax({
    url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_travel_plans',
    type: 'get',
    success: (plans) => {
      const plansObj = JSON.parse(plans).data;

      function cardOnclick() {
        $$('img.lazy').trigger('lazy');
        $$('.card').on('click', function() { // if change to () => { ,it will go wrong!
          const route = findRoute(plansObj, this.id);
          const itemList = findSequence(stationsObj, route.station_sequence);
          const time = $$(this).children('.card-footer').find('span').html();

          mainView.router.load({
            url: 'routeDetail.html',
            context: {
              title: route.name,
              time,
              custom: false,
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
});

myApp.onPageInit('themeSite', () => {
  $$('.back-force').on('click', function() {
    mainView.router.back({ url: 'index.html', force: true });
  });

  const stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  let favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));

  //  because haved to wait for appened fininshed
  function onclickFunc() {
    $$('img.lazy').trigger('lazy');
    $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
      const site = findStation(stations, parseInt(this.id, 10));
      console.log(this);
      mainView.router.load({
        url: 'itemDetail.html',
        context: {
          site,
          isBeacon: false,
          favoriteSequence,
          favorite: isFavorite(parseInt(this.id, 10)),
        },
      });
    });

    $$('*[data-page="themeSite"] .swipeout').on('swipeout:closed', () => {
      $$('*[data-page="themeSite"] li.swipeout').on('click', function() {
        const site = findStation(stations, parseInt(this.id, 10));
        console.log(site);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
            site,
            isBeacon: false,
            favoriteSequence,
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

        $$(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
        $(`#${this.id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
        myApp.swipeoutClose($$(`li.swipeout-${this.id}`));
        myApp.swipeoutClose($$(`li.swipeout-search-${this.id}`));
        $$(this).children('div').children('p').html('移出最愛');
      } else {
        // remove this.id to favorite
        console.log('remove toggle');

        favoriteSequence = removeFavorite(favoriteSequence, parseInt(this.id, 10));

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
    console.log("themeSite onSuccess start")
    createSites(stations, favoriteSequence, position.coords.latitude, position.coords.longitude, onclickFunc);
    console.log("themeSite onSuccess finish");
  }

  function onError() {
    console.log("themeSite onSuccess start no loc")
    createSites(stations, favoriteSequence, -1, -1, onclickFunc);
    console.log("themeSite onSuccess finish no loc");
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000, enableHighAccuracy: true });
});

myApp.onPageInit('routeDetail', (page) => {
  $$('.toolbar').off('click');
  $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀<i class="f7-icons color-red toolbar-icon">navigation_fill</i></a></div>');
  if (!page.context.custom) {
    myApp.accordionOpen($$('li#introduction'));
  } else {
    myApp.accordionOpen($$('li#itemList'));
  }
  $$('.toolbar').on('click', () => {
    mainView.router.load({
      url: 'map.html',
      context: {
        isDirection: true,
        stations: page.context.itemList,
      },
    });
  });
});

myApp.onPageInit('favorite', () => {
  mainView.hideToolbar();

  $$('.back-force').on('click', () => {
    mainView.router.back({ url: 'themeSite.html', force: true });
  });

  const stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  let favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));

  if (favoriteSequence.length === 0) {
    myApp.alert('快去加入你所感興趣的站點吧!', '尚未有任何最愛站點', function() {
      mainView.router.back();
    });
  }

  let itemList = findSequence(stations, favoriteSequence);

  $$('*[data-page="favorite"] li.swipeout').off('click');
  $$('*[data-page="favorite"] .swipeout-overswipe').off('click');

  //  because haved to wait for appened fininshed
  function onclickFunc() {
    $$('img.lazy').trigger('lazy');
    $$('*[data-page="favorite"] li.swipeout').on('click', function() {
      const site = findStation(itemList, parseInt(this.id, 10));
      console.log(this);
      mainView.router.load({
        url: 'itemDetail.html',
        context: {
          site,
          isBeacon: false,
          favoriteSequence,
          favorite: isFavorite(parseInt(this.id, 10)),
        },
      });
    });

    $$('*[data-page="favorite"] .swipeout').on('swipeout:closed', () => {
      $$('*[data-page="favorite"] li.swipeout').on('click', function() {
        const site = findStation(itemList, parseInt(this.id, 10));
        console.log(site);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
            site,
            isBeacon: false,
            favoriteSequence,
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

        $$(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
        $(`#${this.id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
        myApp.swipeoutClose($$(`li.swipeout-favorite-${this.id}`));
        $$(this).children('div').children('p').html('移出最愛');
      } else {
        console.log('remove toggle');

        favoriteSequence = removeFavorite(favoriteSequence, parseInt(this.id, 10));

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
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000, enableHighAccuracy: true });
});

function backChoice(previous) {
  if (previous === 'themeRoute.html') {
    mainView.hideToolbar();
    mainView.router.back();
  } else {
    console.log('aa');
    mainView.router.back({ url: 'customRoute.html', force: true });
  }
}

myApp.onPageInit('customRoute', () => {
  mainView.showToolbar();
  $$('.back-force').on('click', () => {
    mainView.router.back({ url: 'route.html', force: true });
  });

  const stations = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
  const favoriteSequence = JSON.parse(window.localStorage.getItem('favoriteStations'));
  let itemList = findSequence(stations, favoriteSequence);

  function deleteFunc() {
    $$('img.lazy').trigger('lazy');
    $$('.delete-route').on('click', function() { // if change to () => { , it will go wrong!
      myApp.swipeoutOpen($(`li#${this.id}`));
      myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
      myApp.swipeoutDelete($(`li#${this.id}`));

      const index = favoriteSequence.indexOf(parseInt(this.id, 10));
      if (index > -1) {
        favoriteSequence.splice(index, 1);
      }
    });

    $$('*[data-page="customRoute"] .swipeout-overswipe').on('click', function() {
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
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000, enableHighAccuracy: true });

  mainView.showToolbar();
  $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto; height:48px;">確定行程</a></div>');

  $$('.toolbar').off('click'); // avoid append multiple onclicked on toolbar
  $$('.toolbar').on('click', () => {
    if (favoriteSequence.length === 0) {
      myApp.alert('並沒有選擇任何站點喔!', '注意');
    } else {
      itemList = findSequence(stations, favoriteSequence);
      const routeLocation = getLocationArray(favoriteSequence);

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
                time: `預估時間: ${(t/60).toFixed(0)} 分鐘`,
                custom: true,
                previous: 'customRoute.html',
                introduction: '自己想的好棒喔',
                img: itemList[0].image.primary,
                itemList,
              },
            });
          },
        );
      } else {
        mainView.router.load({
          url: 'routeDetail.html',
          context: {
            title: '自訂行程',
            time: `預估時間: 0 分鐘`,
            custom: true,
            previous: 'customRoute.html',
            introduction: '自己想的好棒喔',
            img: itemList[0].image.primary,
            itemList,
          },
        });
      }
    }
  });
});

myApp.onPageInit('itemDetail', (page) => {
  $$('.toolbar').off('click');
  //  detect if this station have question to answered
  if (page.context.isBeacon) {
    if (localStorage.getItem("loggedIn") !== null) {
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
    } else {
      mainView.showToolbar();
      $$('.page-content').css('padding-bottom', '9.5vh');
      $$('.toolbar').html('<div class="toolbar-inner"><a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">接受挑戰</a></div>');
      $$('.toolbar').on('click', moneySelect);
    }
  }

  const link = $('*[data-page="itemDetail"] #site-content  a').attr('href');
  $$('*[data-page="itemDetail"] #site-content  a').attr('onclick', `window.open('${link}', '_system')`);
  $$('*[data-page="itemDetail"] #site-content  a').attr('href', '#');

  $$('.custom-money-content').on('click', (e) => {
    const pHeight = $$('.custom-money-content').height();
    const pOffset = $$('.custom-money-content').offset();
    const y = e.pageY - pOffset.top;
    console.log(pHeight);
    console.log(y);
    let money = parseInt(window.localStorage.getItem('coins'), 10);

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
  let money = parseInt(window.localStorage.getItem('coins'), 10);
  let experiencePoint = parseInt(window.localStorage.getItem('experiencePoint'), 10);

  $$('#questionTextArea').html(question);
  for (let i = 0; i < 4; i += 1) {
    $$(`#answer${i+1}`).html(options[i]);
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

      $$(`#${this.id}`).css('background', '#40bf79');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
        <polyline class="path check" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
      </svg>`);
      $$('#endImg').attr('src', 'img/success-board.png');
      setTimeout(() => {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append(`<div class="end-board-message" style="position: relative;top: calc(53% - 22px);text-align:center;">
          <span style="font-size:6vw;font-weight:bold;">等級${Math.floor(experiencePoint / EXP_PER_LEVEL + 1)}</span><br><br>
          <img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;
          <span style="font-size:9vw; font-weight:bold; vertical-align: middle;">${money}</span>
        </div>`);
      }, 1200);

      if (window.localStorage.getItem('loggedIn') !== null) {
        $$.post(
          url = 'https://smartcampus.csie.ncku.edu.tw/smart_campus/add_answered_question/',
          data = {
            'question_id': question_id,
            'email': window.localStorage.getItem('email'),
          },
          success = function(data) {
            console.log('add answered success');
          },
        );
      }

      let rewards = JSON.parse(window.localStorage.getItem('rewards'));
      console.log('rewardID');
      if (rewardID.length > 0) {
        console.log(rewardID);
        console.log(rewards);

        if ($.inArray(rewardID[0], rewards) === -1) {
          rewards = getRewards(rewards, rewardID[0]);

          const rewardsInfo = JSON.parse(window.sessionStorage.getItem('allRewardsInfo'));
          const rewardInfo = findStation(rewardsInfo, rewardID[0]);

          myApp.addNotification({
            title: '成大藏奇圖',
            message: `您已獲得收藏品:  「${rewardInfo.name}」`,
            media: `<img width="44" height="44" style="border-radius:100%" src="${rewardInfo.image_url}">`,
            hold: 8000,
            closeOnClick: true,
          });
        }
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
  //beacon_util.stopScanForBeacons();

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

      //beacon_util.startScanForBeacons()
    }
  });

  if (localStorage.getItem("loggedIn") !== null) {
    $$.ajax({
      url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
      type: 'get',
      data: {
        'email': window.localStorage.getItem('email'),
        'station_id': page.context.id,
      },
      success: (data) => {
        const questionData = JSON.parse(data);
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain, page.context.rewardID);
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
        answerQuestion(questionData.content, questionData.choices, questionData.answer, questionData.question_id, page.context.gain, page.context.rewardID);
      },
      error: (data) => {
        console.log("get question error");
      }
    });
  }
});
