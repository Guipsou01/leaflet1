//const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; // Replace with your spreadsheet ID
var sheetNameFocus; // Replace with your sheet name
const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA'; // Replace with your API key
const spreadsheetId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; // Replace with your spreadsheet ID
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var mouseLat = 0;
var mouseLng = 0;
var rgImgSelect = 0;
var customButton;
var editMode = false;
var fenetreModale = document.getElementById("fenetreModaleId");
var btnModal = document.getElementById("btnModalId");
var croixModal = document.getElementsByClassName("croixModalId")[0];
var lienObj = document.getElementById("lienDynamique");
var lienTxt = "https://docs.google.com/spreadsheets/d/" + spreadsheetId;
var btnEditor = document.getElementById("btnEditor");
var btnEditorContent = document.getElementById("btnEditorContent");
var btnMaps = document.getElementById('btnMaps');
var btnMapsList = document.getElementById('btnMapsList');
var sheetNames = [];

async function corps(){
  initSelector();
  //initialisation map leaflet
  //requette et enregistrement donnees google 
  lienObj.href = lienTxt; // Assigner le lien à l'attribut href
  lienObj.textContent = lienTxt; // Mettre à jour le texte affiché pour correspondre au lien
  btnEditorContent.textContent = "Editor (off)";
  btnMaps.textContent = "Loading...";
  //recuperation du nom des feuilles du tableau
  await getNomFeuilles();
  //traitement donnees google
  resetAllMapContent();
}
async function resetAllMapContent(){
  //desactivation bouton reset
  btnMaps.disabled = true;
  //récupération des données de la feuille google visée
  try{
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetNameFocus}?key=${apiKey}`)//fetch: récuperation de ressource depuis un serveur
    if (!response.ok) {throw new Error(`Response status: ${response.status}, ${sheetNameFocus}`);}
    const json = await response.json();
    var donneesLeafletUnOnglet = json.values;
  } catch (error) {console.error("Error:", error);}
  deleteAllContent();
  //traitement donnees google
  for (const lignes of donneesLeafletUnOnglet) {
    await traitementLigne(lignes);
  }
  //activation bouton reset
  btnMaps.disabled = false;
}
async function traitementLigne(lignes){
  return new Promise((resolve, reject) => {
    //console.log("traitement ligne " + lignes + "...")
    var retour = null;
    var imagePtee = null;
    //console.log(lignes[0]);
    switch(lignes[0]){
      case 'MARKER':
        (function(){
          imagePtee = new Image();
          var x = lignes[1];
          var y = lignes[2];
          var lx = lignes[3];
          var imgDesc = lignes[5];
          var ly = 0;
          imagePtee.src = lignes[4];
          imagePtee.onload = function() {
            ly = imagePtee.height / imagePtee.width * lx;
            marker(x,y,lx,ly,imagePtee.src,imgDesc);
          }
        }());
        resolve();
      break;
      case 'TILEMAP-DEFAULT':
        insertTile();
        resolve();
      break;
      case 'IMG-LX':
        (function(){
          imagePtee = new Image();
          var x = lignes[1];
          var y = lignes[2];
          var lx = lignes[3];
          var ly = 0;
          imagePtee.src = lignes[4];
          imagePtee.onload = async function() {
            ly = imagePtee.height / imagePtee.width * lx;
            ly = ly;
            await image(x,y,x + lx,y + ly,imagePtee.src,"");
          }
        }());
      break;
      case 'IMG-LX-CENTER':
        (function(){
          imagePtee = new Image();
          var x1 = convertToFloat(lignes[1]);
          var y1 = convertToFloat(lignes[2]);
          var lx = convertToFloat(lignes[3]);
          var ly = convertToFloat(0);
          imagePtee.src = lignes[6];
          //console.log(lignes[7]);
          imagePtee.onload = async function() {
            ly = imagePtee.height / imagePtee.width * lx;
            //[x - lx / 2,y - ly / 2,x + lx / 2,y - ly / 2,x + lx / 2,y + ly / 2,x - lx / 2,y + ly / 2,x,y]
            //[x - lx / 2,y + ly / 2,x + lx / 2,y + ly / 2,x + lx / 2,y - ly / 2,x - lx / 2,y - ly / 2,x,y]
            //p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y,pRefx,pRefy,title,author,website,imageSizeX,imageSizeY,imageLx,imageLy
            //BG,BD,HD,HG
            await image(imagePtee.src, [x1 - lx/2,y1 - ly/2,x1 + lx/2,y1 - ly/2,x1 + lx / 2,y1 + ly / 2,x1 - lx/2,y1 + ly/2,x1,y1,lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly]);
            retour = imagePtee;
            //console.log("retour ok");
            resolve();
          };
          imagePtee.onerror = function() {
            // Si l'image n'est pas valide
            //console.log(lignes[7] + " AAAA");
            marker(x1,y1,10,10,unfound_img,"Image " + lignes[7] + " not found, check URL");
            resolve();
          };
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
          imagePtee = new Image();
          var x1 = convertToFloat(lignes[1]);
          var y1 = convertToFloat(lignes[2]);//execute en tant que coin BG
          var lx = convertToFloat(lignes[3]);
          var angle = convertToFloat(lignes[4]);
          //console.trace("angle: " + angle + " " + lignes[7])
          var ly = convertToFloat(0);
          imagePtee.src = lignes[6];
          imagePtee.onload = async function() {
            //angle = 0;
            ly = imagePtee.height / imagePtee.width * lx;
            //image((x - lx/2),(y - ly / 2),(x + lx / 2),(y + ly / 2),imgSize.src);
            //calcul des nouvelles positions des trois coins BD, HD, HG depuis la valeur d'angle
            var posAx = lx * Math.cos(degToRad(angle));
            var posAy = lx * Math.sin(degToRad(angle));
            var posBx = ly * Math.cos(degToRad(angle + 90));
            var posBy = ly * Math.sin(degToRad(angle + 90));
            //application des nouvelles positions (seul x1 et y1 ne bouge pas)
            var x2P = x1 + posAx;
            var y2P = y1 + posAy;
            var x3P = x1 + posAx + posBx;
            var y3P = y1 + posAy + posBy;
            var x4P = x1 + posBx;
            var y4P = y1 + posBy;
            //modification de l'image par rapport au mode de placement de point de base
            var x1F = x1 - (average(x1,x2P,x3P,x4P) - x1);
            var y1F = y1 - (average(y1,y2P,y3P,y4P) - y1);
            var x2F = x2P - (average(x1,x2P,x3P,x4P) - x1);
            var y2F = y2P - (average(y1,y2P,y3P,y4P) - y1);
            var x3F = x3P - (average(x1,x2P,x3P,x4P) - x1);
            var y3F = y3P - (average(y1,y2P,y3P,y4P) - y1);
            var x4F = x4P - (average(x1,x2P,x3P,x4P) - x1);
            var y4F = y4P - (average(y1,y2P,y3P,y4P) - y1);
            //p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y,pRefx,pRefy,title,author,website,imageSizeX,imageSizeY,imageLx,imageLy
            await image3p(imagePtee.src, [x1F,y1F,x2F,y2F,x3F,y3F,x4F,y4F,x1,y1,lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly, angle]);
            //console.log("retour ok");
            resolve();
          }
          imagePtee.onerror = function() {
            marker(x1,y1,10,10,unfound_img,"Image " + lignes[7] + " not found, check URL");
            resolve();
          };
        }());
        retour = imagePtee;
      break;
      default:
        resolve();
      break;
    }
    if(retour != null){}
    return retour;
  });
}
  //fenetre modale
  btnModal.onclick = function() {
    fenetreModale.style.display = "block";
    contenuModale.textContent = texteDynamique;
}
croixModal.onclick = function() {
    fenetreModale.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == fenetreModale) {
        fenetreModale.style.display = "none";
    }
}
//fonctions diverses
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}
function average(a, b, c, d){
  return ((a + b + c + d) / 4);
};
btnEditor.onclick = function() {
  if(editMode == true) {
    editMode = false;
    updateSelector();
    btnEditorContent.textContent = "Editor (off)";
  }
  else if(editMode == false) {
    editMode = true;
    updateSelector();
    btnEditorContent.textContent = "Editor (on)";
  }
}

async function getNomFeuilles() {
  //capturer le document google
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const donneesGoogle = await response.json();
    sheetNames = donneesGoogle.sheets.map(sheet => sheet.properties.title).filter(item => item.startsWith("Leaflet-"));
    if(sheetNames.length === 0) sheetNames[0] = "Google sheets tab is missing";
    sheetNameFocus = sheetNames[0];
    createSelector();
  } catch (erreur) {
    console.error("Erreur dans le chargement google sheets:", erreur);
    throw erreur;
  }
}

function createSelector(){
  btnMapsList.innerHTML = '';

  btnMaps.textContent = sheetNameFocus;
  sheetNames.forEach(option => {
    const link = document.createElement('a');
    link.href = "#";
    link.textContent = option;
    link.onclick = function(event) {
      event.preventDefault(); // Empêche le comportement par défaut du lien
      btnMaps.textContent = option; // Mettre à jour le texte du bouton
      btnMapsList.style.display = 'none'; // Masquer la liste après sélection
      sheetNameFocus = option;
      resetAllMapContent();
    };
    btnMapsList.appendChild(link); // Ajouter le lien à la liste
  });
  btnMaps.onclick = function() {
    btnMapsList.style.display = btnMapsList.style.display === 'none' ? 'block' : 'none';
  };
  // Fermer la liste déroulante quand on clique en dehors
  window.onclick = function(event) {
    if (!event.target.matches('#btnMaps')) {
      btnMapsList.style.display = 'none';
    }
  };
}
