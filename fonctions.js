//FICHIER REGROUPANT LES FONCTIONS GENERALES AU PROGRAMME
//const spreadsheetId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; //Mario Games / Maps / Locations
const spreadsheetId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; //MARIO MAP TEST
const apiKey = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA';
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var sheetNameFocus;
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
var btnMapsLock = false;
var sheetNames = [];//nom des onglets
var objlistGoogle = [];//liste de tous les objets de la liste google (comprend les fonctions dans leur état le plus simple)
var objListLeaflet = [];//liste de tout les objets affichable dans leaflet (sans restrictions graphiques) (data, obj, rang, isActif)
var texteCharg = 0;
const leaflet = new LeafletMap();

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
  if(data[0] == 'IMG-LX-CENTER' || data[0] == 'IMG-LX-CENTER-R') {
    var tailleMini = 0;
    if(data[17] < data[18]) tailleMini = data[17];
    else tailleMini = data[18];
    if((((await leaflet.getMapBounds()).getNorthEast().lng - (await leaflet.getMapBounds()).getSouthWest().lng) / 20) > tailleMini) retour = true;
  }
  return retour;
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  //desactivation bouton reset
  btnMaps.disabled = true;
  //récupération des données de la feuille google visée
  try{
    var donneesGoogleUnOnglet = await getContenuTableauGoogle();
    //console.log("[initialisation] Suppression de tous les objets de la carte...");
    texteCharg.innerHTML = "Suppression de tous les objets de la carte...";
    leaflet.removeAllObj();
    //console.log("[initialisation] Suppression du contenu dess liste Leaflet...");
    texteCharg.innerHTML = "Suppression du contenu des listes Leaflet...";
    objListLeaflet = [];
    //console.log("[initialisation] Remplissage du contenu des listes Google (lent)...");
    texteCharg.innerHTML = "Remplissage du contenu des listes Google...";
    for(var i = 0; i < donneesGoogleUnOnglet.length; i++){
      await traitementLigneGoogle(donneesGoogleUnOnglet[i], i, donneesGoogleUnOnglet.length);
    }
    //console.log("[initialisation] Remplissage du contenu des listes Leaflet (lent)...");
    texteCharg.innerHTML = "Remplissage du contenu des listes Leaflet...";
    await traitementLigneGoogleSimplifiee();
    //console.log("[initialisation] Initialisation des données du Mushroom selector...");
    texteCharg.innerHTML = "Initialisation des données du Mushroom selector...";
    await initSelector();
    //console.log("[initialisation] Suppression du contenu des listes Google...");
    texteCharg.innerHTML = "Suppression du contenu des listes Google...";
    objlistGoogle = [];
    //console.log("[initialisation] Actualisation des données de la carte...");
    texteCharg.innerHTML = "Actualisation des données de la carte...";
    await leaflet.actualiseMap();
    console.log("[initialisation] Initialisation terminée...");
    texteCharg.innerHTML = "Initialisation terminée...";
    texteCharg.innerHTML = "";
    leaflet.stats();
    //activation bouton reset
    btnMaps.disabled = false;
  } catch (error) {console.error("Error:", error);}
}
/**traitement des commandes simplifiées et remplissage de la liste Leaflet */
async function traitementLigneGoogleSimplifiee(){
  try{
    var objet = null;
    var objet2 = null;
    for(var rang = 0; rang < objlistGoogle.length; rang++) {
      //console.log("traitement nouvelle ligne");
      texteCharg.innerHTML = `Remplissage du contenu des listes Leaflet: ${rang} / ${objlistGoogle.length - 1}`;
        var ligneptee = objlistGoogle[rang];
      switch(ligneptee[0]){
        case 'TILEMAP-DEFAULT':
          objet = await generateTile(ligneptee);
          break;
        case 'MARKER':
          objet = await generateMarker(ligneptee);
          break;
        case 'IMG-LX-CENTER':
          objet = await generateImage(ligneptee);
          if(objet != null) objet2 = await generateImage(toMipMap(ligneptee));
          break;
        case 'IMG-LX-CENTER-R':
          objet = await generateImage3p(ligneptee);
          if(objet != null) objet2 = await generateImage3p(toMipMap(ligneptee));
          break;
        default:
          console.error("etat non compris:" + ligneptee);
          break;
      }
      if(objet == null) await objListLeaflet.push([['MARKER',x1,y1,10,10,unfound_img,"Image " + lignes[7] + " not found, check URL"],objet,rang,false]);
      if(objet != null) await objListLeaflet.push([ligneptee, objet, rang, false]);
      if(objet2 != null) await objListLeaflet.push([await toMipMap(ligneptee), objet2, rang + 1, false]);
    }
  } catch (error) {console.error("Error:", error);}
}
/**Vérifie pour l'image qu'elle est tracable*/
async function calculTracabilite(rg) {
  try{
    const lignes = objListLeaflet[rg][0];
    var imagePosInScreenVar_ = await objectPosInScreen(lignes);//vérifie si l'objet devrait etre dans l'écran
    var isTooShort_ = await isShort(lignes);//vérifie si l'objet devrait etre affiché petit ou non
    //=====
    if(lignes[0] == 'TILEMAP-DEFAULT'){
      objListLeaflet[rg][3] = true;
    }
    //=====
    else if(lignes[0] == 'MARKER'){
      objListLeaflet[rg][3] = imagePosInScreenVar_;
    }
    //=====
    else if(lignes[0] == 'IMG-LX-CENTER' || lignes[0] == 'IMG-LX-CENTER-R'){
      if(imagePosInScreenVar_ == true && lignes[19] == false) {
        if(isTooShort_ == false) {
          objListLeaflet[rg][3] = true;
          objListLeaflet[rg + 1][3] = false;
        }
        else{
          objListLeaflet[rg][3] = false;
          objListLeaflet[rg + 1][3] = true;
        }
      }
      else if(!imagePosInScreenVar_) objListLeaflet[rg][3] = false;
    }
    else if(lignes[0] == 'MARKER-STATIC-MS'){
      //géré directement par mushroomselector ?
      if(!imagePosInScreenVar_ && objListLeaflet[rg][3] == true) await resetSelector();
    }
    //=====
    else{
      console.error(`Type non géré: ${lignes[0]}`);
    }
  } catch (error) {console.error("Error:", error);}
}
/**vérifie si un objet similaire éxiste dans l'écran*/
async function objectPosInScreen(data) {
  if(data[0] == 'TILEMAP-DEFAULT'){
    return true;
  }
  else if(data[0] == 'IMG-LX-CENTER' || data[0] == 'IMG-LX-CENTER-R') {
    return (await leaflet.getMapBounds()).intersects([[data[6], data[5]], [data[2], data[1]]]);
  }
  else if(data[0] == 'MARKER'){
    return (await leaflet.getMapBounds()).contains([data[2], data[1]]);
  }
  else if(data[0] == 'MARKER-STATIC-MS'){
    return (await leaflet.getMapBounds()).contains([selectorPosY, selectorPosX])
  }
  return false;
}
//============LEAFLETLIST==============
/**obtient le calque depuis les propriétés */
async function getLayerObjByData(data){
  var retour = null;
  for(var i = 0; i < objListLeaflet.length; i++){
    if(isTwoLayerSimilarContent(objListLeaflet[i][0],data,true) == true) retour = objListLeaflet[i][1];
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
  console.log("traitement nouvelle ligne");
  texteCharg.innerHTML = `Remplissage du contenu des liste Google: ${rg} / ${nbtot - 1}`;
  return new Promise((resolve) => {
    switch(lignes[0]){
      case 'TILEMAP-DEFAULT':
        objlistGoogle.push(lignes);
        resolve();
      break;
      case 'MARKER':
        //IF IN SCREEN
        (function(){
          imagePtee = new Image();
          var lx = convertToFloat(lignes[3]);
          var imgDesc = lignes[5];
          imagePtee.src = lignes[4];
          imagePtee.onload = function() {
            var ly = imagePtee.height / imagePtee.width * lx;
            //donnees = cmd,x,y,lx,ly,url,desc
            objlistGoogle.push(['MARKER',convertToFloat(lignes[1]),convertToFloat(lignes[2]),lx,ly,lignes[4],imgDesc]);
            resolve();
          }
        }());
      break;
      case 'IMG-LX-CENTER':
        (function(){
          imagePtee = new Image();
          //imagePtee.crossOrigin = "anonymous";// bloque la plupart des images
          var x1 = convertToFloat(lignes[1]);
          var y1 = convertToFloat(lignes[2]);
          var lx = convertToFloat(lignes[3]);
          var ly = convertToFloat(0);
          imagePtee.src = lignes[6];
          //console.log(lignes[7]);
          imagePtee.onload = function() {
            ly = imagePtee.height / imagePtee.width * lx;
            //donnees = cmd,p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y,pRefx,pRefy,url,title,author,website,imageSizeX,imageSizeY,imageLx,imageLy,isMipmap
            objlistGoogle.push(['IMG-LX-CENTER',x1 - lx/2,y1 - ly/2,x1 + lx/2,y1 - ly/2,x1 + lx / 2,y1 + ly / 2,x1 - lx/2,y1 + ly/2,x1,y1,lignes[6],lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly,false]);
            resolve();
          };
          imagePtee.onerror = function() {
            //console.log("image non chargee: " + lignes[7]);
            objlistGoogle.push(['MARKER',x1,y1,10,10,unfound_img,"Image " + lignes[7] + " not found, check URL"]);
            resolve();
          };
        }());
      break;
      case 'IMG-LX-CENTER-R':
        (function(){
          imagePtee = new Image();
          //imagePtee.crossOrigin = "anonymous";
          var x1 = convertToFloat(lignes[1]);
          var y1 = convertToFloat(lignes[2]);//execute en tant que coin BG
          var lx = convertToFloat(lignes[3]);
          var angle = convertToFloat(lignes[4]);
          //console.trace("angle: " + angle + " " + lignes[7])
          var ly = convertToFloat(0);
          imagePtee.src = lignes[6];
          imagePtee.onload = function() {
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
            //donnees = cmd,p1x,p1y,p2x,p2y,p3x,p3y,p4x,p4y,pRefx,pRefy,url,title,author,website,imageSizeX,imageSizeY,imageLx,imageLy,isMipmap,angle
            objlistGoogle.push(['IMG-LX-CENTER-R',x1F,y1F,x2F,y2F,x3F,y3F,x4F,y4F,x1,y1,lignes[6],lignes[7],lignes[8],lignes[9], imagePtee.width, imagePtee.height, lx, ly, false, angle]);
            //console.log("retour ok");
            resolve();
          }
          imagePtee.onerror = function() {
            // Si l'image n'est pas valide
            //console.log("image non chargee: " + lignes[7]);
            objlistGoogle.push(['MARKER',x1,y1,10,10,unfound_img,"Image " + lignes[7] + " not found, check URL"]);
            resolve();
          };
        }());
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
            objlistGoogle.push(['IMG-LX',x,y,x + lx,y + ly,imagePtee.src,""]);
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
        objlistGoogle.push(['IMG-PLR',x1 + x3modif + x2modif,y1 + y3modif + y2modif,x1 + x3modif,y1 + y3modif,x1 + x2modif,y1 + y2modif,"https://media.tenor.com/ejmDdRGqKDUAAAAe/terminal-montage-donkey-kong.png",0]);
        resolve();
        //
      break;
      default:
        resolve();
      break;
    }
  });
}
//fenetre modale
btnModal.onclick = function() {
    fenetreModale.style.display = "block";
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
  /*if(editMode == true) {
    editMode = false;
    updateSelector();
    btnEditorContent.textContent = "Editor (off)";
  }
  else if(editMode == false) {
    editMode = true;
    updateSelector();
    btnEditorContent.textContent = "Editor (on)";
  }*/
}
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
/**absoluteTest on = verifie si meme etat pour image (normal ou mipmaped)*/
function isTwoLayerSimilarContent(layer1, layer2, isAbsoluteTest){
  if(layer1 == null || layer2 == null){
    throw new Error("objet nul: [" + layer1 + " ===== " + layer2 + "]");
  }
  else if(layer1.length == 0 || layer2.length == 0){
    throw new Error("objet vide: [" + layer1 + " ===== " + layer2 + "]");
  }
  else if(layer1[0] == 'IMG-LX-CENTER' && layer2[0] == 'IMG-LX-CENTER'){
    if(isAbsoluteTest) return (layer1[0] == layer2[0] && layer1[12] == layer2[12] && layer1[19] == layer2[19]);
    else return (layer1[0] == layer2[0] && layer1[12] == layer2[12]);
  }
  else if(layer1[0] == 'IMG-LX-CENTER-R' && layer2[0] == 'IMG-LX-CENTER-R'){
    if(isAbsoluteTest) return (layer1[0] == layer2[0] && layer1[12] == layer2[12] && layer1[19] == layer2[19]);
    else return (layer1[0] == layer2[0] && layer1[12] == layer2[12]);
  }
  else if(layer1[0] == 'MARKER' && layer2[0] == 'MARKER'){
    return (layer1[0] == layer2[0] && layer1[6] == layer2[6]);
  }
  else if(layer1[0] == 'MARKER-STATIC-MS' && layer2[0] == 'MARKER-STATIC-MS'){
    return true;
  }
  else return false;
}
