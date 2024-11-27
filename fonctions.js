const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var sheetNameFocus;
var mousePos = new V2F(0,0);
var mouseLngLastState = 0;
var rgImgSelect = 0;
var customButton;
var btnCredits = document.getElementById("btnCreditsId");
var lienObj = document.getElementById("lienDynamique");
var btnEditor = document.getElementById("btnEditor");
var btnEditorContent = document.getElementById("btnEditorContent");
var btnVecteur = document.getElementById("btnVecteur");
var btnVecteurContent = document.getElementById("btnVecteurContent");
var btnMaps = document.getElementById('btnMaps');
var btnSave = document.getElementById('btnSave');
var btnMapsList = document.getElementById('btnMapsList');
var btnLocations = document.getElementById('btnLocations');
var btnLocationsList = document.getElementById('btnLocationsList');
var btnMapsLock = false;
var mapListLeaflet = new Map();//liste de tout les objets affichable dans leaflet (sans restrictions graphiques), y sont présente en plus: les mipmaps et les vecteurs statiques (data, obj, rang, isActif)
var mapListLocations = [];
var texteCharg = 0;
var contentCredits;
var vecteurVisu = false;
var limiteMarker = 0;
const virtualList = document.getElementById('virtual-list');
const mush = new MushroomSelector();
const google = new GestionGoogle();
const fenetreModale = new FenetreModale();

const MODE_LECTURE = 0;
const MODE_DEPLACEMENT = 1;
const MODE_ROTATION = 2;
const MODE_ECHELLE = 3;
const MODE_INSERTION = 4;

var mode = MODE_LECTURE;

const NULL = 0;
const TILEMAP_DEFAULT = 1;
const MARKER = 2;
const IMAGE = 3;
const MARKER_STATIC_MS = 4;
const TEXTE = 5;
const POLYLIGNE = 6;
const leaflet = new LeafletMap();
//NULL:             donnees = null
//TILEMAP_DEFAULT:  donnees = null
//MARKER:           donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url,desc]
//IMAGE:            donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url,title,author,website,imageSize,imageL,isMipmap]
//TEXT:             donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url-canva,size,text,lOnLeaflet,angle]
//MARKERSTATIC:     donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url]
/**fonction d'initialisation principale du programme */
async function corps(){
  //var ssId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; //Mario Games / Maps / Locations
  var ssId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; //MARIO MAP TEST
  var apik = 'AIzaSyCTYinHSnmthpQKkNeRcNMnyk1a8lTyzaA';
  //FICHIER REGROUPANT LES FONCTIONS GENERALES AU PROGRAMME
  google.getSpreadsheetId(ssId);
  google.getApiKey(apik);
  var lienTxt = "https://docs.google.com/spreadsheets/d/" + ssId;
  contentCredits =  `<p><h3>Sources</h3>
  <b>Code source:</b><br>
  <a href=https://github.com/Guipsou01/leaflet1>https://github.com/Guipsou01/leaflet1</a><br>
  <b>Map data:</b><br>
  <a href=` + lienTxt + ` target="_blank">` + lienTxt + `</a>
  <p><h3>Credits:</h3>
  <b>Leaflet:</b><br>
  Free library to use map<br>
  <b>Marioverse discord server:</b><br>
  General informations about the lore of mario.<br>
  <b>Illuminarchie:</b><br>
  Discovery of Leaflet, also made a map using Leaflet here !:<br>
  <a href="https://www.archie-harrodine.com/mario-map-project/">https://www.archie-harrodine.com/mario-map-project/</a><br>
  <b>All map makers!:</b><br>
  Credits for each Map by clicking on it.</p>`;
  contentSave = `<h3 style="text-align: center;">Attention</h3>
  <p style="text-align: center;">Sauvegarder la page crééra ou écrasera un onglet 'OUTPUT' sur la fiche Google Sheets.<br></p>
  <p style="text-align: center;"><a href="#" style="cursor: pointer; text-decoration: underline;" onclick="sauvegarder()">Sauvegarder</a></p><br>
  `;
  btnVecteurContent.textContent = "Parent (off)";
  texteCharg = document.getElementById('texteInfo');
  //console.log("[initialisation] Démarrage");
  texteCharg.innerHTML = "Démarrage";
  //initialisation map leaflet
  //requette et enregistrement donnees google 
  //lienObj.href = lienTxt; // Assigner le lien à l'attribut href
  //lienObj.textContent = lienTxt; // Mettre à jour le texte affiché pour correspondre au lien
  btnEditorContent.textContent = "Editor (off)";
  btnMaps.textContent = "Loading...";
  //console.log("[initialisation] Recération données onglets google (lent)...");
  texteCharg.innerHTML = "Recupération données onglets google...";
  var sheetNamesLocations = await google.getNomFeuilles();
  if(isTablContainElem(sheetNamesLocations,"Locations")) await remplissageLocations();
  var sheetNames = await google.filterWithPrefixe("Leaflet_");
  if(sheetNames == null) sheetNameFocus = "Google table not found";
  else if(sheetNames.length == 0) sheetNameFocus = "No tab found";
  else sheetNameFocus = sheetNames[0];
  //console.log("[initialisation] Init sélecteur...");
  texteCharg.innerHTML = "Initialisation sélecteur...";
  await createSelectorMaps();
  await createSelectorLocations();
  resetAllMapContent();
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  try{
    mapListLeaflet.clear();
    //desactivation bouton reset
    btnMaps.disabled = true;
    actionEnCours = ACTNULL;
    mode = MODE_LECTURE;
    btnEditorContent.textContent = "Editor (off)";
    //récupération des données de la feuille google visée
    if(cleImageFocus != null) await mush.reset();
    if(await google.getNomFeuillesSansRequette() == null){
      texteCharg.innerHTML = "No Google Table found, check table id and permission";
      return;
    }
    if(!await google.isListeFeuillesOk()) {
      texteCharg.innerHTML = "No tab found on the Google Table, check name and header (Leaflet_xxx needed)";
      return;
    }
    texteCharg.innerHTML = "Suppression de tous les objets de la carte...";
    leaflet.removeAllObj(true);
    texteCharg.innerHTML = "Suppression du contenu des listes Leaflet...";
    objListLeaflet = [];
    texteCharg.innerHTML = "Remplissage du contenu des listes Google...";
    await google.lecture();
    //traceListeLeaflet();
    texteCharg.innerHTML = "Initialisation des données du Mushroom selector...";
    await mush.init();
    texteCharg.innerHTML = "Suppression du contenu des listes Google...";
    texteCharg.innerHTML = "Actualisation des données de la carte...";
    await linkObjects();
    await actualiseMap();
    console.log("[initialisation] Initialisation terminée...");
    texteCharg.innerHTML = "Initialisation terminée...";
    texteCharg.innerHTML = "";
    mush.active();
    leaflet.stats();
    btnMaps.disabled = false;//activation bouton reset
  } catch (error) {console.error("Error:", error);}
}
/**Vérifie pour l'image qu'elle est tracable*/
async function calculTracabilite(data) {
  try{
    var imagePosInScreenVar_ = await objectPosInScreen(data);//vérifie si l'objet devrait etre dans l'écran
    var isTooShort_ = await leaflet.isShort(data);//vérifie si l'objet devrait etre affiché petit ou non
    var nvEtat = data.actif;
    switch (data.type){
      case TILEMAP_DEFAULT:
        nvEtat = true;
      break; case MARKER:
        //if(leaflet.getZoomLvl() >= 8) nvEtat = imagePosInScreenVar_;
        //else nvEtat = false;
        if(limiteMarker <= 500) nvEtat = imagePosInScreenVar_;
        else nvEtat = false;
        //nvEtat = imagePosInScreenVar_;
        if(nvEtat == true) limiteMarker++;
      break; case IMAGE:
        var isMipmap = data.isMipmap;
        if(imagePosInScreenVar_ && !isMipmap) nvEtat = !isTooShort_;
        else if(imagePosInScreenVar_ && isMipmap) nvEtat = isTooShort_;
        else if(!imagePosInScreenVar_) nvEtat = false;
      break; case MARKER_STATIC_MS:
        //géré directement par mushroomselector ?
        if(!imagePosInScreenVar_ && nvEtat) await mush.reset();
      break; case TEXTE:
        nvEtat = true;
      break; case POLYLIGNE:
        nvEtat = true;
      break; default:
        console.error(`Type non géré: ${data.type}`);
      break;
    }
    data.actif = nvEtat;
  } catch (error) {console.error("Error:", error);}
}
//============LEAFLETLIST==============
//=========GOOGLE=========
/**fonction lente */
async function findKeyWithChampValide(champ, valeur){
  for (const [key, dataaModif] of mapListLeaflet) if(champ in dataaModif) if(dataaModif[champ] == valeur) return key;
  return null;
}
/**supprime tout les éléments d'une carte, vérifie le tracage de nouveaux éléments et les insère dans la carte*/
async function actualiseMap(){
  try{
    limiteMarker = 0;
    await leaflet.removeAllObj(false);
    for (const [key, value] of mapListLeaflet) await updatePosOnLLObj(value);
    for (const [key, value] of mapListLeaflet) await calculTracabilite(value);
    for (const [key, value] of mapListLeaflet) await leaflet.addObj(value);
    //stats();
  } catch(error) {
    console.error("Erreur dans l'actualisation de map");
    throw error;
  }
}
/**actualise les dépendances des objets et leur vecteurs pour tout les objets de la liste*/
async function linkObjects(){
  try{
    var actuVecteur = false;
    for (const [key, dataaModif] of mapListLeaflet) {
      actuVecteur = true;
      if(dataaModif.type == TILEMAP_DEFAULT || dataaModif.type == MARKER_STATIC_MS || dataaModif.type == POLYLIGNE) actuVecteur = false;
      if(dataaModif.type == IMAGE) if(dataaModif.isMipmap) actuVecteur = false;
      //traitement parente
      if(actuVecteur == true){//actualiser les infos de vecteur et de cadre
        if(dataaModif.vOrigine != null) if(dataaModif.vOrigine != '-' && dataaModif.vOrigine != undefined && dataaModif.vOrigine != "" && dataaModif.vOrigine != "null") {
          var key2 = await findKeyWithChampValide("titre", dataaModif.vOrigine);
          var objetfocus = mapListLeaflet.get(key2);
          if(dataaModif.vPos.getPo3() != null && objetfocus.vPos != null) if(dataaModif.vPos.po == objetfocus.vPos) throw new Error("test");
          //console.log(dataaModif.titre, "   ", objetfocus.vPos);
          try{
            dataaModif.vPos.setPo(objetfocus.vPos);
          }
          catch(err) {
            console.log(dataaModif, "    ", objetfocus);
            console.log(dataaModif.vOrigine);
            if(objetfocus == null) console.error("Error: objet focus non défini pour " + dataaModif.titre);
            console.error("Error: au niveau des objets ", dataaModif.titre, " et ", objetfocus.titre, ": " + err);
          }
        }
        //
        var vecteur = dataaModif.objetVecteur;
        vecteur.vPos = dataaModif.vPos;
        vecteur.vPos2 = dataaModif.vPos.getPo2();
        if (!dataaModif.objetCarre || !Array.isArray(dataaModif.objetCarre) || dataaModif.objetCarre.length < 4) throw new Error("Erreur : 'carre' est null, non défini ou ne contient pas au moins 4 éléments: " + dataaModif.titre + " " + dataaModif.isMipmap);
        dataaModif.objetCarre[0].vPos = dataaModif.vPos1;
        dataaModif.objetCarre[0].vPos2 = dataaModif.vPos2;
        dataaModif.objetCarre[1].vPos = dataaModif.vPos2;
        dataaModif.objetCarre[1].vPos2 = dataaModif.vPos3;
        dataaModif.objetCarre[2].vPos = dataaModif.vPos3;
        dataaModif.objetCarre[2].vPos2 = dataaModif.vPos4;
        dataaModif.objetCarre[3].vPos = dataaModif.vPos4;
        dataaModif.objetCarre[3].vPos2 = dataaModif.vPos1;
      }
    }
  } catch (error) {console.error("Error:", error);}
}
/** Initialisation sélecteur de maps et remplissage de la liste des maps*/
async function createSelectorMaps(){
  btnMapsList.innerHTML = '';
  btnMaps.textContent = sheetNameFocus;
  if(google.isListeFeuillesOk()) {
    tableauFeuilles = await google.getNomFeuillesSansRequette();
    tableauFeuilles.forEach(option => {
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
  }
  btnMaps.onclick = function() {
    btnMapsList.style.display = btnMapsList.style.display === 'none' ? 'block' : 'none';
  };
  //Fermer la liste déroulante quand on clique en dehors
  window.onclick = function(event) {
    if (!event.target.matches('#btnMaps')) btnMapsList.style.display = 'none';
  };
}
/**appui sur le bouton credits */
btnCredits.onclick = function() {
  fenetreModale.openWithContent(contentCredits);
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
/**appui sur le bouton vecteur */
btnVecteur.onclick = function() {
  if(vecteurVisu == false) {
    vecteurVisu = true;
    btnVecteurContent.textContent = "Parent (on)";
  }
  else if(vecteurVisu == true){
    vecteurVisu = false;
    btnVecteurContent.textContent = "Parent (off)";
  }
  actualiseMap();
}
btnSave.onclick = function() {
  fenetreModale.openWithContent(contentSave);
}
//fonctions diverses
/**verifie si le tableau des commandes contient des doublons*/
async function checkDoublon(){
  //verifie si la liste google contient des doublons
}
/**cherche le rang de la liste leaflet de l'objet similaire depuis une data, -1 si non trouvé, l'état doit etre exact*/
async function rgFromImageData(data, absoluteTest){
  var retour = -1;
  for(var i = 0; i < objListLeaflet.length; i++){
    if(await isTwoLayerSimilarContent(objListLeaflet[i][0],data,absoluteTest)) {
      retour = i;
      return retour;
    }
  }
  return retour;
}
/*retourne le rang correspondant au nom de l'image dans la liste leaflet*/
function rgFromImageName(data){
  var retour = -1;
  for(var i = 0; i < objListLeaflet.length; i++) if(objListLeaflet[i][0][0] == IMAGE) if(objListLeaflet[i][4][1] == data[2][0] && !objListLeaflet[i][4][6]) retour = i;//si nom egal et pas mipmap
  return retour;
}
/**
 * vérifie si deux objet sont similaires (vérifie le type, desc pour les markers et titre pour les images)
 * absoluteTest on = verifie si meme etat pour image (normal ou mipmaped)
 *  */
function isTwoLayerSimilarContent(layer1, layer2, isAbsoluteTest){
       if(layer1 == null || layer2 == null)                              throw new Error("objet nul: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1.length == 0 || layer2.length == 0)                      throw new Error("objet vide: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1[0][0] == IMAGE && layer2[0][0] == IMAGE) {//test type, title, mipmapstyle
  if(isAbsoluteTest) return (layer1[0][0] == layer2[0][0] && layer1[4][1] == layer2[4][1] && layer1[4][6] == layer2[4][6]);
  else               return (layer1[0][0] == layer2[0][0] && layer1[4][1] == layer2[4][1]);
  }
  else if(layer1[0][0] == MARKER           && layer2[0][0] == MARKER)           return (layer1[0] == layer2[0] && layer1[4][1] == layer2[4][1]);
  else if(layer1[0][0] == MARKER_STATIC_MS && layer2[0][0] == MARKER_STATIC_MS) return true;
  else if(layer1[0][0] == POLYLIGNE        && layer2[0][0] == POLYLIGNE)        return (layer1[0] == layer2[0] && layer1[3] == layer2[3]);
  else return false;
}
/**cette fonction doit etre spam pour fonctionner */
async function changePosObj(){
  if(cleImageFocus != null && (mode == MODE_DEPLACEMENT || mode == MODE_ROTATION || mode == MODE_ECHELLE || mode == MODE_INSERTION)){
    var points = mapListLeaflet.get(cleImageFocus);
    if(actionEnCours == ACTDEPLACEMENT){
      if(points.type == IMAGE || points.type == TEXTE || points.type == MARKER) points.vPos.addV(new V2F(mousePos.x - points.vPos.xAbs(), mousePos.y - points.vPos.yAbs()));
    }
    else if(actionEnCours == ACTROTATION){
      if(points.type == IMAGE){
        if(points.vAngle != null) {//angle non nul
          var moveX = (mousePos.x - mouseLngLastState) * 5;
          mouseLngLastState = mousePos.x;
          var angleLoc = points.vAngle.getAngle();
          angleLoc += moveX;

          points.vAngle.setAngle(angleLoc);
          l = points.vTaille;
          p = points.vPos;
          a = points.vAngle;
          const p1 = new V2F(-l.x/2, -l.y/2);
          const p2 = new V2F(+l.x/2, -l.y/2);
          const p3 = new V2F(+l.x/2, +l.y/2);
          const p4 = new V2F(-l.x/2, +l.y/2);
          var angleDecal = new V2F(0,0);
          angleDecal.setAngle(moveX);
          points.vPos.applyRotationDecalageOnEnfants(angleDecal);
        }
      }
      else if(points.type == TEXTE){
        if(points.vAngle != null){//angle non nul
          //var moveX = (mousePos.x - mouseLngLastState) * 5;
          //mouseLngLastState = mousePos.x;
          //points.vAngle += moveX;
          //var tabl = await getPosApresRotation(points[2][1],points.vAngle,points[11]);
          //points[2][1] = tabl[0];
        }
      }
    }
    else if(actionEnCours == ACTECHELLE){
      if(points.type == IMAGE){
        if(points.vAngle != null){
          //var moveX = (mousePos.x - mouseLngLastState) * 3;
          //mouseLngLastState = mousePos.x;
          //points[4][5] += moveX
          //ly = sy / sx * lx
          //points[4][5].y = points[9] / points[8] * points[4][5].x;
          //var tabl = await getPosApresRotation();
          //points[2][1] = tabl[0];
        }
      }
    }
    if(points.type == IMAGE) mush.changePos(points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4);
    //
  }
}
async function remplissageLocations(){
  var donneesGoogleUnOnglet = await google.getContenuTableau("Locations");
  for(i = 6; i < donneesGoogleUnOnglet.length; i++){
    var ligne = donneesGoogleUnOnglet[i][1];
    await mapListLocations.push([donneesGoogleUnOnglet[i][1], donneesGoogleUnOnglet[i][5]]);
  }
  initFenetreVirtuel();
}
async function createSelectorLocations(){
  mapListLocations.forEach(option => {
    const link = document.createElement('a');
    link.href = "#";
    //btnLocationsList.appendChild(link); //Ajouter le lien à la liste
  });
  btnLocations.onclick = function() {
    //var donneesLocations = await google.getContenuTableau(sheetNameFocus);
    //btnLocationsList.style.display = btnLocationsList.style.display === 'none' ? 'block' : 'none';//affichage
    mush.reset();
    mush.disable();
    virtualList.style.display = virtualList.style.display === 'none' ? 'block' : 'none';//affichage
  };
  //Fermer la liste déroulante quand on clique en dehors
  window.onclick = function(event) {
    if(!event.target.matches('#btnLocations')) {
      virtualList.style.display = 'none';
      if(mode != MODE_INSERTION) mush.active();
    }
  };
}
function initFenetreVirtuel(){
  const totalItems = mapListLocations.length; // Nombre total d'éléments
  const itemHeight = 30;  // Hauteur de chaque élément
  const viewportHeight = 300; // Hauteur visible de la liste

  // Crée un conteneur interne pour la liste
  const listHeight = totalItems * itemHeight;
  const listContent = document.createElement('div');
  listContent.style.height = `${listHeight}px`;
  listContent.style.position = 'relative';
  virtualList.appendChild(listContent);

  const visibleItemCount = Math.ceil(viewportHeight / itemHeight);

  const renderItems = () => {
    const scrollTop = virtualList.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItemCount + 1, totalItems);

    // Nettoie les anciens éléments
    listContent.innerHTML = '';

    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('button');
      item.className = 'item';
      item.style.top = `${i * itemHeight}px`;
      item.style.height = `${itemHeight}px`;
      item.textContent = mapListLocations[i][0];
      
      item.onclick = () => {
        //
        mode = MODE_INSERTION;
        btnEditorContent.textContent = "Insertion";
        btnEditor.disabled = true;
        //creation objet
        createMarker(mapListLocations[i][0], mapListLocations[i][1]);
        actionEnCours = ACTDEPLACEMENT;
        //lancement boucle d'insertion
        holdInterval = setInterval(() => {mush.modeDeplacementSpam();}, 10);//verifie toute les 100ms
        //mush.active();
      };
      listContent.appendChild(item);
    }
  };

  // Ajoute un écouteur pour détecter les scrolls
  virtualList.addEventListener('scroll', renderItems);
  // Rendu initial
  renderItems();
}
async function createMarker(nom, url){
  var data = createDataObjet(MARKER);
  data.vTaille.setXY(50,50);
  data.url = url;
  data.desc = nom;
  data.titre = nom;
  data.plan = 1000;
  var dataLigne = createDataObjet(POLYLIGNE);
  var dataCarre1 = createDataObjet(POLYLIGNE);
  var dataCarre2 = createDataObjet(POLYLIGNE);
  var dataCarre3 = createDataObjet(POLYLIGNE);
  var dataCarre4 = createDataObjet(POLYLIGNE);
  await generateObject(dataLigne);
  await generateObject(dataCarre1);//cotés carré
  await generateObject(dataCarre2);
  await generateObject(dataCarre3);
  await generateObject(dataCarre4);
  data.objetVecteur = dataLigne;
  data.objetCarre = [dataCarre1,dataCarre2,dataCarre3,dataCarre4];
  await generateObject(data);
  var cleMarkerFocus = generateCleUnique();
  await mapListLeaflet.set(cleMarkerFocus, data);
  await linkObjects();
  await actualiseMap();
  mush.insertObjetFocus(cleMarkerFocus);
  data.objet.on('click', function() {
      clearInterval(holdInterval);//stop le spam
      mode = MODE_LECTURE;
      btnEditorContent.textContent = "Editor (off)";
      btnEditor.disabled = false;
  });
}

function createDataObjet(type){
  var data = null;
  if(type == IMAGE){
    data = {
      //GEN
      type: type,
      objet: null,
      objetVecteur: null,
      objetCarre: null,
      actif: true,
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      titre: null,
      //SPC
      url: null,
      auteur: null,
      site: null,
      vImgTaille: new V2F(0,0),
      vTaille: new V2F(0,0),
      isMipmap: false,
      coupleMapLink: null
    }
  }
  else if(type == TILEMAP_DEFAULT){
    data = {
      type: type
    };
  }
  else if(type == MARKER){
    data = {
      //GEN
      type: type,
      objet: null,
      objetVecteur: null,
      objetCarre: null,
      actif: true,
      plan: 10,
      vOrigine: null,
      objetVecteur: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      titre: null,
      //SPC
      vTaille: new V2F(50,50),
      url: null,
      desc: "null",
    };
  }
  else if(type == POLYLIGNE){
    data = {
      type: type,
      objet: null,
      actif: false,
      plan: 0,
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      //
      vPos2: new V2F(1,1),
      //lien
      objetParent: null
    }
  }
  else if(type == MARKER_STATIC_MS){
    data = {
      //GENERAL
      type: MARKER_STATIC_MS,
      objet: null,
      actif: false,
      plan: 0,
      //
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vTaille: new V2F(10,10),
      url: shroom
    }
  }
  return data;
}
async function sauvegarder(){
  await fenetreModale.close();
  content = await google.ecriture()
  fenetreModale.openWithContent(content);
}
