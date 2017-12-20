mainView.hideToolbar();

$$(document).on('page:init', function(e) {
  var page = e.detail.page;
  console.log(page);
});

$$(document).on('backbutton', function() {
  var view = myApp.getCurrentView();
  var page = view.activePage;

  if (page.name == "index") {
    if (exit_confirm_result != undefined) {
      myApp.closeModal(exit_confirm_result);
    }
    exit_confirm_result = myApp.confirm("確定要離開嗎？", "成大校園導覽", function() {
      navigator.app.clearHistory();
      navigator.app.exitApp();
    });
  } else if (page.name == "itemDetail") {
    mainView.hideToolbar();
    $$('.page-content').css('padding-bottom', 0);
    mainView.router.back();
  } else {
    view.router.back();
  }
});

$$(document).on('pause', function() {
  // if (localStorage.getItem("bgDetect") == null) return;
  // if (localStorage.getItem("bgDetect") !== "true") {
  //   beacon_util.stopScanForBeacons();
  // }

  console.log("pause");
});

$$(document).on('resume', function() {
  // if (localStorage.getItem("bgDetect") == null) return;
  // if (localStorage.getItem("bgDetect") !== "true") {
  //   beacon_util.startScanForBeacons();
  // }

  console.log("resume");
});

$$(document).on('online', function() {
  console.log("online");
});

$$(document).on('offline', function() {
  if (network_interrupt_alert != undefined) {
    myApp.closeModal(network_interrupt_alert);
  }
  network_interrupt_alert = myApp.alert('需網路連線以正常運作！', '網路連線中斷');
  console.log("offline");
});

$$(document).on('deviceready', function() {
  console.log('Device is ready!');
  if (navigator.connection.type == Connection.NONE) {
    console.log('no network detected!');
    myApp.alert('需網路連線以正常運作！請重啟APP!', '無網路連線', function() {
      if (myApp.device.os == 'android') {
        navigator.app.clearHistory();
        navigator.app.exitApp();
      }
    });
  } else {
    beacon_util.init_setup_for_IBeacon();
    notification.initialize();

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });

    var applaunchCount = window.localStorage.getItem('launchCount');
    if (!applaunchCount) {
      userDataInit();
      var welcomescreen = myApp.welcomescreen(
        welcomescreenSlides, {
          closeButton: false,
          onClosed: function() {
            beacon_util.startUpBeaconUtil();

            // myApp.confirm('是否開啟背景偵測？<br>APP在背景時將顯示接近站點通知', '接近站點通知',
            //   function() {
            //     window.localStorage.setItem('bgDetect', true);
            //   },
            //   function() {
            //     window.localStorage.setItem('bgDetect', false);
            //   }
            // );
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
  }
});
