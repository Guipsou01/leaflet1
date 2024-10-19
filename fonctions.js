//const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; // Replace with your spreadsheet ID
//const sheetName = 'Leaflet-MarioWorld'; // Replace with your sheet name
const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA'; // Replace with your API key
const spreadsheetId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; // Replace with your spreadsheet ID
const sheetName = 'MAP'; // Replace with your sheet name
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var array = [];
var mouseLat = 0;
var mouseLng = 0;
var rgImgSelect = 0;
var customButton;

async function corps(){
  //initialisation map leaflet
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
            leaflet.marker(x,y,lx,ly,imgSize.src,imgDesc);
          }
        }());
      break;
      case 'TILEMAP-DEFAULT':
        insertTile();
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
            image(x,y,x + lx,y + ly,imgSize.src,"");
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
          imgSize.src = lignes[6];
          imgSize.onload = function() {
            ly = imgSize.height / imgSize.width * lx;
            //[x - lx / 2,y - ly / 2,x + lx / 2,y - ly / 2,x + lx / 2,y + ly / 2,x - lx / 2,y + ly / 2,x,y]
            //[x - lx / 2,y + ly / 2,x + lx / 2,y + ly / 2,x + lx / 2,y - ly / 2,x - lx / 2,y - ly / 2,x,y]
            image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src, [x - lx / 2,y + ly / 2,x + lx / 2,y + ly / 2,x + lx / 2,y - ly / 2,x - lx / 2,y - ly / 2,x,y,lignes[7],lignes[8],lignes[9]]);
          }
          imgSize.onerror = function() {
            //console.log("img: Image erreur");
            marker(x,y,10,10,unfound_img,"Image " + imgSize.src + " not found, check URL");
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
        var x2modif = lx * Math.cos(degToRad(angle));
        var y2modif = lx * Math.sin(degToRad(angle));
        var x3modif = ly * Math.cos(degToRad(angle + 90));
        var y3modif = ly * Math.sin(degToRad(angle + 90));
        //
        marker(x1,y1,10,10,"origine","https://leafletjs.com/examples/custom-icons/leaf-green.png");
        image3p(x1 + x3modif + x2modif,y1 + y3modif + y2modif,x1 + x3modif,y1 + y3modif,x1 + x2modif,y1 + y2modif,"https://media.tenor.com/ejmDdRGqKDUAAAAe/terminal-montage-donkey-kong.png",0);
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
          imgSize.src = lignes[6];
          imgSize.onload = function() {
            ly = imgSize.height / imgSize.width * lx;
            //image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src);
            //calcul des nouvelles positions des trois coins
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
            var x1F = x1 + average(x1,x2P,x3P,x4P) - x2P;
            var y1F = y1 + average(y1,y2P,y3P,y4P) - y2P;
            var x2F = x3P + average(x1,x2P,x3P,x4P) - x2P;
            var y2F = y3P + average(y1,y2P,y3P,y4P) - y2P;
            var x3F = x2P + average(x1,x2P,x3P,x4P) - x2P;
            var y3F = y2P + average(y1,y2P,y3P,y4P) - y2P;
            var x4F = x4P + average(x1,x2P,x3P,x4P) - x2P;
            var y4F = y4P + average(y1,y2P,y3P,y4P) - y2P;
            image3p(x2F,y2F,x3F,y3F,x1F,y1F,imgSize.src, [x1F,y1F,x2F,y2F,x3F,y3F,x4F,y4F,x1,y1,lignes[7],lignes[8],lignes[9]]);
          }
          imgSize.onerror = function() {
            //console.log("L'image n'a pas pu être chargée. L'URL ne semble pas contenir une image valide.");
            marker(x1,y1,100,100,"https://mario.wiki.gallery/images/8/8b/SuperMushroom_-_2D_art.svg","L'image n'est pas reconnue, vérifiez l'URL");
          }
        }());
      break;
      default:
      break;
    }
  }
  initSelector();
  tileTrace();
  //fonctions diverses
  function degToRad(degrees) {
      return degrees * (Math.PI / 180);
  }
  function average(a, b, c, d){
    return ((a + b + c + d) / 4);
  };
}
