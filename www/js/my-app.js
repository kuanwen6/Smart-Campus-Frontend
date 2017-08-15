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
    $$('.swipe-list').append(`<li class="swipeout" id="${favorite[i].id}">
                <div class="card swipeout-content">
                    <div href="#" class="card-content" style="height:15vh;">
                        <div class="row no-gutter">
                            <i class="f7-icons color-red delete-route" id="${favorite[i].id}" style="font-size:21px;position:absolute;right:8px; top:5px;">delete_round_fill</i>
                            <div class="col-35">
                              <img src="${favorite[i].img}" style="width:20vh;height:15vh;">
                              <i class="f7-icons color-red" style="font-size:17px;position:absolute;bottom:3px;left:16.5vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                            </div>
                            <div class="col-60" style="padding:8px;">
                                <div class="card-title"><span>${favorite[i].title}</span></div>
                                <div class="row" style="margin-top:8vh;">
                                    <div class="col-60"></div>
                                    <div class="col-35"><span>${favorite[i].range}公尺</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="swipeout-actions-right">
                  <a href="#" class="swipeout-delete swipeout-overswipe">
                    <div>
                      <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">trash_fill</i>
                      <br>
                      <p style="font-size:13px;">確認刪除</p>
                    </div>
                  </a>
                </div>
              </li>`);
  }
}

function findRoute(id) {
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].id === id) {
      return data[i];
    }
  }
}


$$('.center').on('click', () => {
  let modal = document.getElementById('myModal');

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  let img = document.getElementById('themeImg');
  let modalImg = document.getElementById('img01');
  let captionText = document.getElementById('caption');
  img.onclick = () => {
    modal.style.display = 'block';
    modalImg.src = 'img/leadership.png';
  };

  // Get the <span> element that closes the modal
  let span = document.getElementsByClassName('close')[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = 'none';
  }
});

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
        previous: 'themeRoute.html',
      },
    });
  });
});

myApp.onPageInit('routeDetail', (page) => {
// run createContentPage func after link was clicked
  $$('.toolbar-inner').html(`<a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀
                              <i class="f7-icons color-red toolbar-icon">navigation_fill</i></a>`);
});

myApp.onPageInit('customRoute', (page) => {
// run createContentPage func after link was clicked
  $$('.toolbar-inner').html('<a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto; height:48px;">確定行程</a>');
  
  createFavoriteCards();

  $$('.delete-route').on('click', function () { // if change to () => { , it will go wrong!
    myApp.swipeoutOpen($$(`li#${this.id}`));
    myApp.alert('將從此次自訂行程中刪去，但並不會從我的最愛刪去喔!', '注意!');
    myApp.swipeoutDelete($$(`li#${this.id}`));
  });

  $$('.toolbar').on('click', () => {
    mainView.router.load({
      url: 'routeDetail.html',
      context: {
        title: '自訂行程',
        time: 'unknown',
        previous: 'customRoute.html',
      },
    });
  });
});
