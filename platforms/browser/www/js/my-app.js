// Initialize your app
const myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  cache: false,
});

// Export selectors engine
const $$ = Dom7;

// Add view
const mainView = myApp.addView('.view-main', {
// Because we use fixed-through navbar we can enable dynamic navbar
  dynamicNavbar: true,
});

// Callbacks to run specific code for specific pages, for example for About page:
$$(document).on('page:init', (e) => {
  // Page Data contains all required information about loaded and initialized page 
  const page = e.detail.page;
  console.log(page);
});

mainView.hideToolbar();

const data = [{
  id: 'temple',
  title: '台南孔廟一日行',
  info: '大概就是孔廟附近繞繞這樣子吧',
  img: 'img/temple.JPG',
  time: '30',
}, {
  id: 'ncku',
  title: '成大自然景觀導覽',
  img: 'img/ncku.jpg',
  info: '榕園、成功湖...等等一次滿足!',
  time: '40',
}, {
  id: 'ncku2',
  title: '成大雕像',
  img: 'img/ncku.jpg',
  info: '一堆雕像',
  time: '40',
}];

const favorite = [{
  id: 'temple',
  title: '孔廟',
  img: 'img/temple.JPG',
  range: '30',
}, {
  id: 'ncku',
  title: '成大榕園',
  img: 'img/ncku.jpg',
  range: '400',
}];

function createCards() {
  for (let i = 0; i < data.length; i += 1) {
    $$('.big-card').append(`<div class="card" id="${data[i].id}">
                    <div href="#" class="card-content" style="height:15vh;">
                        <div class="row no-gutter">\
                            <div class="col-35"><img src="${data[i].img}" style="width:20vh;height:15vh;"></div>
                            <div class="col-60" style="padding:8px;">
                                <div class="card-title"><span>${data[i].title}</span></div>
                                <br>
                                <div class="row">
                                    <div class="col-35"></div>
                                    <div class="col-60"><span>${data[i].info}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer"><span>預估時間: ${data[i].time}分鐘</span></div>
                </div>`);
  }
}

function createFavoriteCards() {
  for (let i = 0; i < favorite.length; i += 1) {
    $$('.favorite-cards').append(`<div class="card" id="${favorite[i].id}">
                    <div href="#" class="card-content" style="height:15vh;">
                        <div class="row no-gutter">
                            <i class="f7-icons color-black delete-route" id="${favorite[i].id}" style="font-weight:bold; font-size:20px;position:absolute;right:0px;">delete_round</i>
                            <div class="col-35"><img src="${favorite[i].img}" style="width:20vh;height:15vh;"></div>
                            <div class="col-60" style="padding:8px;">
                                <div class="card-title"><span>${favorite[i].title}</span></div>
                                <div class="row" style="margin-top:8vh;">
                                    <div class="col-60"></div>
                                    <div class="col-35"><span>${favorite[i].range}公尺</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`);
  }
}

function findRoute(id) {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].id === id) {
      return data[i];
    }
  }
}

myApp.onPageInit('themeRoute', (page) => {
// run createContentPage func after link was clicked
  createCards();

  $$('.card').on('click', function () { // if change to () => { ,it will go wrong!
    const route = findRoute(this.id);
    mainView.router.load({
      url: 'routeDetail.html',
      context: {
        title: route.title,
        time: route.time,
      },
    });
  });
});

myApp.onPageInit('routeDetail', (page) => {
// run createContentPage func after link was clicked
  $$('.toolbar-inner').html('<a href="#" class="button button-big" style="text-align:center; margin:0 auto; font-size: 30px; height:48px;">開始參觀</a>');
});

myApp.onPageInit('customRoute', (page) => {
// run createContentPage func after link was clicked
  $$('.toolbar-inner').html('<a href="#" class="button button-big" style="text-align:center; margin:0 auto; font-size: 30px; height:48px;">確定行程</a>');
  createFavoriteCards();

  $$('.delete-route').on('click', function () { // if change to () => { ,it will go wrong!
    console.log(this.id);
    myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
    $$(`#${this.id}`).remove();
  });

  $$('.button-big').on('click', () => {
    mainView.router.load({
      url: 'routeDetail.html',
      context: {
        title: '自訂行程',
        time: 'unknow',
      },
    });
  });
});

