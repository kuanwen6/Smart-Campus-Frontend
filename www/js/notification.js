var notification = {
  initialize: function() {
    cordova.plugins.notification.local.registerPermission();
    notification.bindNotificationEvents();
  },
  bindNotificationEvents: function() {
    cordova.plugins.notification.local.on('click', function (notification) {
      console.log('click', arguments);
      var notification_type = notification.data.type;
      var currentSite = notification.data.station;

      switch(notification_type) {
        case STATION_NOTIFICATION:
          if (mainView.activePage.name == "itemDetail") {
            mainView.router.load({
              reload: true,
              reloadPrevious: false,
              url: 'itemDetail.html',
              context: {
                site: currentSite,
                isBeacon: true,
                favoriteSequence: JSON.parse(window.localStorage.getItem('favoriteStations')),
                favorite: isFavorite(parseInt(currentSite['id'], 10)),
              },
            });
          } else {
            mainView.router.load({
              url: 'itemDetail.html',
              context: {
                site: currentSite,
                isBeacon: true,
                favoriteSequence: JSON.parse(window.localStorage.getItem('favoriteStations')),
                favorite: isFavorite(parseInt(currentSite['id'], 10)),
              },
            });
          }
          break;

        default:
          console.log('Other type of notifications not implemented');
      }
    });
  },
  addStationNotification: function(currentSite) {
    cordova.plugins.notification.local.hasPermission(function (granted) {
      if ( granted ) {
        var siteName = currentSite['name'];
        if (siteName.length > 20) {
          siteName = siteName.substring(0, 18) + '...';
        }
        cordova.plugins.notification.local.schedule({
          id: currentSite['id'],
          title: '接近' + currentSite['category'] + '站點',
          text: siteName + '\n(點擊查看站點介紹)',
          icon: './img/icon.png',
          smallIcon: './img/icon.png',
          foreground: true,
          badge: 1,
          data: { type: STATION_NOTIFICATION, station: currentSite }
        });
      }
    });
  }
}
