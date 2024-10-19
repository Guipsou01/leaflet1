const map = L.map('map').setView([0, 0], 13).setZoom(2);
var tiles = null;
var imageEvent;
function marker(x,y,lx,ly,iconUrl, description){
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
  var greenIcon = L.icon({
  iconUrl,
  //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
  iconSize:     [lx, ly], // size of the icon, 38;95 pour la feuille
  iconAnchor:   [lx / 2, ly / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
  });
  return L.marker([convertToFloat(y), convertToFloat(x)], {icon: greenIcon, interactive: false}).addTo(map);
}
function image3p(x1,y1,x2,y2,x3,y3,imageUrl, dataa){
  var point1 = L.latLng(convertToFloat(y1), convertToFloat(x1)),
  point2 = L.latLng(convertToFloat(y2), convertToFloat(x2)),
  point3 = L.latLng(convertToFloat(y3), convertToFloat(x3));
  var	bounds = new L.LatLngBounds(point1, point2).extend(point3);
  map.fitBounds(bounds);
  imageEvent = L.imageOverlay.rotated(imageUrl, point1, point2, point3, { 
    opacity: 1,
    interactive: true,
    data: dataa,
    attribution: "Historical building plan &copy; <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>"
  });
  //map.addLayer(overlay);
  testEvent();
  imageEvent.addTo(map);
}
function image(x1,y1,x2,y2, imageUrl, dataa){
  x1 = convertToFloat(x1);
  y1 = convertToFloat(y1);
  x2 = convertToFloat(x2);
  y2 = convertToFloat(y2);
  var imageBounds3 = [[y1, x1], [y2, x2]];
  imageEvent = L.imageOverlay(imageUrl, imageBounds3, {
    interactive: true,
    data: dataa,
  });
  testEvent();
  imageEvent.addTo(map);
}
function testEvent(){
  //if(imageEvent != null){
  imageEvent.on('load', function() {
    //console.log("img: Image ok");
  });
  imageEvent.on('error', function() {
    //console.log("img: Image erreur");
  });
  //}
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
    resetSelector();
    map.eachLayer(function(layer) {
      if (layer instanceof L.ImageOverlay && layer.options.data) {
        var points = layer.options.data;
        //console.log("imagesDetecte");
        //
        if(pointDansCarre(e.latlng.lng,e.latlng.lat,points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7])){
          updateImageFocus(layer);//peut en select plusieurs en un click, le dernier sera gardé
        }
      }
    });
    actionImageFocus();
});
function convertToFloat(nb){
    nb = String(nb);
    nb = nb.replace(',','.');
    return parseFloat(nb);
};

function popup(x, y, content){
  L.popup()
  .setLatLng(L.latLng(x,y))  // Positionner le pop-up à l'endroit du clic
  .setContent(content)  // Contenu du pop-up
  .openOn(map);  // Ouvrir le pop-up sur la carte
}

