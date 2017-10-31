var myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  swipeBackPage: false,
  //preloadPreviousPage: false
  template7Data: {
    'map_index': {
      isDirection: false,
    },
  }
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
