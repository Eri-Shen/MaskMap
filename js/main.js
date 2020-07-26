var map;
var initlatitude;
var initlongitude;
var markers;
var markersArray=[];
var pharmaciesData;//衛服部資料
var locateFn = false;
var el;
var selectCountry;
var selectTown;
var searchBtn;
var selectMask;
var date;
var day;
var allresults = [];
var menu;
var menuCollapseBtn;
var userLocate;
// geocoder = new google.maps.Geocoder();
//綠色icon
var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
var greyIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

//取得今天時間
function getDate(){
    var dt = new Date();
    date.innerHTML = dt.getFullYear()+"年"+(dt.getMonth()+1)+"月"+dt.getDate()+"日"
    if(dt.getDay()%2 == 0){
        day.innerHTML = "偶數"
    }else{
        day.innerHTML = "基數"
    }
}


//HTML5 Geolocation API
//1.透過if判斷是否可以讀取瀏覽器位置
//2.使用者目前的位置，可呼叫 getCurrentPosition() 函式。如此將啟動非同步化的請求，以偵測使用者的位置，並將查詢定位硬體而取得最新資訊。
function geoFindMe(callback) {
    //1.透過if判斷是否可以讀取瀏覽器位置
    if (!navigator.geolocation){
        // loadMap(25.0172264,121.506378);
        alert('若要使用定位尋找藥局，請點選「允許」位置');
    }else{
        //可以的話使用getCurrentPosition() 函式取的位置：
        //navigator.geolocation.getCurrentPosition(successCallback, [errorCallback [,options]])
        navigator.geolocation.getCurrentPosition(success, error);
    }

    function success(position) {
        initlatitude  = position.coords.latitude;//緯度
        initlongitude = position.coords.longitude;//經度
        console.log('緯度:'+initlatitude+',經度:'+initlongitude);
        map.setView([initlatitude,initlongitude],15);
        userLocate = L.marker([initlatitude,initlongitude],{icon: blueIcon}).bindPopup('現在位置').addTo(map).openPopup();
        searchInitLocation2kem(initlatitude,initlongitude);
    };

    function error() {
       loadMap(25.0172264,121.506378);
       alert('若要使用定位尋找藥局，請點選「允許」位置');
    };
}


function loadMap(latitude,longitude){
    map = L.map('mapid').setView([latitude,longitude],7);;//建立預設座標
    console.log(map)
    // 選擇要匯入的圖資tileLayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 35,
        maxNativeZoom: 35
    }).addTo(map);
    // L.marker([latitude,longitude],{icon: blueIcon}).bindPopup('我的位置').addTo(map);
    loadMark();
}
// 初始化使用者繪製+匯入圖資
// 套入openstreetmap
// 客製icon
// https://leafletjs.com/reference-1.6.0.html#icon
// https://github.com/pointhi/leaflet-color-markers


window.onload = function(){
    locationBtn = document.getElementById('searchlocate');
    locationBtn.addEventListener('click',geoFindMe,false);
    selectCountry = document.getElementById('country');
    selectTown = document.getElementById('town');
    selectCountry.addEventListener('change',putTownData,false);
    searchBtn = document.getElementById('search');
    searchBtn.addEventListener('click',searchPharmacy,false);
    selectMask = document.getElementById('mask');
    date = document.getElementById('date');
    day = document.getElementById('day');
    allresults = document.querySelectorAll(".menu__content__item");
    menuCollapseBtn = document.querySelector(".menu--collapse");
    menu = document.querySelector(".menu");
    menuCollapseBtn.addEventListener('click',menuCollapse,false);
    // clickResult();
    putTownData();
    getDate();
    loadingImg("start");
    loadingImg("end");
}
// function PromiseFn(params) {
//     retuen new Promise(function(resolve,reject){

//     })
    
// }
//預設一開始載入地圖
loadMap(23.4747252,117.8396806);





  //加入地標ICON
  //https://leafletjs.com/reference-1.6.0.html#marker
  //加入全家長溪店試試看23.0657979,120.1962493,17z

//抓取資料，利用ajax來撈會更新的線上資料
function loadMark(){
    markers = new L.MarkerClusterGroup();
    var xhr = new XMLHttpRequest();     //宣告一個請求
    xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')//輸入撈取資料的放式，還有要撈取資料的URL
    // xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(null);//送出資料，通常是post才會需要送出資料
    console.log(xhr);
    console.log("xhr.onload="+xhr.onload);
    //onload 當資料確定有回傳了，則開始執行以下function
    //透過XMLHttpRequest取得的資料是"字串"，因此要使用JSON.parse將字串轉換成JSON格式
    xhr.onload = function(){
        pharmaciesData = JSON.parse(xhr.responseText).features;
        console.log('pharmaciesData='+pharmaciesData);
        for(let i=0; i<pharmaciesData.length; i++){
            // searchInitLocation2kem();
            var iconColor;
            if(pharmaciesData[i].properties.mask_adult==0 || pharmaciesData[i].properties.mask_child==0){
                iconColor = greyIcon;
            }else{
                iconColor = greenIcon;
            }
            //[1]緯度、[0]經度
            markersArray[i]=L.marker([pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]],
                {
                    icon: iconColor,
                    title: pharmaciesData[i].properties.name
                }).bindPopup(pharmaciesData[i].properties.name+'<div>成人口罩:'+pharmaciesData[i].properties.mask_adult+'</div><div>兒童口罩:'+pharmaciesData[i].properties.mask_child+'</div>')
            // markers.addLayer(L.marker([pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]],
            //     {
            //         icon: iconColor,
            //         title: pharmaciesData[i].properties.name
            //     }).bindPopup(pharmaciesData[i].properties.name+'<div>成人口罩:'+pharmaciesData[i].properties.mask_adult+'</div><div>兒童口罩:'+pharmaciesData[i].properties.mask_child+'</div>'));
            markers.addLayer(markersArray[i]);
            map.addLayer(markers);
        }
    }
}


function toTrigonometric(d){
    return d * Math.PI / 180.0;//經緯度轉換成三角函數中度分表形式。
 }

//計算距離，參數分別爲第一點的緯度，經度；第二點的緯度，經度
function GetDistance(lat1,lng1,lat2,lng2){
    var radLat1 =  toTrigonometric(lat1);
    var radLat2 =  toTrigonometric(lat2);
    var a = radLat1 - radLat2;
    var b =  toTrigonometric(lng1) -  toTrigonometric(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //輸出爲公里
    s = s*1000;
    s = Math.round(s);
    return s;
}

//判斷2KM以內的藥局
function searchInitLocation2kem(){
    var webContent = [];
    for(let i = 0 ; i<pharmaciesData.length ; i++){
        var dis = GetDistance(initlatitude,initlongitude,pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]);
        console.log(dis);
        if(dis<=2000){
            console.log('印出商店')
            let insertDiv = document.getElementById("insert");
            insertHTML = `
            <div class="menu__content__item" data-lat=${pharmaciesData[i].geometry.coordinates[1]} data-lon=${pharmaciesData[i].geometry.coordinates[0]}>
                <div class="menu__content__item__title">${pharmaciesData[i].properties.name}</div>
                <ul class="menu__content__item__list">
                    <li><img src="images/home.svg" alt="">${pharmaciesData[i].properties.address}</li>
                    <li><img src="images/telephone.svg" alt="">${pharmaciesData[i].properties.phone}</li>
                    <li><img src="images/clock.svg" alt=""><a href="">營業時間</a></li>
                </ul>
                <div class="menu__content__item_data menu__content__item_data--adult">成人口罩:<span>${pharmaciesData[i].properties.mask_adult}</span></div><div class="menu__content__item_data menu__content__item_data--child">兒童口罩:<span>${pharmaciesData[i].properties.mask_child}</span></div>
                <div class="menu__content__item__distance"></span>${dis}</span>M</div>
                <div class="mapData"></div>
            </div>
            `
            // console.log(insertHTML);
            insertDiv.innerHTML += insertHTML;
        }
        
    }
    allresults = document.querySelectorAll('.menu__content__item');
    console.log('結果',allresults);
    clickResult();
}
//搜尋指定藥局
function searchPharmacy(){
    console.log("搜尋")
    loadingImg("start");
    insert.innerHTML = "";
    for(let i = 0; i<pharmaciesData.length; i++){
        console.log('在搜尋迴圈裡印資料')
        if(selectCountry.value == pharmaciesData[i].properties.county && selectTown.value == pharmaciesData[i].properties.town){
            console.log('進入switch')
            switch (selectMask.value) {
                case '全部':
                    console.log('進入全部')
                    printPharmacy(pharmaciesData[i].properties.name,pharmaciesData[i].properties.address,pharmaciesData[i].properties.phone,pharmaciesData[i].properties.mask_adult,pharmaciesData[i].properties.mask_child,pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]);
                    break;
                case '成人':
                    console.log('進入成人')
                    if(pharmaciesData[i].properties.mask_adult > 0){
                        printPharmacy(pharmaciesData[i].properties.name,pharmaciesData[i].properties.address,pharmaciesData[i].properties.phone,pharmaciesData[i].properties.mask_adult,pharmaciesData[i].properties.mask_child,pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]);
                    }
                    break;
                case '兒童':
                    console.log('進入兒童')
                    if(pharmaciesData[i].properties.mask_child > 0){
                        printPharmacy(pharmaciesData[i].properties.name,pharmaciesData[i].properties.address,pharmaciesData[i].properties.phone,pharmaciesData[i].properties.mask_adult,pharmaciesData[i].properties.mask_child,pharmaciesData[i].geometry.coordinates[1],pharmaciesData[i].geometry.coordinates[0]);
                    }
                    break;
            }
        }
    }
    loadingImg("end");
    allresults = document.querySelectorAll('.menu__content__item');
    console.log('結果',allresults);
    clickResult();
}
function printPharmacy(name,address,phone,mask_adult,mask_child,datalat,datalon){
    let insertDiv = document.getElementById("insert");
    insertHTML = `
    <div class="menu__content__item" data-lat=${datalat} data-lon=${datalon}>
        <div class="menu__content__item__title">${name}</div>
        <ul class="menu__content__item__list">
            <li><img src="images/home.svg" alt="">${address}</li>
            <li><img src="images/telephone.svg" alt="">${phone}</li>
            <li><img src="images/clock.svg" alt=""><a href="">營業時間</a></li>
        </ul>
        <div class="menu__content__item_data menu__content__item_data--adult">成人口罩:<span>${mask_adult}</span></div><div class="menu__content__item_data menu__content__item_data--child">兒童口罩:<span>${mask_child}</span></div>
    </div>
    `
    insertDiv.innerHTML += insertHTML;
    }
function click(e){
    console.log('點到');
    console.log(e);
}
// function clickre(e){
//     console.log('點到結果');
//     console.log(e);
// }
function clickResult() {
    console.log(allresults.length);
    if(allresults.length!=0){
        console.log('執行addresult');
        for( let k = 0 ; k <allresults.length ; k++){
            allresults[k].addEventListener("click",function(){
                panMap(this.getAttribute("data-lat"),this.getAttribute("data-lon"))
                // L.marker([this.getAttribute("data-lat"),this.getAttribute("data-lon")].openPopup().up());
            },true)
        }
    }else{
        alert('error')
    }
}

function panMap(lat,lnt){
    // map.panTo([lat, lnt]);
    // map.flyTo([lat, lnt],35);
    map.setView([lat, lnt],19);
    for(let i =0 ; i<markersArray.length ; i++){
        if(markersArray[i]._latlng.lat == lat){
            if(markersArray[i]._latlng.lng == lnt){
                console.log(markersArray[i]);
                markersArray[i].openPopup();
            }
        }
    }
}
// clickResult();
// if( el.hasChildNodes() ) {
//     for (var i = 0; i < el.childNodes.length; i++) {
  
//       // nodeType === 1 代表為實體 HTML 元素
//       if( el.childNodes[i].nodeType === 3 ){
//         el.childNodes[i].addEventListener('click', function(){
//          console.log('點到');
//         }, false);
//       }
  
//     }
//   }

function putTownData(){
    console.log("到鄉鎮資料");
    for(let i = 0; i<taiwancity.data.length ; i++){
        if(selectCountry.value == taiwancity.data[i].city){
            console.log('縣市符合')
            selectTown.innerHTML = "";
            for(let j =0; j<taiwancity.data[i].town.length ; j++){
                console.log('開始迴圈印option')
                var str = `
                <option value="${ taiwancity.data[i].town[j]}" selected>${ taiwancity.data[i].town[j]}</option>
                `
                console.log(str);
                selectTown.innerHTML += str;
            }
        }
    }
}
function menuCollapse(){
    if(menu.getAttribute("class") == "menu"){
        menu.setAttribute('class', 'menu menu--close');
        menuCollapseBtn.innerHTML = ">"
    }else{
        menu.setAttribute('class', 'menu');
        menuCollapseBtn.innerHTML = "<"
    }
}

function loadingImg(swtich){
    var loadingImage = document.createElement("img");//建立一個img標籤，因為是document物件的方法。
    if(swtich == "start"){
        console.log("載入圖片");
        loadingImage.src = "images/loading.svg"
        loadingImage.id = "loadingImage"
        menu.appendChild(loadingImage);//父級.appendChild(子節點);在div元素中新增“666”
    }else{
        console.log("取消圖片");
        let loadingImage = document.getElementById('loadingImage');
        menu.removeChild(loadingImage);
    }
}