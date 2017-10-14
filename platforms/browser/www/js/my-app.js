// Initialize your app
const myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  cache: false,
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
    picture: '<img src=\'../welcome_page1.png\'>',
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

// Handle Cordova Device Ready Event
$$(document).on('deviceready', () => {
  console.log('Device is ready!');
  var applaunchCount = window.localStorage.getItem('launchCount');

  if (!applaunchCount) {
    window.localStorage.setItem('launchCount', 1);

    const welcomescreen = myApp.welcomescreen(welcomescreenSlides, { closeButton: true, });
    $$(document).on('click', '.welcome-close-btn', () => {
      welcomescreen.close();
    });
  } else {
    console.log("App has launched " + ++localStorage.launchCount + " times.");
  }
});


$$('.login-form-to-json').on('click', () => {
  const formData = myApp.formToJSON('#login-form');
  console.log(formData);
  alert(JSON.stringify(formData));
});

$$('.register-form-to-json').on('click', () => {
  const formData = myApp.formToJSON('#register-form');
  console.log(formData);
  alert(JSON.stringify(formData));
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
        console.log(totalDistance + " m, " + totalDuration + " s");
      } else
        window.alert('Directions request failed due to ' + status);
    });
  }

  function setMarkers(map) {
    var icon = ['marker_red.png', 'marker_orange.png', 'marker_green.png', 'marker_blue.png']

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

    console.log("added marker!");
    //myApp.alert("lat:" + latitude + "\nlng:" + longitude + "\nacc:" + accuracy);
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
      Accuracy = updatedAccuracy

      getMap(updatedLatitude, updatedLongitude, updatedAccuracy);
    }
  }

  function onMapError(error) {
    console.log('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
  }

  navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
  calculateAndDisplayRoute(directionsService, directionsDisplay, { lat: 22.995267, lng: 120.220237 });
});


myApp.onPageInit('info', (page) => {
  for (var i = 0; i < 16; i++) {
    $$('.collections').append('<div></div>');
  }
  for (var i = 0; i < 5; i++) {
    $$('.collections > div').eq(i).append('<img src="../collection_'+(i+1)+'.png"/>');
  }
})


/*             wen                */
const favorite = [{
  id: 'temple',
  title: '孔廟',
  img: 'img/temple.JPG',
  range: '30',
}, {
  id: 'ncku',
  title: '成大榕園',
  img: 'img/ncku.jpg',
  range: '400',
}];

function createCards(data) {
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
}

function createFavoriteCards() {
  for (let i = 0; i < favorite.length; i += 1) {
    $$('.swipe-list').append(`<li class="swipeout" id="${favorite[i].id}">
                <div class="card swipeout-content">
                    <div href="#" class="card-content" style="height:18vh;">
                        <div class="row no-gutter">
                            <img class="delete-route" id="${favorite[i].id}" src="img/error.png" style="height:21px; width:21px;position:absolute;right:8px; top:5px;">
                            <div class="col-50">
                              <img src="${favorite[i].img}" style="width:28vh;height:18vh;object-fit: cover;">
                              <i class="f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:24vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                            </div>
                            <div class="col-50" style="padding:8px;">
                                <div class="card-title"><span>${favorite[i].title}</span></div>
                                <div style="position:absolute; right:0; bottom:5px;">
                                  <span>${favorite[i].range}公尺</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swipeout-actions-right">
                  <a href="#" class="swipeout-delete swipeout-overswipe">
                    <div>
                      <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">trash_fill</i>
                      <br>
                      <p style="font-size:13px;">確認刪除</p>
                    </div>
                  </a>
                </div>
              </li>`);
  }
}

function createSites(sites) {
  let category;
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
                        <span>10 公尺</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="swipeout-actions-right">
      <a href="#" class="add-favorite swipeout-overswipe" id="${sites[i].id}">
        <div>
          <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
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
        <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
        <br>
        <p style="font-size:13px;">加入最愛</p>
      </div>
    </a>
  </div>
</li>`);
  }
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

myApp.onPageInit('route', () => {
  mainView.hideToolbar();
});

myApp.onPageInit('themeRoute', () => {
  $$.ajax({
    url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (stations) => {
      const stationsObj = JSON.parse(stations).data;
      console.log(stationsObj);
      
      $$.ajax({
        url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_travel_plans',
        type: 'get',
        success: (plans) => {
          const plansObj = JSON.parse(plans).data;
          console.log(plansObj);
          createCards(plansObj);

          $$('.card').on('click', function () { // if change to () => { ,it will go wrong!
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
  $$.ajax({
    url: 'http://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations',
    type: 'get',
    success: (data) => {
      console.log(JSON.parse(data).data);
      createSites(JSON.parse(data).data);


      $('li.swipeout').on('click', function () {
        console.log(this);
        mainView.router.load({
          url: 'itemDetail.html',
          context: {
          },
        });
      });

      $$('.swipeout').on('swipeout:closed', () => {
        $('li.swipeout').on('click', function () {
          mainView.router.load({
            url: 'itemDetail.html',
            context: {
            },
          });
        });
      });
      
      function favorites() { // if change to () => { , it will go wrong!
        $('li.swipeout').off('click');
        if ($$(this).hasClass('add-favorite')) {
          // add this.id to favorite
          console.log('add toggle');
          $$(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
          $(`#${this.id}.add-favorite`).removeClass('add-favorite').addClass('remove-favorite');
          myApp.swipeoutClose($$(`li.swipeout-${this.id}`));
          myApp.swipeoutClose($$(`li.swipeout-search-${this.id}`));
          $$(this).children('div').children('p').html('移出最愛');
        } else {
          // remove this.id to favorite
          console.log('remove toggle');
          $$(`.favorite-heart-${this.id}`).removeClass('color-red').addClass('color-white');
          $(`#${this.id}.remove-favorite`).removeClass('remove-favorite').addClass('add-favorite');
          myApp.swipeoutClose($$(`li.swipeout-${this.id}`));
          myApp.swipeoutClose($$(`li.swipeout-search-${this.id}`));
          $$(this).children('div').children('p').html('加入最愛');
        }
      }

      $$('.swipeout-overswipe').on('click', favorites);
    },
    error: (data) => {
      console.log(data);
    },
  });
});

myApp.onPageInit('routeDetail', () => {
  $$('.toolbar-inner').html(`<a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀
                              <i class="f7-icons color-red toolbar-icon">navigation_fill</i></a>`);
  myApp.accordionOpen($$('li#introduction'));
});

myApp.onPageInit('customRoute', () => {
  $$('.toolbar-inner').html('<a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto; height:48px;">確定行程</a>');
  createFavoriteCards();

  $$('.delete-route').on('click', function () { // if change to () => { , it will go wrong!
    myApp.swipeoutOpen($$(`li#${this.id}`));
    myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
    myApp.swipeoutDelete($$(`li#${this.id}`));
  });

  $$('.toolbar').on('click', () => {
    mainView.router.load({
      url: 'routeDetail.html',
      context: {
        title: '自訂行程',
        time: 'unknown',
        previous: 'customRoute.html',
        img: 'img/ncku.jpg',
      },
    });
  });
});

myApp.onPageInit('gamePage', () => {
  /* TODO 
  const question = getQuestion(beacon_id);
  const options = getOptions();
  const answer = getAnswer();

  $$('#questionTextArea').html(question);
  for (let i=0; i<4; i++) {
    $$(`#answer{i+1}`).html(options[i]);
  }

  $$('.answer').on('click', function () {
    lockButton();
    if (this.id === answer) {
      correct();
    } else {
      wrong();
    }
  });

  $$('.confirm').on('click', () => {
    freeButton();
    redirection();
  });
  */

  setTimeout(() => {
    $$('#gameStart-modal').css('display', 'none');
  }, 5000);

  $$('.custom-modal-content').css('top', 44 + (($$(window).height() - $$(window).width() * 0.96 - 44) / 2));

  const question = '哪座雕像是以魯迅為本的雕塑品，營造出........................';
  const options = ['沉思者', '太極', '詩人', '舞動'];
  const answer = 'answer1';

  $$('#questionTextArea').html(question);
  for (let i = 0; i < 4; i += 1) {
    $$(`#answer${i+1}`).html(options[i]);
  }

  $$('.answer').on('click', function answerClicked() {
    $$('.answer').off('click', answerClicked); // lock the button

    
    if (this.id === 'answer1') {
      $$(`#${this.id}`).css('background', '#40bf79');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
        <polyline class="path check" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
      </svg>`);
      $$('#endImg').attr('src', 'img/success-board.png');
      setTimeout(() => {
        $$('#gameEnd-modal').css('display', 'block');
        $$('#gameEnd-modal').append(`<div class="end-board-message" style="position: relative;top: calc(53% - 22px);text-align:center;">
          <span style="font-size:6vw;font-weight:bold;">等級4</span><br><br>
          <img src="img/coins.png" style="height:12vw;vertical-align:middle;">&nbsp;
          <span style="font-size:9vw; font-weight:bold; vertical-align: middle;">1000</span>
        </div>`);
      }, 1200);
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
          <span style="font-size:9vw; font-weight:bold; vertical-align: middle;">1000</span>
        </div>`);
      }, 1200);
    }
  });

  $$('#endImg').on('click', (e) => {
    const pHeight = $$('#endImg').height();
    const pOffset = $$('#endImg').offset();
    const y = e.pageY - pOffset.top;
    console.log('Y: ' + e.pageY);
    console.log('Off: ' + pOffset.top);
    console.log('H: ' + pHeight);

    if (y > pHeight * 0.78 && y <= pHeight) {
      mainView.router.load({
        url: 'index.html',
      });
    }
  });
});