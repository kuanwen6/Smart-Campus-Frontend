
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
    $$('*[data-page="favorite"] .skeleton-screen').removeClass('skeleton-screen');
  }

  function onSuccess(position) {
    createFavorite(itemList, position.coords.latitude, position.coords.longitude, onclickFunc);
  }

  function onError() {
    createFavorite(itemList, -1, -1, onclickFunc);
  }
  navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 3500, enableHighAccuracy: true });
});

myApp.onPageInit('itemDetail', function(page) {
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
        $$.ajax({
          url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_unanswered_question/',
          type: 'get',
          data: {
            'email': 'visitMode@gmail.com',
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