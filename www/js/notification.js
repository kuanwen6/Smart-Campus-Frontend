var notification = {
  initialize: function() {
    cordova.plugins.notification.local.registerPermission(function (granted) {
      console.log('Notification Permission has been granted: ' + granted);
    });
    notification.bindNotificationEvents();
  },
  bindNotificationEvents: function() {
    cordova.plugins.notification.local.on('click', function (notification) {
      console.log('click', arguments);
      var data = JSON.parse(notification.data);
      var notification_type = data.type;
      var currentSite = data.station;

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
        cordova.plugins.notification.local.schedule({
          id: currentSite['id'],
          title: '接近' + currentSite['category'] + '站點',
          text: currentSite['name'],
          icon: (myApp.device.os == 'android') ? 'res://noti-icon' : 'file://img/icon.png',
          smallIcon: (myApp.device.os == 'android') ? 'res://noti-icon' : 'file://img/icon.png',
          badge: 1,
          data: { type: STATION_NOTIFICATION, station: currentSite }
        });
      }
    });
  }
}
