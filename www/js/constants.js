var myApp = new Framework7({
  template7Pages: true,
  swipeBackPage: false,
  statusbarOverlay: false
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
  // Because we use fixed-through navbar we can enable dynamic navbar
  dynamicNavbar: true,
  domCache: true,
});

var mySwiper = myApp.swiper('.swiper-container', {
  pagination: '.swiper-pagination'
});

var welcomescreenSlides = [{
  id: 'slide0',
  picture: '<img src="./img/intro/intro_1.png">'
}, {
  id: 'slide1',
  picture: '<img src="./img/intro/intro_2.png">'
}, {
  id: 'slide2',
  picture: '<img src="./img/intro/intro_3.png">',
  text: '<a id="welcome-close-btn" href="#"><img src="./img/intro/start_btn.png"></a>'
}];

// hookurl of smart campus server
var HOOKURL = 'https://smartcampus.csie.ncku.edu.tw/';

// experience per level
var EXP_PER_LEVEL = 50;

var directionsDisplay,
    directionsService;

var exit_confirm_result;
var network_interrupt_alert;

var STATION_NOTIFICATION = 1;
var REWARD_NOTIFICATION = 2;
