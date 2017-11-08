/* Beacon Util
  Beacon detection setup:
    beacon_util.init_beacon_detection()
    
  Start Scanning for Beacons by:
    beacon_util.startScanForBeacons()
  Stop:
    beacon_util.stopScanForBeacons()

  Beacon detection:
    Function triggered when Beacons detected:
      beacon_util.didRangeBeaconsInRegion()
      Define actions in the function

*/
var beacon_util = {};

beacon_util.beaconRegions = [{
  id: 'tainan',
  uuid: 'B01BCFC0-8F4B-11E5-A837-0821A8FF9A66'
}];

beacon_util.init_setup_for_IBeacon = function() {
  // The delegate object contains iBeacon callback functions.
  var delegate = new cordova.plugins.locationManager.Delegate();

  delegate.didRangeBeaconsInRegion = function(pluginResult) {
    beacon_util.didRangeBeaconsInRegion(pluginResult);
  }

  // Set the delegate object to use.
  cordova.plugins.locationManager.setDelegate(delegate);
  //IOS authorization
  cordova.plugins.locationManager.requestAlwaysAuthorization();
}

beacon_util.startUpBeaconUtil = function() {
  if (myApp.device.os == 'android') {
    cordova.plugins.locationManager.isBluetoothEnabled()
      .then(function(isEnabled) {
        console.log("isEnabled: " + isEnabled);
        if (!isEnabled) {
          myApp.confirm('啟動藍牙以探索成大校園！！是否開啟？', '啟用藍芽？',
            function() {
              cordova.plugins.locationManager.enableBluetooth();
            }
          );
        }
      })
      .fail()
      .done();
  } else {
    myApp.addNotification({
      title: '小提示',
      message: '啟動藍牙以探索成大校園！！',
      hold: 4000,
      closeOnClick: true,
    });
  }

  beacon_util.startScanForBeacons();
}

beacon_util.startScanForBeacons = function() {
  // Start monitoring and ranging our beacons.
  for (var r in beacon_util.beaconRegions) {
    var region = beacon_util.beaconRegions[r];

    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
      region.id, region.uuid, region.major, region.minor);

    // Start monitoring.
    cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
      .fail()
      .done()

    // Start ranging.
    cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
      .fail()
      .done()
  }
}

beacon_util.stopScanForBeacons = function() {
  // Stop monitoring and ranging our beacons.
  for (var r in beacon_util.beaconRegions) {
    var region = beacon_util.beaconRegions[r];

    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
      region.id, region.uuid, region.major, region.minor);

    // Stop monitoring.
    cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
      .fail()
      .done()

    // Stop ranging.
    cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
      .fail()
      .done()
  }
}

beacon_util.transformToPlatformID = function(beacon) {
  var uuid = beacon.uuid;
  var major = beacon.major;
  var minor = beacon.minor;

  var shortUUID = beacon_util.mappingShortUUID(uuid);

  //The ID on the SPOT platform
  var ID = shortUUID + '-' + major + '-' + minor;

  return ID;
}

beacon_util.mappingShortUUID = function(UUID) {
  var shortUUID = "";
  UUID = UUID.toUpperCase();
  if (UUID == "B01BCFC0-8F4B-11E5-A837-0821A8FF9A66")
    shortUUID = "801";
  else if (UUID == "B01BCFC0-8F4B-11E5-A837-0821A8FFFFFF")
    shortUUID = "995801";
  else if (UUID == "D3556E50-C856-11E3-8408-0221A885EF40")
    shortUUID = "1";
  else if (UUID == "4408D700-8CC3-42E6-94D5-ADA446CF2D72")
    shortUUID = "2";
  else if (UUID == "D3556E50-C856-11E3-8408-0221A8FFEF40")
    shortUUID = "1";
  else if (UUID == "D3556E50-C856-11E3-8408-0221A8FFFFFF")
    shortUUID = "9951";
  else if (UUID == "D3556E50-C856-11E3-8408-0221A885FFFF")
    shortUUID = "9951";
  else
    shortUUID = "000";

  return shortUUID;

}

beacon_util.recordDetection = {}

// Actions when any beacon is in range
beacon_util.didRangeBeaconsInRegion = function(pluginResult) {
  // There must be a beacon within range.
  if (0 == pluginResult.beacons.length) {
    return;
  }

  // Object.keys(beacon_util.recordDetection).forEach(function(key) {
  //   // key: the name of the object key
  //   // index: the ordinal position of the key within the object
  //   var beaconStillInRange = false;
  //   for (var i=0;i < pluginResult.beacons.length ; i++)
  //   {
  //     var beacon = pluginResult.beacons[i];
  //     var platformID = beacon_util.transformToPlatformID(beacon);

  //     if( key == 'B'+platformID){
  //       beaconStillInRange = true;      
  //       break;
  //     }
  //   }

  //   if(!beaconStillInRange)
  //   {
  //     beacon_util.recordDetection[key] = false;
  //   }
  // });

  var one_beacon_verified_this_round = false;
  for (var i = 0; i < pluginResult.beacons.length; i++) {
    var beacon = pluginResult.beacons[i];

    var platformID = beacon_util.transformToPlatformID(beacon);

    if ((beacon.proximity == 'ProximityImmediate' || beacon.proximity == 'ProximityNear')) {
      if ((!beacon_util.recordDetection['B' + platformID]) && (!one_beacon_verified_this_round)) {
        beacon_util.recordDetection['B' + platformID] = true;
        var ifSucceed = false;
        var email = 'visitMode@gmail.com';
        if (localStorage.getItem("loggedIn") !== "false"){
          email = window.localStorage.getItem('email');
        }
        $$.ajax({
          url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_linked_stations/',
          type: 'post',
          data: {
            'email': email,
            'beacon_id': platformID,
          },
          async: false,
          success: function(stations) {
            var stationsObj = JSON.parse(stations).data;
            console.log(stationsObj); // array

            var stations_stored = JSON.parse(window.sessionStorage.getItem('allStationsInfo'));
            var currentSite = findStation(stations_stored, parseInt(stationsObj[0], 10));

            // Device Vibrate
            if (myApp.device.os == 'android') {
              navigator.vibrate([500, 100, 500]);
            } else {
              navigator.vibrate(500);
            }

            myApp.addNotification({
              title: '接近' + currentSite['category'] + '站點',
              subtitle: currentSite['name'],
              message: '(點擊查看站點介紹)',
              hold: 5000,
              media: '<img src="./img/icon.png">',
              closeOnClick: true,
              onClick: function() {
                mainView.router.load({
                  url: 'itemDetail.html',
                  context: {
                    site: currentSite,
                    isBeacon: true,
                    favoriteSequence: JSON.parse(window.localStorage.getItem('favoriteStations')),
                    favorite: isFavorite(parseInt(stationsObj[0], 10)),
                  },
                });
              }
            });

            ifSucceed = true;
          },
          error: function(data) {
            console.log(data);
          },
        });
        if (ifSucceed) {
          one_beacon_verified_this_round = true;
        }
      }
    } else if (beacon.proximity == 'ProximityFar') {
      beacon_util.recordDetection['B' + platformID] = false;
    }
  }
  return;
}
