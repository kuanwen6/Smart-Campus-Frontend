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
    center: {
      lat: 22.998089,
      lng: 120.217441
    },
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
  var userIdentity = window.localStorage.getItem('userIdentity');
  var inVisibleGroup;
  switch (userIdentity) {
    case 'student':
      inVisibleGroup = '古蹟';
      $('div.filter-div#0 > span').toggleClass('filter-added');
      break;
    case 'public':
      inVisibleGroup = '行政教學';
      $('div.filter-div#3 > span').toggleClass('filter-added');
      break;
    default:
      console.log('Error in userIdentity!');
      break;
  };

  map.addListener('click', hideMarkerInfo);
  directionOrMapOverview(page.context.isDirection);
  setMarkers();
  navigator.geolocation.watchPosition(onMapWatchSuccess, onMapError, {
    enableHighAccuracy: true
  });

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

          waypts.push({
            location: {
              lat: station['location'][1],
              lng: station['location'][0]
            }
          });
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
      '行政教學': 'img/markers/marker_blue.png'
    };
    var scaledSize = new google.maps.Size(25, 36);
    var anchor = new google.maps.Point(12.5, 36);

    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        position: {
          lat: station['location'][1],
          lng: station['location'][0]
        },
        title: station['name'],
        map: map,
        icon: {
          url: icon[station['category']],
          scaledSize: scaledSize,
          anchor: anchor
        },
        animation: google.maps.Animation.DROP,
        visible: inVisibleGroup == station['category'] ? false : true
      });
      marker.addListener('click', showMarkerInfo);
      markers[station['category']].push(marker);
    }, timeout)
  }

  function setMarkers() {
    markers = {
      '古蹟': [],
      '藝文': [],
      '景觀': [],
      '行政教學': []
    };
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

    var station = stations.filter(function(x) {
      return x.name === _this.title;
    })[0];
    var _distance = '';
    if (Latitude !== undefined && Longitude !== undefined) {
      _distance = distance(Latitude, Longitude, station['location'][1], station['location'][0], 0);
    }

    if (animateMarker) {
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
    if (animateMarker) {
      animateMarker.setAnimation(null);
    }
    $$('.marker-info').css('display', 'none');
  }

  function setGroupMarkerVisible(groupId) {
    var category = ['古蹟', '藝文', '景觀', '行政教學'];
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
    locationMarker.setPosition({
      lat: latitude,
      lng: longitude
    });
    locationMarkerFrame.setPosition({
      lat: latitude,
      lng: longitude
    });
    locationCircle.setCenter({
      lat: latitude,
      lng: longitude
    });
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
      if (page.context.isDirection && !onMapWatchSuccess.first) {
        calculateAndDisplayRoute({
          lat: Latitude,
          lng: Longitude
        }, waypts, display = true);
        onMapWatchSuccess.first = true
      }
    }
  };

  function onMapError(error) {
    console.log('code: ' + error.code + '\nmessage: ' + error.message + '\n');
    if (page.context.isDirection) {
      var origin = waypts.pop();
      myApp.alert('導覽無法進行定位', '未開啟GPS');
      calculateAndDisplayRoute({
        lat: origin['location']['lat'],
        lng: origin['location']['lng']
      }, waypts, display = true);
    }
  }
});
