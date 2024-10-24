const map = L.map('map').setView([0, 0], 13).setZoom(2);
var tiles = null;
var imageEvent;
var popupSelect;
var isHolding = false;
var disableClick = false;
var mouseLat = 0;
var mouseLng = 0;

function marker(x,y,lx,ly,iconUrl, description){
  //console.log("insertion marker "+ description + "...");
  var greenIcon = L.icon({
  iconUrl,
  //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
  iconSize:     [lx, ly], // size of the icon, 38;95 pour la feuille
  iconAnchor:   [lx / 2, ly / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
  popupAnchor:  [0, -ly / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
  });
  return L.marker([convertToFloat(y), convertToFloat(x)], {icon: greenIcon}).addTo(map).bindPopup(description);
}
function markerStatic(x,y,lx,ly,iconUrl){
  //console.log("insertion marker static "+iconUrl+"...");
  var greenIcon = L.icon({
  iconUrl,
  //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
  iconSize:     [lx, ly], // size of the icon, 38;95 pour la feuille
  iconAnchor:   [lx / 2, ly / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
  });
  return L.marker([convertToFloat(y), convertToFloat(x)], {icon: greenIcon, interactive: false}).addTo(map);
}
async function image3p(imageUrl, dataa){
  return new Promise((resolve, reject) => {
    //console.log("insertion image "+dataa[10]+"...");
    var point1 = L.latLng(convertToFloat(dataa[5]), convertToFloat(dataa[4])),
    point2 = L.latLng(convertToFloat(dataa[7]), convertToFloat(dataa[6])),
    point3 = L.latLng(convertToFloat(dataa[3]), convertToFloat(dataa[2]));
    //var	bounds = new L.LatLngBounds(point1, point2).extend(point3);
    //map.fitBounds(bounds);
    imageEvent = L.imageOverlay.rotated(imageUrl, point1, point2, point3, { 
      opacity: 1,
      interactive: true,
      data: dataa,
    });
    imageEvent.on('load', function() {
      resolve();
    });
    imageEvent.on('error', function() {
      //console.error('Erreur lors du chargement de l\'image ' + dataa[10]);
      //reject(new Error("Échec du chargement de l'image"));
      marker(x1,y1,10,10,unfound_img,"Image " + image.src + " not found, check URL");
      resolve();
    });
    if(imageEvent == null) console.error("ah");
    imageEvent.addTo(map);
  });
}
async function image(imageUrl, dataa){
  return new Promise((resolve, reject) => {
    //console.log("insertion image "+dataa[10]+"...");
    x1 = convertToFloat(dataa[0]);
    y1 = convertToFloat(dataa[1]);
    x2 = convertToFloat(dataa[4]);
    y2 = convertToFloat(dataa[5]);
    var imageBounds3 = [[y1, x1], [y2, x2]];
    imageEvent = L.imageOverlay(imageUrl, imageBounds3, {
      interactive: true,
      data: dataa,
    });
    imageEvent.on('load', function() {
      //console.log('Image chargée');
      resolve();
    });
    imageEvent.on('error', function() {
      //console.error('Erreur lors du chargement de l\'image ' + dataa[10]);
      //reject(new Error("Échec du chargement de l'image"));
      marker(x1,y1,10,10,unfound_img,"Image " + image.src + " not found, check URL");
      resolve();
    });
    imageEvent.addTo(map);
    if(imageEvent == null) console.error("ah");
  });
}
function changePosImage3P(x1,y1,imageOverlay){
  var points = imageFocus.options.data;
  var moveX = mouseLng - points[8];
  var moveY = mouseLat - points[9];
  console.log("move!");
  imageFocus.options.data[0] = points[0] + moveX;
  var px1 = imageFocus.options.data[0];
  imageFocus.options.data[1] = points[1] + moveY;
  var py1 = imageFocus.options.data[1];
  imageFocus.options.data[2] = points[2] + moveX;
  imageFocus.options.data[3] = points[3] + moveY;
  imageFocus.options.data[4] = points[4] + moveX;
  var px2 = imageFocus.options.data[4];
  imageFocus.options.data[5] = points[5] + moveY;
  var py2 = imageFocus.options.data[5];
  imageFocus.options.data[6] = points[6] + moveX;
  imageFocus.options.data[7] = points[7] + moveY;
  imageFocus.options.data[8] = points[8] + moveX;
  imageFocus.options.data[9] = points[9] + moveY;
  imageOverlay.setBounds([[py1, px1], [py2, px2]]);
  //changeSelectorPos();
  changeSelectorPos(points[8],points[9],points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);
}
// Exécuter cette fonction chaque fois que la variable est mise à jour
map.on('mousemove', function(e) {
  const texte = document.getElementById('texteSuivant');
  mouseLat = e.latlng.lat; // valeur du textue
  mouseLng = e.latlng.lng; 
  //maj du texte
  texte.innerHTML = `${mouseLng.toFixed(3)} : ${mouseLat.toFixed(3)}`;
  //
  texte.style.color = 'white';
  texte.style.left = e.originalEvent.pageX + 20 + 'px';//position du texte
  texte.style.top = e.originalEvent.pageY - 10 + 'px';
  //
  //getOverlayRotatedParams();
});
function insertTile(){
  tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
}
function tileTrace(){
  if(tiles != null) tiles.addTo(map);
}
map.on('click', function(e) {
  if(disableClick == false){
    var layerFin;
    resetSelector();
    map.eachLayer(function(layer) {
      if (layer instanceof L.ImageOverlay && layer.options.data) {
        var points = layer.options.data;
        //console.log("imagesDetecte");
        //
        if(pointDansCarre(e.latlng.lng,e.latlng.lat,points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7])){
          layerFin = layer;//peut en select plusieurs en un click, le dernier sera gardé
        }
      }
    });
    actionImageFocus(layerFin);
  }
  else disableClick = false;
});
map.on('mousedown', function(e){
  isHolding = true; // Fin de l'appui
  holdInterval = setInterval(function() {
    //console.log("Bah!");
    mushroomSelectorMouseHold();
  }, 100); // Vérifie toutes les 100 ms
});
map.on('mouseup', function(e) {
  isHolding = false; // Fin de l'appui
  if(isHolding2) disableClick = true;
  isHolding2 = false;
  //console.log("Relache");
  map.dragging.enable();
  clearInterval(holdInterval); // Stopper l'intervalle
});
function convertToFloat(nb){
    nb = String(nb);
    nb = nb.replace(',','.');
    return parseFloat(nb);
};

function popup(x, y, content){
  popupSelect = L.popup()
  .setLatLng(L.latLng(y,x))  // Positionner le pop-up à l'endroit du clic
  .setContent(content)  // Contenu du pop-up
  .openOn(map);  // Ouvrir le pop-up sur la carte
}
