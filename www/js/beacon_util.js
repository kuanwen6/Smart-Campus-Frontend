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

beacon_util.beaconRegions =
[
	{
		id: 'tainan',
		uuid:'B01BCFC0-8F4B-11E5-A837-0821A8FF9A66'
	}
];


beacon_util.init_beacon_detection = function()
{
	// Specify a shortcut for the location manager that
	// has the iBeacon functions.
	window.locationManager = cordova.plugins.locationManager;

  if(myApp.device.os == 'android'){
    locationManager.isBluetoothEnabled()
      .then(function(isEnabled) {
        console.log("isEnabled: " + isEnabled);
        if (!isEnabled) {
          myApp.confirm('啟動藍牙以展開校園探索！！是否開啟？', '啟用藍芽？',
            function () {
              locationManager.enableBluetooth();
            }
          );
        }
      })
      .fail()
      .done();
  }else{
    myApp.addNotification({
      title: '小提示',
      message: '啟動藍牙以展開校園探索！！',
      hold: 6000,
      closeOnClick: true,
    });
  }
  beacon_util.setIBeaconCallback();
}


beacon_util.setIBeaconCallback = function()
{
	// The delegate object contains iBeacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate();

	delegate.didRangeBeaconsInRegion = function(pluginResult)
	{
		beacon_util.didRangeBeaconsInRegion(pluginResult);
	}
	
	delegate.didEnterRegion = function(pluginResult)
	{

	}

	delegate.didExitRegion = function(pluginResult)
	{

	}

	// Set the delegate object to use.
	locationManager.setDelegate(delegate);
	//IOS authorization
	locationManager.requestAlwaysAuthorization();
}

beacon_util.startScanForBeacons = function()
{
	// Start monitoring and ranging our beacons.
	for (var r in beacon_util.beaconRegions)
	{
		var region = beacon_util.beaconRegions[r];

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor);
		
		// Start monitoring.
		locationManager.startMonitoringForRegion(beaconRegion)
			.fail()
			.done()

		// Start ranging.
		locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail()
			.done()
	}
}

beacon_util.stopScanForBeacons = function()
{
  // Stop monitoring and ranging our beacons.
  for (var r in beacon_util.beaconRegions)
  {
    var region = beacon_util.beaconRegions[r];

    var beaconRegion = new locationManager.BeaconRegion(
      region.id, region.uuid, region.major, region.minor);
    
    // Stop monitoring.
    locationManager.stopMonitoringForRegion(beaconRegion)
      .fail()
      .done()

    // Stop ranging.
    locationManager.stopRangingBeaconsInRegion(beaconRegion)
      .fail()
      .done()
  }
}

beacon_util.transformToPlatformID = function(beacon)
{
  var uuid = beacon.uuid;
  var major = beacon.major;
  var minor = beacon.minor;
  
  var shortUUID = beacon_util.mappingShortUUID(uuid);
  
  //The ID on the SPOT platform
  var ID = shortUUID +'-'+ major +'-'+ minor;
  
  return ID;
}

beacon_util.mappingShortUUID = function(UUID)
{
  var shortUUID = "";
  UUID = UUID.toUpperCase();
  if(UUID == "B01BCFC0-8F4B-11E5-A837-0821A8FF9A66")
    shortUUID = "801";
  else if(UUID == "B01BCFC0-8F4B-11E5-A837-0821A8FFFFFF")
    shortUUID = "995801";
  else if(UUID == "D3556E50-C856-11E3-8408-0221A885EF40")
    shortUUID = "1";
  else if(UUID == "4408D700-8CC3-42E6-94D5-ADA446CF2D72")
    shortUUID = "2";
  else if(UUID == "D3556E50-C856-11E3-8408-0221A8FFEF40")
    shortUUID = "1";
  else if(UUID == "D3556E50-C856-11E3-8408-0221A8FFFFFF")
    shortUUID = "9951";
  else if(UUID == "D3556E50-C856-11E3-8408-0221A885FFFF")
    shortUUID = "9951";
  else
    shortUUID = "000";
  
  return shortUUID;
  
}

beacon_util.recordDetection = {}

// Actions when any beacon is in range
beacon_util.didRangeBeaconsInRegion = function(pluginResult)
{ 
  // There must be a beacon within range.
  if (0 == pluginResult.beacons.length)
  {
    return;
  }

  Object.keys(beacon_util.recordDetection).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    var beaconStillInRange = false;
    for (var i=0;i < pluginResult.beacons.length ; i++)
    {
      var beacon = pluginResult.beacons[i];
      var platformID = beacon_util.transformToPlatformID(beacon);

      if( key == 'B'+platformID){
        beaconStillInRange = true;
        break;
      }
    }

    if(!beaconStillInRange)
    {
      beacon_util.recordDetection[key] = false;
    }
  });
  myApp.alert(Object.keys(beacon_util.recordDetection));

  for (var i=0;i < pluginResult.beacons.length ; i++)
  {
    var beacon = pluginResult.beacons[i];

    var platformID = beacon_util.transformToPlatformID(beacon);

    if ((beacon.proximity == 'ProximityImmediate' || beacon.proximity == 'ProximityNear'))
    {

      if( !beacon_util.recordDetection['B'+platformID] )
      {
        beacon_util.recordDetection['B'+platformID] = true;
        $$.ajax({
          url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_linked_stations/',
          type: 'post',
          data: {
            'beacon_id': platformID,
          },
          success: (stations) => {
            const stationsObj = JSON.parse(stations).data;
            console.log(stationsObj); // array

            $$.ajax({
              url: 'https://smartcampus.csie.ncku.edu.tw/smart_campus/get_all_stations/',
              type: 'post',
              success: (data) => {
                const site = findStation(JSON.parse(data).data, parseInt(stationsObj[0], 10));
                
                myApp.addNotification({
                  title: '接近'+site['category'],
                  message: site['name'],
                  hold: 6000,
                  closeOnClick: true,
                  onClick: function () {
                    mainView.router.load({
                      url: 'itemDetail.html',
                      context: {
                        site,
                        isBeacon: true,
                        favoriteSequence: JSON.parse(window.localStorage.getItem('favoriteStations')),
                        favorite: isFavorite(parseInt(stationsObj[0], 10)),
                      },
                    });
                  }
                });
                
              },
              error: (data) => {
                console.log('get station data error');
              },
            });
          },
          error: (data) => {
            console.log(data);
          },
        });
      }  
    }
    else
    {
      beacon_util.recordDetection['B'+platformID] = false;
    }
  }
  return 
}
