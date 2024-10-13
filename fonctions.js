const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA'; // Replace with your API key
const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; // Replace with your spreadsheet ID
const sheetName = 'Leaflet-MarioWorld'; // Replace with your sheet name
var array = [];
var tiles = null;

async function corps(){
    //initialisation map leaflet
    const map = L.map('map').setView([0, 0], 13);
    map.setZoom(2);
    //requette et enregistrement donnees google 
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`)//fetch: récuperation de ressource depuis un serveur
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        //const result = await response.json();
        //console.log("Success:", result);
        //for (const letter of result) {
        const json = await response.json();
        array = json.values;
        //} // "a" "b" "c" "d" "e"
    } catch (error) {
        console.error("Error:", error);
    }
    //clique
    map.on('click', function(e){
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;
        console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
    });
    //traitement donnees google
    for (const lignes of array) {
        if(lignes[0] === 'MARKER'){
            console.log(lignes);
            (function(){
              var imgSize = new Image();
              var x = lignes[1];
              var y = lignes[2];
              var lx = lignes[3];
              var imgDesc = lignes[5];
              var ly = 0;
              imgSize.src = lignes[4];
              imgSize.onload = function() {
                //var width = imgSize.width;
                //var height = imgSize.height;
                //image(lignes[1],lignes[2],lignes[3],lignes[3],lignes[4]);
                ly = imgSize.height / imgSize.width * lx;
                marker(x,y,lx,ly,imgSize.src,imgDesc);
              }
            }());
            //marker(lignes[1],lignes[2],38,95,lignes[3],lignes[4]);
          }
          else if(lignes[0] === 'TILEMAP-DEFAULT'){
            tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
          }
          else if(lignes[0] === 'IMG-LX'){
            (function(){
              var imgSize = new Image();
              var x = lignes[1];
              var y = lignes[2];
              var lx = lignes[3];
              var ly = 0;
              imgSize.src = lignes[4];
              imgSize.onload = function() {
                //var width = imgSize.width;
                //var height = imgSize.height;
                //image(lignes[1],lignes[2],lignes[3],lignes[3],lignes[4]);
                ly = imgSize.height / imgSize.width * lx;
                ly = ly;
                image(x,y,x + lx,y + ly,imgSize.src);
              }
            }());
          }
          else if(lignes[0] === 'IMG-LX-CENTER'){
            (function(){
              var imgSize = new Image();
              var x = convertToFloat(lignes[1]);
              var y = convertToFloat(lignes[2]);
              var lx = convertToFloat(lignes[3]);
              var ly = convertToFloat(0);
              imgSize.src = lignes[4];
              imgSize.onload = function() {
                //var width = imgSize.width;
                //var height = imgSize.height;
                //image(lignes[1],lignes[2],lignes[3],lignes[3],lignes[4]);
                ly = imgSize.height / imgSize.width * lx;
                console.log("x1: " + (x - lx / 2));
                console.log("y1: " + (y - ly / 2));
                console.log("x2: " + (x + lx / 2));
                console.log("y2: " + (y + ly / 2));
                image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src);
              }
            }());
          }
    }
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
        var point1 = L.latLng(y1, x1),
        point2 = L.latLng(y2, x2),
        point3 = L.latLng(y3, x3);
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
    };
}
