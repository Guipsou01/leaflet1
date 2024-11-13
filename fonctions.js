//FICHIER REGROUPANT LES FONCTIONS GENERALES AU PROGRAMME
//const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; //Mario Games / Maps / Locations
const spreadsheetId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; //MARIO MAP TEST
const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA';
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var sheetNameFocus;
var mouseLat = 0;
var mouseLng = 0;
var mouseLngLastState = 0;
var rgImgSelect = 0;
var customButton;
var fenetreModale = document.getElementById("fenetreModaleId");
var btnModal = document.getElementById("btnModalId");
var croixModal = document.getElementsByClassName("croixModalId")[0];
var lienObj = document.getElementById("lienDynamique");
var lienTxt = "https://docs.google.com/spreadsheets/d/" + spreadsheetId;
var btnEditor = document.getElementById("btnEditor");
var btnEditorContent = document.getElementById("btnEditorContent");
var btnMaps = document.getElementById('btnMaps');
var btnMapsList = document.getElementById('btnMapsList');
var btnMapsLock = false;
var sheetNames = [];//nom des onglets
var objlistGoogle = [];//liste de tous les objets de la liste google (comprend les fonctions dans leur état le plus simple)
var objListLeaflet = [];//liste de tout les objets affichable dans leaflet (sans restrictions graphiques) (data, obj, rang, isActif)
var texteCharg = 0;
var mush = new MushroomSelector();

const MODE_LECTURE = 0;
const MODE_DEPLACEMENT = 1;
const MODE_ROTATION = 2;
const MODE_ECHELLE = 3;
const TILEMAP_DEFAULT = 0;

var mode = MODE_LECTURE;

const NULL = 1;
const MARKER = 2;
const IMAGE = 3;
const MARKER_STATIC_MS = 4;
const TEXT = 5;
const leaflet = new LeafletMap();

//MARKER: donnees = cmd,plan,"",[x,y,lx,ly],url,desc
//IMAGE:  donnees = cmd,plan,"",[pRefX,pRefy,p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y],url,title,author,website,imageSizeX,imageSizeY,imageLx,imageLy,isMipmap,angle
//TEXT:   donnees = cmd,plan,"",[pRefx,pRefy,p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y],size,text,canva

async function corps(){
  texteCharg = document.getElementById('texteInfo');
  //console.log("[initialisation] Démarrage");
  texteCharg.innerHTML = "Démarrage";
  //initialisation map leaflet
  //requette et enregistrement donnees google 
  lienObj.href = lienTxt; // Assigner le lien à l'attribut href
  lienObj.textContent = lienTxt; // Mettre à jour le texte affiché pour correspondre au lien
  btnEditorContent.textContent = "Editor (off)";
  btnMaps.textContent = "Loading...";
  //console.log("[initialisation] Recupération données onglets google (lent)...");
  texteCharg.innerHTML = "Recupération données onglets google...";
  await getNomFeuillesGoogle();
  //console.log("[initialisation] Init sélecteur...");
  texteCharg.innerHTML = "Initialisation sélecteur...";
  await createSelector();
  objlistGoogle = [];
  resetAllMapContent();
}
async function isShort(data){
  var retour = false;
  if(data[0] == IMAGE) {
    var tailleMini = 0;
    if(data[10] < data[11]) tailleMini = data[10];//si lx < ly
    else tailleMini = data[11];
    if((((await leaflet.getMapBounds()).getNorthEast().lng - (await leaflet.getMapBounds()).getSouthWest().lng) / 20) > tailleMini) retour = true;
  }
  return retour;
}
async function isBig(data){
  var retour = false;
  if(data[0] == IMAGE) {
    var tailleMaxi = 0;
    if(data[10] > data[11]) tailleMaxi = data[10];
    else tailleMaxi = data[11];
    if((((await leaflet.getMapBounds()).getNorthEast().lng - (await leaflet.getMapBounds()).getSouthWest().lng)) < tailleMaxi) {
      retour = true;
    }
  }
  return retour;
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  //desactivation bouton reset
  btnMaps.disabled = true;
  actionEnCours = ACTNULL;
  mode = MODE_LECTURE;
  btnEditorContent.textContent = "Editor (off)";
  //récupération des données de la feuille google visée
  try{
    if(rgImageFocus != -1) await mush.reset();
    var donneesGoogleUnOnglet = await getContenuTableauGoogle();
    texteCharg.innerHTML = "Suppression de tous les objets de la carte...";
    leaflet.removeAllObj(true);
    texteCharg.innerHTML = "Suppression du contenu des listes Leaflet...";
    objListLeaflet = [];
    texteCharg.innerHTML = "Remplissage du contenu des listes Google...";
    const promesses = donneesGoogleUnOnglet.map((donnee, i) => traitementLigneGoogle(donnee, i, donneesGoogleUnOnglet.length));
    await Promise.all(promesses);
    await checkDoublon();
    texteCharg.innerHTML = "Remplissage du contenu des listes Leaflet...";
    await traitementLigneGoogleSimplifiee();
    texteCharg.innerHTML = "Initialisation des données du Mushroom selector...";
    await mush.init();
    texteCharg.innerHTML = "Suppression du contenu des listes Google...";
    objlistGoogle = [];
    texteCharg.innerHTML = "Actualisation des données de la carte...";
    await leaflet.actualiseMap();
    console.log("[initialisation] Initialisation terminée...");
    texteCharg.innerHTML = "Initialisation terminée...";
    texteCharg.innerHTML = "";
    leaflet.stats();
    btnMaps.disabled = false;//activation bouton reset
  } catch (error) {console.error("Error:", error);}
}
/**Vérifie pour l'image qu'elle est tracable*/
async function calculTracabilite(rg) {
  try{
    const lignes = objListLeaflet[rg][0];//recup donnees
    var imagePosInScreenVar_ = await objectPosInScreen(lignes);//vérifie si l'objet devrait etre dans l'écran
    var isTooShort_ = await isShort(lignes);//vérifie si l'objet devrait etre affiché petit ou non
    switch (lignes[0]){
      case TILEMAP_DEFAULT:
        objListLeaflet[rg][3] = true;
      break;
      case MARKER:
          objListLeaflet[rg][3] = imagePosInScreenVar_;
      break;
      case IMAGE:
        //si dans ecran et pas un mip map
        if(imagePosInScreenVar_ == true && lignes[12] == false) objListLeaflet[rg][3] = !isTooShort_;
        //si dans ecran et mip map
        else if(imagePosInScreenVar_ == true && lignes[12] == true) objListLeaflet[rg][3] = isTooShort_;
        //si pas dans ecran
        else if(!imagePosInScreenVar_) objListLeaflet[rg][3] = false;
      break;
      case MARKER_STATIC_MS:
        //géré directement par mushroomselector ?
        if(!imagePosInScreenVar_ && objListLeaflet[rg][3] == true) await mush.reset();
      break;
      case TEXT:
        objListLeaflet[rg][3] = true;
      break;
      default:
        console.error(`Type non géré: ${lignes[0]}`);
      break;
    }
  } catch (error) {console.error("Error:", error);}
}
/**vérifie si un objet similaire éxiste dans l'écran*/
async function objectPosInScreen(data) {
       if(data[0] == TILEMAP_DEFAULT)   return true;
  else if(data[0] == IMAGE)             return (await leaflet.getMapBounds()).intersects([[data[3][7], data[3][6]], [data[3][3], data[3][2]]]);
  else if(data[0] == MARKER)            return (await leaflet.getMapBounds()).contains([data[3][1], data[3][0]]);
  else if(data[0] == MARKER_STATIC_MS)  return (await leaflet.getMapBounds()).contains([selectorPosY, selectorPosX])
  return false;
}
//============LEAFLETLIST==============
/**obtient le calque depuis les propriétés */
async function getLayerObjByData(data){
  var retour = null;
  for(var i = 0; i < objListLeaflet.length; i++){
    if(await isTwoLayerSimilarContent(objListLeaflet[i][0],data,true)) retour = objListLeaflet[i][1];
    return retour;
  }
  return retour;
}
/**cherche le rang de l'objet similaire depuis une data, -1 si non trouvé, l'état doit etre exact*/
async function objectRG(data){
  var retour = -1;
  for(var i = 0; i < objListLeaflet.length; i++){
    if(await isTwoLayerSimilarContent(objListLeaflet[i][0],data,true) == true) retour = i;
    return retour;
  }
  return retour;
}
/**cherche le rang de l'objet similaire depuis un objet, -1 si non trouvé, l'état doit etre exact, semble*/
async function objectRGByObj(obj){
  var retour = -1;
  for(var i = 0; i < objListLeaflet.length; i++){
    if(objListLeaflet[i][1] == obj) {
      retour = i;
      break;
    }
  }
  return retour;
}
//=========GOOGLE=========
/**Lecture tableau google et remplissage de la liste des commandes simplifiées
 * (lecture a l'initialisation de map)
*/
async function traitementLigneGoogle(lignes, rg, nbtot){
  //console.log("traitement nouvelle ligne");
  try{
    texteCharg.innerHTML = `Remplissage du contenu des liste Google: ${rg} / ${nbtot - 1}`;
    return new Promise((resolve) => {
      var plan = convertToFloat(lignes[10]);
      switch(lignes[0]){
        case 'TILEMAP-DEFAULT':
          objlistGoogle.push([TILEMAP_DEFAULT]);
          resolve();
        break;
        case 'MARKER':
          //IF IN SCREEN
          (function(){
            const imagePtee = new Image();
            var lx = convertToFloat(lignes[3]);
            var imgDesc = lignes[5];
            imagePtee.src = lignes[4];
            imagePtee.onload = function() {
              var ly = imagePtee.height / imagePtee.width * lx;
              objlistGoogle.push([MARKER,plan,"",[convertToFloat(lignes[1]),convertToFloat(lignes[2]),lx,ly],lignes[4],imgDesc]);
              resolve();
            }
          }());
        break;
        case 'IMG-LX-CENTER':
          (function(){
            const imagePtee = new Image();
            //imagePtee.crossOrigin = "anonymous";// bloque la plupart des images
            var x1 = convertToFloat(lignes[1]);
            var y1 = convertToFloat(lignes[2]);
            var lx = convertToFloat(lignes[3]);
            var ly = convertToFloat(0);
            imagePtee.src = lignes[6];
            imagePtee.onload = () => {
              ly = imagePtee.height / imagePtee.width * lx;
              objlistGoogle.push([IMAGE,plan,"",[x1,y1,x1 - lx/2,y1 - ly/2,x1 + lx/2,y1 - ly/2,x1 + lx / 2,y1 + ly / 2,x1 - lx/2,y1 + ly/2],lignes[6],lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly,false,null]);
              resolve();
            };
            imagePtee.onerror = function() {//image non chargee
              objlistGoogle.push([MARKER,plan,"",[x1,y1,10,10],unfound_img,"Image " + lignes[7] + " not found, check URL"]);
              resolve();
            };
          }());
        break;
        case 'IMG-LX-CENTER-R':
          (function(){
            const imagePtee = new Image();
            //imagePtee.crossOrigin = "anonymous";
            var x1 = convertToFloat(lignes[1]);
            var y1 = convertToFloat(lignes[2]);//execute en tant que coin BG
            var lx = convertToFloat(lignes[3]);
            var angle = convertToFloat(lignes[4]);
            var ly = convertToFloat(0);
            imagePtee.src = lignes[6];
            imagePtee.onload = async function() {
              ly = imagePtee.height / imagePtee.width * lx;
              var tabl = await getPosApresRotation(x1,y1,lx,ly,angle);
              objlistGoogle.push([IMAGE,plan,"",[tabl[0],tabl[1],tabl[2],tabl[3],tabl[4],tabl[5],tabl[6],tabl[7],tabl[8],tabl[9]],lignes[6],lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly, false, angle]);
              resolve();//retour ok
            }
            imagePtee.onerror = function() {//si l'image n'est pas valide
              objlistGoogle.push([MARKER,plan,"",[x1,y1,10,10],unfound_img,"Image " + lignes[7] + " not found, check URL"]);
              resolve();
            };
          }());
        break;
        case 'IMG-LX':
          (function(){
            const imagePtee = new Image();
            var x = lignes[1];
            var y = lignes[2];
            var lx = lignes[3];
            var ly = 0;
            imagePtee.src = lignes[4];
            imagePtee.onload = async function() {
              ly = imagePtee.height / imagePtee.width * lx;
              ly = ly;
              objlistGoogle.push([IMAGE,plan,"",[x,y,x + lx,y + ly],imagePtee.src,""]);
              resolve();
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
          objlistGoogle.push([IMAGE,plan,"",[""],"https://media.tenor.com/ejmDdRGqKDUAAAAe/terminal-montage-donkey-kong.png",0]);
          resolve();
          //
        break;
        case 'TEXT':
          //Convertir le texte en image
          var textImageUrl = textToImage("Itz-a-me",300,100);//pas ici
          //Définir les coordonnées pour l'image sur la carte
          var xref = convertToFloat(lignes[1]);
          var yref = convertToFloat(lignes[2]);
          var sizeTxt = convertToFloat(lignes[3]);
          //const bounds = [[dataa[2], dataa[1]], [dataa[2] + 1, dataa[1] + 4]];
          objlistGoogle.push([TEXT,plan,"",[xref, yref, xref - 1,yref - 1,xref + 1,yref - 1,xref + 1,yref + 1,xref - 1,yref + 1],sizeTxt,lignes[4],textImageUrl]);//ici?
          resolve();
        break;
        default:
          resolve();
        break;
      }
    });
  }
  catch (error) {
    console.error("Erreur dans le chargement de marqueur:", error);
    resolve(null);
    //throw erreur;
  }
}
/**traitement des commandes simplifiées et remplissage de la liste Leaflet */
async function traitementLigneGoogleSimplifiee(){
  try{
    const promesses = objlistGoogle.map(async (ligneptee, rang) => {
      var objet = null;
      var objet2 = null;
      //console.log("traitement nouvelle ligne");
      texteCharg.innerHTML = `Remplissage du contenu des listes Leaflet: ${rang} / ${objlistGoogle.length - 1}`;
      var ligneptee = objlistGoogle[rang];//liste simplifiee
           if(ligneptee[0] == TILEMAP_DEFAULT) objet = await generateTile(ligneptee);
      else if(ligneptee[0] == MARKER) objet = await generateMarker(ligneptee);
      else if(ligneptee[0] == IMAGE){
        objet = await generateImage(ligneptee);
        if(objet != null) {
          objet2 = await generateImage(await toMipMap(ligneptee));//geerate mipmap
        }
      }
      else if(ligneptee[0] == TEXT) objet = await generateText(ligneptee);
      else console.error("etat non compris:" + ligneptee);
      if(objet == null)   await objListLeaflet.push([[MARKER,convertToFloat(ligneptee[10]),"",[ligneptee[3][0],ligneptee[3][1],10,10],unfound_img,"Image " + ligneptee[7] + " not found, check URL"],objet,ligneptee[1],false]);
      if(objet != null)   await objListLeaflet.push([ligneptee, objet, ligneptee[1], false]);
      if(objet2 != null)  await objListLeaflet.push([await toMipMap(ligneptee), objet2, ligneptee[1], false]);//gestion mipmap
    });

    // Attendre que toutes les promesses soient terminées
    await Promise.all(promesses);
  } catch (error) {console.error("Error:", error);}
}
/**retourne un tableau de 10 val représentant les 5 points de l'image: pRefx,pRefy,p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y depuis le point central de l'image, ces proportions et son angle final*/
async function getPosApresRotation(x1, y1, lx, ly, angle){
  //calcul des nouvelles positions des trois coins BD, HD, HG depuis la valeur d'angle
  var posAx = lx * Math.cos(degToRad(angle));
  var posAy = lx * Math.sin(degToRad(angle));
  var posBx = ly * Math.cos(degToRad(angle + 90));
  var posBy = ly * Math.sin(degToRad(angle + 90));
  //application des nouvelles positions (seul x1 et y1 ne bouge pas)
  var x2P = posAx;
  var y2P = posAy;
  var x3P = posAx + posBx;
  var y3P = posAy + posBy;
  var x4P = posBx;
  var y4P = posBy;
  //
  x2P += x1;
  y2P += y1;
  x3P += x1;
  y3P += y1;
  x4P += x1;
  y4P += y1;
  //modification de l'image par rapport au mode de placement de point de base
  var x1F = x1 - (average(x1,x2P,x3P,x4P) - x1);
  var y1F = y1 - (average(y1,y2P,y3P,y4P) - y1);
  var x2F = x2P - (average(x1,x2P,x3P,x4P) - x1);
  var y2F = y2P - (average(y1,y2P,y3P,y4P) - y1);
  var x3F = x3P - (average(x1,x2P,x3P,x4P) - x1);
  var y3F = y3P - (average(y1,y2P,y3P,y4P) - y1);
  var x4F = x4P - (average(x1,x2P,x3P,x4P) - x1);
  var y4F = y4P - (average(y1,y2P,y3P,y4P) - y1);
  return [x1,y1,x1F, y1F, x2F, y2F, x3F, y3F, x4F, y4F];
}
/**appui sur le bouton credits */
btnModal.onclick = function() {
    fenetreModale.style.display = "block";
}
/**appui sur la croix de la fenetre modale */
croixModal.onclick = function() {
    fenetreModale.style.display = "none";
}
/**appui sur la fenetre */
window.onclick = function(event) {
    if (event.target == fenetreModale)  fenetreModale.style.display = "none";
}
/**appui sur le bouton editeur */
btnEditor.onclick = function() {
  if(mode == MODE_LECTURE) {
    mode = MODE_DEPLACEMENT;
    btnEditorContent.textContent = "Editor (move)";
  }
  else if(mode == MODE_DEPLACEMENT) {
    mode = MODE_ROTATION;
    btnEditorContent.textContent = "Editor (rotation)";
  }
  else if(mode == MODE_ROTATION) {
    mode = MODE_ECHELLE;
    btnEditorContent.textContent = "Editor (scale)";
  }
  else if(mode == MODE_ECHELLE) {
    mode = MODE_LECTURE;
    btnEditorContent.textContent = "Editor (off)";
  }
  mush.action();
}
//fonctions diverses
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}
function average(a, b, c, d){
  return ((a + b + c + d) / 4);
};
/**récupere le contenu complet de l'onglet Google focus*/
async function getContenuTableauGoogle() {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetNameFocus}?key=${apiKey}`);//fetch: récuperation de ressource depuis un serveur
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}, ${sheetNameFocus}`);
    }
    return (await response.json()).values;
  } catch (error) {console.error("Error:", error);}
}
/**récupere uniquement le nom des onglets google, update sheetNameFocus et sheetNames*/
async function getNomFeuillesGoogle() {
  try {
    if (!spreadsheetId || !apiKey) {
      console.error("SpreadsheetId ou apiKey manquant");
      return;
    }
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`);
    if (!response.ok) throw new Error(`Erreur de requête Google sheets, réponse: ${response.status}`);
    sheetNames = (await response.json()).sheets.map(sheet => sheet.properties.title).filter(item => item.startsWith("Leaflet_"));
    if(sheetNames.length == 0) sheetNames[0] = "Google sheets tab is missing";
    sheetNameFocus = sheetNames[0];
  } catch (erreur) {
    console.error("Erreur dans le chargement google sheets:", erreur);
    throw erreur;
  }
}
/** Initialisation sélecteur de maps et remplissage de la liste des maps*/
async function createSelector(){
  btnMapsList.innerHTML = '';
  btnMaps.textContent = sheetNameFocus;
  sheetNames.forEach(option => {
    const link = document.createElement('a');
    link.href = "#";
    link.textContent = option;
    link.onclick = function(event) {
      event.preventDefault(); //Empêche le comportement par défaut du lien
      btnMaps.textContent = option; //Mettre à jour le texte du bouton
      btnMapsList.style.display = 'none'; //Masquer la liste après sélection
      sheetNameFocus = option;
      resetAllMapContent();
    };
    btnMapsList.appendChild(link); //Ajouter le lien à la liste
  });
  btnMaps.onclick = function() {
    btnMapsList.style.display = btnMapsList.style.display === 'none' ? 'block' : 'none';
  };
  //Fermer la liste déroulante quand on clique en dehors
  window.onclick = function(event) {
    if (!event.target.matches('#btnMaps')) {
      btnMapsList.style.display = 'none';
    }
  };
}
/**
 * vérifie si deux objet sont similaires (vérifie le type, desc pour les markers et titre pour les images)
 * absoluteTest on = verifie si meme etat pour image (normal ou mipmaped)
 *  */
function isTwoLayerSimilarContent(layer1, layer2, isAbsoluteTest){
       if(layer1 == null || layer2 == null)                               throw new Error("objet nul: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1.length == 0 || layer2.length == 0)                       throw new Error("objet vide: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1[0] == IMAGE && layer2[0] == IMAGE){//test type, title, mipmapstyle
    if(isAbsoluteTest) return (layer1[0] == layer2[0] && layer1[5] == layer2[5] && layer1[12] == layer2[12]);
    else return (layer1[0] == layer2[0] && layer1[5] == layer2[5]);
  }
  else if(layer1[0] == MARKER && layer2[0] == MARKER)                     return (layer1[0] == layer2[0] && layer1[5] == layer2[5]);
  else if(layer1[0] == MARKER_STATIC_MS && layer2[0] == MARKER_STATIC_MS) return true;
  else return false;
}

/**Fonction pour créer une image à partir de texte*/
function textToImage(text, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // Options de style pour le texte
  context.fillStyle = 'red';
  context.font = '20px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // Dessiner le texte
  context.fillText(text, width / 2, height / 2);
  // Retourner l'URL de l'image (base64)
  return canvas.toDataURL();
}
//verifie si le tableau des commandes contient des doublons
async function checkDoublon(){
  for(i = 0; i < objlistGoogle.length; i++) for(j = 0; j < objlistGoogle.length; j++) if(i != j){
    if(await isTwoLayerSimilarContent(objlistGoogle[i],objlistGoogle[j],true)){
      console.error("2 objets similaires trouvés!: " + objlistGoogle[i] + " et " + objlistGoogle[j]);
      window.close();
    }
  }
}

async function changePosObj(){
  if(rgImageFocus >= 0 && mode != MODE_LECTURE){
    var points = objListLeaflet[rgImageFocus][0];
    if(actionEnCours == ACTDEPLACEMENT){
      if(points[0] == IMAGE || points[0] == TEXT){
        var moveX = mouseLng - points[3][0];
        var moveY = mouseLat - points[3][1];
        points[3][0] += moveX;
        points[3][1] += moveY;
        points[3][2] += moveX;
        points[3][3] += moveY;
        points[3][4] += moveX;
        points[3][5] += moveY;
        points[3][6] += moveX;
        points[3][7] += moveY;
        points[3][8] += moveX;
        points[3][9] += moveY;
      }
    }
    else if(actionEnCours == ACTROTATION){
      if(points[0] == IMAGE){
        if(points[13] != null){//angle non nul
          var moveX = (mouseLng - mouseLngLastState) * 5;
          mouseLngLastState = mouseLng;
          points[13] += moveX;
          var tabl = await getPosApresRotation(points[3][0],points[3][1],points[10],points[11],points[13]);
          points[3][0] = tabl[0];
          points[3][1] = tabl[1];
          points[3][2] = tabl[2];
          points[3][3] = tabl[3];
          points[3][4] = tabl[4];
          points[3][5] = tabl[5];
          points[3][6] = tabl[6];
          points[3][7] = tabl[7];
          points[3][8] = tabl[8];
          points[3][9] = tabl[9];
        }
      }
    }
    else if(actionEnCours == ACTECHELLE){
      if(points[0] == IMAGE){
        if(points[13] != null){
          var moveX = (mouseLng - mouseLngLastState) * 3;
          mouseLngLastState = mouseLng;
          points[10] += moveX
          //ly = sy / sx * lx
          points[11] = points[9] / points[8] * points[10];
          var tabl = await getPosApresRotation(points[3][0],points[3][1],points[10],points[11],points[13]);
          points[3][0] = tabl[0];
          points[3][1] = tabl[1];
          points[3][2] = tabl[2];
          points[3][3] = tabl[3];
          points[3][4] = tabl[4];
          points[3][5] = tabl[5];
          points[3][6] = tabl[6];
          points[3][7] = tabl[7];
          points[3][8] = tabl[8];
          points[3][9] = tabl[9];
        }
      }
    }
    await updatePosOnLLObj(objListLeaflet[rgImageFocus]);
    mush.changePos(points[3][0],points[3][1],points[3][2],points[3][3],points[3][4],points[3][5],points[3][6],points[3][7],points[3][8],points[3][9]);
    //
  }
}
