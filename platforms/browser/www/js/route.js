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

    $$('*[data-page="customRoute"] .skeleton-screen').removeClass('skeleton-screen');
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
                time: '預估時間: ' + (t / 60).toFixed(0) + '分鐘',
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
