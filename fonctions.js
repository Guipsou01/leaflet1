const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA'; // Replace with your API key
//const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; // Replace with your spreadsheet ID
const spreadsheetId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; // Replace with your spreadsheet ID
//const sheetName = 'Leaflet-MarioWorld'; // Replace with your sheet name
const sheetName = 'MAP'; // Replace with your sheet name
var array = [];
var tiles = null;
var mouseLat = 0;
var mouseLng = 0;

async function corps(){
    //initialisation map leaflet
    const map = L.map('map').setView([0, 0], 13);
    map.setZoom(2);
    //requette et enregistrement donnees google 
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`)//fetch: récuperation de ressource depuis un serveur
        if (!response.ok) {throw new Error(`Response status: ${response.status}`);}
        const json = await response.json();
        array = json.values;
    } catch (error) {console.error("Error:", error);}
    //traitement donnees google
    for (const lignes of array) {
      switch(lignes[0]){
        case 'MARKER':
          //console.log(lignes);
          (function(){
            var imgSize = new Image();
            var x = lignes[1];
            var y = lignes[2];
            var lx = lignes[3];
            var imgDesc = lignes[5];
            var ly = 0;
            imgSize.src = lignes[4];
            imgSize.onload = function() {
              ly = imgSize.height / imgSize.width * lx;
              marker(x,y,lx,ly,imgSize.src,imgDesc);
            }
          }());
        break;
        case 'TILEMAP-DEFAULT':
          tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });
        break;
        case 'IMG-LX':
          (function(){
            var imgSize = new Image();
            var x = lignes[1];
            var y = lignes[2];
            var lx = lignes[3];
            var ly = 0;
            imgSize.src = lignes[4];
            imgSize.onload = function() {
              ly = imgSize.height / imgSize.width * lx;
              ly = ly;
              image(x,y,x + lx,y + ly,imgSize.src);
            }
          }());
        break;
        case 'IMG-LX-CENTER':
          (function(){
            var imgSize = new Image();
            var x = convertToFloat(lignes[1]);
            var y = convertToFloat(lignes[2]);
            var lx = convertToFloat(lignes[3]);
            var ly = convertToFloat(0);
            imgSize.src = lignes[4];
            imgSize.onload = function() {
              ly = imgSize.height / imgSize.width * lx;
              console.log("x1: " + (x - lx / 2));
              console.log("y1: " + (y - ly / 2));
              console.log("x2: " + (x + lx / 2));
              console.log("y2: " + (y + ly / 2));
              image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src);
            }
          }());
        break;
        case 'IMG-PLR':
          //
          var x1 = lignes[1];
          var y1 = lignes[2];
          var lx = lignes[3];
          var ly = lignes[4];
          var angle = lignes[5];
          //
          //
          var x2modif = lx * Math.cos(degToRad(angle));
          var y2modif = lx * Math.sin(degToRad(angle));
          var x3modif = ly * Math.cos(degToRad(angle + 90));
          var y3modif = ly * Math.sin(degToRad(angle + 90));
          //
          marker(x1,y1,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
          image3p(x1 + x3modif + x2modif,y1 + y3modif + y2modif,x1 + x3modif,y1 + y3modif,x1 + x2modif,y1 + y2modif,"https://media.tenor.com/ejmDdRGqKDUAAAAe/terminal-montage-donkey-kong.png");
          //
        break;
        case 'IMG-LX-CENTER-R':
          (function(){
            var imgSize = new Image();
            var x1 = convertToFloat(lignes[1]);
            var y1 = convertToFloat(lignes[2]);
            var lx = convertToFloat(lignes[3]);
            var angle = convertToFloat(lignes[4]);
            var ly = convertToFloat(0);
            imgSize.src = lignes[5];
            imgSize.onload = function() {
              ly = imgSize.height / imgSize.width * lx;
              //image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src);
              var x2modif = lx * Math.cos(degToRad(angle));
              var y2modif = lx * Math.sin(degToRad(angle));
              var x3modif = ly * Math.cos(degToRad(angle + 90));
              var y3modif = ly * Math.sin(degToRad(angle + 90));
              var x2P = x1 + x3modif + x2modif;
              var y2P = y1 + y3modif + y2modif;
              var x3P = x1 + x3modif;
              var y3P = y1 + y3modif;
              var x4P = x1 + x2modif;
              var y4P = y1 + y2modif;
              image3p(x3P + average(x1,x2P,x3P,x4P) - x2P ,y3P + average(y1,y2P,y3P,y4P) - y2P,x2P + average(x1,x2P,x3P,x4P) - x2P,y2P + average(y1,y2P,y3P,y4P) - y2P,x1 + average(x1,x2P,x3P,x4P) - x2P,y1 + average(y1,y2P,y3P,y4P) - y2P,imgSize.src);
              //marker(x2P + average(x1,x2P,x3P,x4P) - x2P,y2P + average(y1,y2P,y3P,y4P) - y2P,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
              //marker(x3P + average(x1,x2P,x3P,x4P) - x2P,y3P + average(y1,y2P,y3P,y4P) - y2P,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
              //marker(x4P + average(x1,x2P,x3P,x4P) - x2P,y4P + average(y1,y2P,y3P,y4P) - y2P,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
              //marker(x1 + average(x1,x2P,x3P,x4P) - x2P,y1 + average(y1,y2P,y3P,y4P) - y2P,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
            }
          }());
        break;
        default:
        break;
      }
    }
    //souris
  
    // Exécuter cette fonction chaque fois que la variable est mise à jour
    map.on('mousemove', function(e) {
      mouseLat = e.latlng.lat; // valeur du textue
      mouseLng = e.latlng.lng; 
      //maj du texte
      const texte = document.getElementById('texteSuivant');
      texte.innerHTML = `${mouseLng.toFixed(3)} : ${mouseLat.toFixed(3)}`;
      //
      texte.style.left = e.originalEvent.pageX + 'px';//position du texte
      texte.style.top = e.originalEvent.pageY + 'px';
    });
    //
    if(tiles != null) tiles.addTo(map);
    //
    //
    //fonctions diverses
    function convertToFloat(nb){
        nb = String(nb);
        nb = nb.replace(',','.');
        console.log("conversion: " + nb);
        return parseFloat(nb);
    };
    function degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    function image(x1,y1,x2,y2, imageUrl){
        console.log("imageurl: " + imageUrl);
        x1 = convertToFloat(x1);
        x2 = convertToFloat(x2);
        y1 = convertToFloat(y1);
        y2 = convertToFloat(y2);
        var imageBounds3 = [[y1, x1], [y2, x2]];
        L.imageOverlay(imageUrl, imageBounds3).addTo(map);
    }
    function image3p(x1,y1,x2,y2,x3,y3,imageUrl){
      var point1 = L.latLng(convertToFloat(y1), convertToFloat(x1)),
      point2 = L.latLng(convertToFloat(y2), convertToFloat(x2)),
      point3 = L.latLng(convertToFloat(y3), convertToFloat(x3));
      var	bounds = new L.LatLngBounds(point1, point2).extend(point3);
      map.fitBounds(bounds);
      var overlay = L.imageOverlay.rotated(imageUrl, point1, point2, point3, { 
        opacity: 1,
        interactive: true,
        attribution: "Historical building plan &copy; <a href='http://www.ign.es'>Instituto Geográfico Nacional de España</a>"
      });
      map.addLayer(overlay);
    }
    function marker(x,y,lx,ly,iconUrl, description){
        var greenIcon = L.icon({
        iconUrl,
        //shadowUrl:    'https://cdn.pixilart.com/photos/large/d26d92d3649555f.png',
        iconSize:     [lx, ly], // size of the icon, 38;95 pour la feuille
        iconAnchor:   [lx / 2, ly / 2], // point of the icon which will correspond to marker's location, 22;94 pour la feuille
        popupAnchor:  [0, -ly / 2] // point from which the popup should open relative to the iconAnchor, -3;-76 pour la feuille
        });
        L.marker([convertToFloat(y), convertToFloat(x)], {icon: greenIcon}).addTo(map).bindPopup(description);
    }
    function average(a, b, c, d){
      return ((a + b + c + d) / 4);
    };
}
