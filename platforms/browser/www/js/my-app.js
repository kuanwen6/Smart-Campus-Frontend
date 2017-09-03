// Initialize your app
const myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  cache: false,
  swipeBackPage: false,
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

const sites = [{
  id: 'site1',
  name: '自然類',
  content: '內容',
  category: 'nature',
  image: 'img/ncku.jpg',
  range: '40',
}, {
  id: 'site2',
  name: '古蹟類',
  content: '內容',
  category: 'history',
  image: 'img/ncku.jpg',
  range: '40',
}, {
  id: 'site3',
  name: '藝文類',
  content: '內容',
  category: 'art',
  image: 'img/ncku.jpg',
  range: '40',
}, {
  id: 'site4',
  name: '行政類',
  content: '內容',
  category: 'business',
  image: 'img/ncku.jpg',
  range: '40',
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
                    <div href="#" class="card-content" style="height:18vh;">
                        <div class="row no-gutter">
                            <img class="delete-route" id="${favorite[i].id}" src="img/error.png" style="height:21px; width:21px;position:absolute;right:8px; top:5px;">
                            <div class="col-55">
                              <img src="${favorite[i].img}" style="width:32vh;height:18vh;">
                              <i class="f7-icons color-red" style="font-size:18px;position:absolute;bottom:5px;left:28vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                            </div>
                            <div class="col-40" style="padding:8px;">
                                <div class="card-title"><span>${favorite[i].title}</span></div>
                                <div class="row" style="margin-top:9vh;">
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

function createSites() {
  for (let i = 0; i < sites.length; i += 1) {
    $$(`.${sites[i].category}-list`).append(`<li class="swipeout swipeout-${sites[i].id}" id="${sites[i].id}">
    <div class="card swipeout-content">
        <div href="#" class="card-content" style="height:18vh;">
            <div class="row no-gutter">
                <div class="col-55">
                  <img src="${sites[i].image}" style="width:32vh;height:18vh;">
                  <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:28vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
                </div>
                <div class="col-40" style="padding:8px;">
                    <div class="card-title"><span>${sites[i].name}</span></div>
                    <div class="row" style="margin-top:9vh;">
                        <div class="col-60"></div>
                        <div class="col-35"><span>${sites[i].range}公尺</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="swipeout-actions-right">
      <a href="#" class="add-favorite swipeout-overswipe" id="${sites[i].id}">
        <div>
          <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
          <br>
          <p style="font-size:13px;">加入最愛</p>
        </div>
      </a>
    </div>
  </li>`);

    //  take apart of this two class is because of the swipeoutClose(), this function can only operate 'a' element at the same time
    $$('.search-all-list').append(`<li class="swipeout swipeout-search-${sites[i].id}" id="${sites[i].id}">
  <div class="card swipeout-content">
      <div href="#" class="card-content" style="height:18vh;">
          <div class="row no-gutter">
              <div class="col-55">
                <img src="${sites[i].image}" style="width:32vh;height:18vh;">
                <i class="favorite-heart-${sites[i].id} f7-icons color-white" style="font-size:18px;position:absolute;bottom:5px;left:28vh; text-shadow: 0px 0px 8px white;">heart_fill</i>
              </div>
              <div class="col-40" style="padding:8px;">
                  <div class="card-title"><span>${sites[i].name}</span></div>
                  <div class="row" style="margin-top:9vh;">
                      <div class="col-60"></div>
                      <div class="col-35"><span>${sites[i].range}公尺</span></div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <div class="swipeout-actions-right">
    <a href="#" class="add-favorite swipeout-overswipe" id="${sites[i].id}">
      <div>
        <i class="f7-icons color-white" style="font-size:8vw;position:absolute;top:20%;left:40%;">heart_fill</i>
        <br>
        <p style="font-size:13px;">加入最愛</p>
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
/*
$$('.center').on('click', () => {
  const modal = document.getElementById('myModal');

  // Get the image and insert it inside the modal - use its "alt" text as a caption
  const img = document.getElementById('themeImg');
  const modalImg = document.getElementById('img01');
  img.onclick = () => {
    modal.style.display = 'block';
    modalImg.src = 'img/leadership.png';
  };

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName('close')[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = 'none';
  }
});
*/

myApp.onPageInit('themeRoute', () => {
  createCards();

  $$('.card').on('click', function () { // if change to () => { ,it will go wrong!
    const route = findRoute(this.id);
    mainView.router.load({
      url: 'routeDetail.html',
      context: {
        title: route.title,
        time: route.time,
        previous: 'themeRoute.html',
        introduction: route.info,
        img: route.img,
      },
    });
  });
});

myApp.onPageInit('themeSite', () => {
  createSites();

  $$('.swipeout-overswipe').on('click', function () { // if change to () => { , it will go wrong!
    if ($(this).hasClass('add-favorite')) {
      // add this.id to favorite
      console.log('add toggle');
      $(`.favorite-heart-${this.id}`).removeClass('color-white').addClass('color-red');
      //$(`#favorite-heart-${this.id}`).remove();
      $(`#${this.id}.swipeout-overswipe`).removeClass('add-favorite').addClass('remove-favorite');
      myApp.swipeoutClose($(`li.swipeout-${this.id}`));
      myApp.swipeoutClose($(`li.swipeout-search-${this.id}`));
      $(this).children('div').children('p').html('移出最愛');
    } else {
      // remove this.id to favorite
      console.log('remove toggle');
      $(`.favorite-heart-${this.id}`).removeClass('color-red').addClass('color-white');
      $(`#${this.id}.swipeout-overswipe`).removeClass('remove-favorite').addClass('add-favorite');
      myApp.swipeoutClose($(`li.swipeout-${this.id}`));
      myApp.swipeoutClose($(`li.swipeout-search-${this.id}`));
      $(this).children('div').children('p').html('加入最愛');
    }
  });
});

myApp.onPageInit('routeDetail', () => {
  $$('.toolbar-inner').html(`<a href="#" class="button button-big toolbar-text" style="text-align:center; margin:0 auto;  height:48px;">開始參觀
                              <i class="f7-icons color-red toolbar-icon">navigation_fill</i></a>`);
  myApp.accordionOpen($$('li#introduction'));
});

myApp.onPageInit('customRoute', () => {
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
        img: 'img/ncku.jpg',
      },
    });
  });
});

myApp.onPageInit('gamePage', () => {
  /* TODO 
  const question = getQuestion(beacon_id);
  const options = getOptions();
  const answer = getAnswer();

  $$('#questionTextArea').html(question);
  for (let i=0; i<4; i++) {
    $$(`#answer{i+1}`).html(options[i]);
  }

  $$('.answer').on('click', function () {
    lockButton();
    if (this.id === answer) {
      correct();
    } else {
      wrong();
    }
  });

  $$('.confirm').on('click', () => {
    freeButton();
    redirection();
  });
  */

  setTimeout(() => {
    $$('#gameStart-modal').css('display', 'none');
  }, 5000);

  $('.custom-modal-content').css('top', 44 + (($(window).height() - $(window).width() * 0.96 - 44) / 2));

  const question = '哪座雕像是以魯迅為本的雕塑品，營造出........................';
  const options = ['沉思者', '太極', '詩人', '舞動'];
  const answer = 'answer1';

  $$('#questionTextArea').html(question);
  for (let i = 0; i < 4; i += 1) {
    $$(`#answer${i+1}`).html(options[i]);
  }

  $$('.answer').on('click', function answerClicked() {
    $$('.answer').off('click', answerClicked); // lock the button

    const modal = $$('#gameEnd-modal');
    const modalImg = $$('#endImg');
    if (this.id === 'answer1') {
      $$(`#${this.id}`).css('background', '#40bf79');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
      <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
      <polyline class="path check" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
    </svg>`);
      setTimeout(() => {
        modal.css('display', 'block');
      }, 1200);
    } else {
      console.log('fail');
      $$(`#${this.id}`).css('background', '#ff66cc');
      $$(`#${this.id}`).append(`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
      <circle class="path circle" fill="none" stroke="white" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
      <line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>
      <line class="path line" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>
    </svg>`);
      setTimeout(() => {
        modal.css('display', 'block');
      }, 1200);
    }
  });

  $$('#endImg').on('click', (e) => {
    const pHeight = $('#endImg').height();
    const pOffset = $('#endImg').offset();
    const y = e.pageY - pOffset.top;
    console.log('Y: ' + e.pageY);
    console.log('Off: ' + pOffset.top);
    console.log('H: ' + pHeight);

    if (y > pHeight * 0.78 && y <= pHeight) {
      mainView.router.load({
        url: 'index.html',
      });
    }
  });
});