//<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.polylinedecorator/1.8.1/leaflet.polylineDecorator.min.js"></script>
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var sheetNameFocus;
var mouseLngLastState = 0;
var rgImgSelect = 0;
var customButton;
var btnCredits = document.getElementById("btnCreditsId");
var lienObj = document.getElementById("lienDynamique");
var btnSave = document.getElementById('btnSave');
var mapListLocations = [];
var vecteurVisu = false;
var limiteMarkercpt = 0;
var firstAction = true;
var holdInterval = null;
var parentSelectOne = null;
var parentSelectTwo = null;
//const limiteMarker = -1; //limite d'affichage de markers en meme temps// -1 = tous
//const limiteMarker = 1;
//const limiteMarker = 10; //limite d'affichage de markers en meme temps// -1 = tous
const limiteMarker = 100; //limite d'affichage de markers en meme temps// -1 = tous
//const limiteMarker = 500; //limite d'affichage de markers en meme temps// -1 = tous
//const limiteMarker = 1000; //limite d'affichage de markers en meme temps// -1 = tous
const btnEditor = new hudButton1(document.getElementById("btnEditor"), document.getElementById("btnEditorContent"));
const btnVecteur = new hudButton1(document.getElementById("btnVecteur"), document.getElementById("btnVecteurContent"));
const btnListMaps = new hudList(document.getElementById('btnMaps'), document.getElementById('btnMapsList'), false);
const btnListLocations = new hudList(document.getElementById('btnLocations'), document.getElementById('btnLocationsList'), true);
const mush = new MushroomSelector();
const fenetreModale = new FenetreModale(document.getElementById('fenetreCredits-content'), document.getElementsByClassName("croixCreditsId")[0], document.getElementById("fenetreCreditsId"));

const MODE_LECTURE = 0;
const MODE_DEPLACEMENT = 1;
const MODE_ROTATION = 2;
const MODE_ECHELLE = 3;
const MODE_INSERTION = 4;
const MODE_LINK = 5;
/**clique a l'exterieur de la liste pour fermer la liste des locations*/
const cliqueOnExtFenetreToCloseHVL = () => {
  if(mode != MODE_INSERTION) mush.active();
}
const clickSurBtnLocations = () => {
  //var donneesLocations = await google.getContenuTableau(sheetNameFocus);
  mush.reset();
  mush.disable();
}
//action sur tout les boutons de la liste a chaque refresh
const renderForEachSlotLoc = (ligneFocus, btnHTML) => {
  if(findKeyWithChampValide("titre",btnHTML.textContent) != null) btnHTML.disabled = true;
}
//appui sur le bouton vecteur
const cliqueSurBtnVecteur = () => {
  vecteurVisu = !vecteurVisu;
  if(vecteurVisu) btnVecteur.setText("Parent (on)");
  else            btnVecteur.setText("Parent (off)");
  leaflet.actualiseMapTracee();
  //actualiseMap(mapListLeaflet, false);
}
//appui sur le bouton editeur
const cliqueSurBtnEditor = () => {
  switch (mode) {
           case MODE_LECTURE:     mode = MODE_DEPLACEMENT;  btnEditor.setText("Editor (move)");
    break; case MODE_DEPLACEMENT: mode = MODE_ROTATION;     btnEditor.setText("Editor (rotation)");
    break; case MODE_ROTATION:    mode = MODE_ECHELLE;      btnEditor.setText("Editor (scale)");
    break; case MODE_ECHELLE:     mode = MODE_LINK;         btnEditor.setText("Editor (parent)");
    break; case MODE_LINK:        mode = MODE_LECTURE;      btnEditor.setText("Editor (off)");
    break; default: throw new Error("Etat non compris: " + mode);
  }
  leaflet.closePopup();
  resetParentMode();
  //console.log(mapListLeaflet.size);
  //actualiseMap(leaflet.getMap(), true);ICI
  actualiseMap(mapListLeaflet, true);
}
const cliqueSurSlotListe2 = (option, id, item) => {
  //event.preventDefault(); //Empêche le comportement par défaut du lien
  btnListMaps.setText(option);
  if(typeof sheetNameFocus !== 'undefined') sheetNameFocus = option;
  resetAllMapContent();
  //this.#fermerListe();
};
const cliqueSurSlotListe1 = (liste, id, item) => {
  item.disabled = true;
  mode = MODE_INSERTION;
  btnEditor.setText("Insertion");
  btnEditor.disable();
  //creation objet
  createMarker((liste[1]), (liste[5]));
  actionEnCours = ACTDEPLACEMENT;
  //lancement boucle d'insertion
  holdInterval = setInterval(() => {spam();}, 10);//verifie toute les 100ms
  //mush.active();
};

var mode = MODE_LECTURE;

const NULL = 0;
const TILEMAP_DEFAULT = 1;
const MARKER = 2;
const IMAGE = 3;
const MARKER_STATIC_MS = 4;
const TEXTE = 5;
const POLYLIGNE = 6;
const leaflet = new LeafletMap();

function typetotxt(id){
  switch(id){
    case 0:  return "NULL";
    case 1:  return "TILEMAP_DEFAULT";
    case 2:  return "MARKER";
    case 3:  return "IMAGE";
    case 4:  return "MARKER_STATIC_MS";
    case 5:  return "TEXTE";
    case 6:  return "POLYLIGNE";
    default: return "NULL";
  }
}
/**Vérifie pour l'objet qu'il est tracable, ne traite pas les icones du MS*/
async function calculTracabilite(data, limite) {
  try{
    var imagePosInScreenVar_ = await objectPosInScreen(data);//vérifie si l'objet devrait etre dans l'écran
    var nvEtat = data.actif;
    switch (data.type){
      case TILEMAP_DEFAULT:
        nvEtat = true;
      break; case MARKER:
        //if(leaflet.getZoomLvl() >= 8) nvEtat = imagePosInScreenVar_;
        //else nvEtat = false;
        if(limiteMarker == -1) limite = false;
        nvEtat = limite ? ((limiteMarkercpt <= limiteMarker) ? imagePosInScreenVar_ : false) : imagePosInScreenVar_;
        if(limite) if(nvEtat == true) limiteMarkercpt++;
      break; case IMAGE:
        //nvEtat = (imagePosInScreenVar_ && !data.isMipmap) ? !isTooShort_ : (imagePosInScreenVar_ && data.isMipmap) ? isTooShort_ : !imagePosInScreenVar_ ? false : nvEtat;
        nvEtat = imagePosInScreenVar_;
        //nvEtat = false;
      break; case MARKER_STATIC_MS:
        //géré directement par mushroomselector ?
        //if(!imagePosInScreenVar_ && nvEtat) await mush.reset();
      break; case TEXTE:
        nvEtat = true;
      break; case POLYLIGNE:
        //nvEtat = etatVecteur;
      break; default:
        console.error(`Type non géré: ${data.type}`);
      break;
    }
    data.actif = nvEtat;
    var etatVecteur = data.actif && vecteurVisu;
    //var etatVecteur = false;
    //etatVecteur = (data.type == MARKER && limite) ? (vecteurVisu && data.actif) : vecteurVisu;
    //if(dat)
    //if(data.type == IMAGE) etatVecteur = (etatVecteur || (mapListLeaflet.get(data.coupleMapLink).actif));
    //etatVecteur = true;
    if(data.objetVecteur != null) data.objetVecteur.actif = etatVecteur && data.actif;
    if(data.objetCarre != null) for(var i = 0; i < data.objetCarre.length; i++) data.objetCarre[i].actif = etatVecteur && data.actif;
    if((data.key == parentSelectOne || data.key == parentSelectTwo) && data.objetCarre != null && !data.isMipmap) for(var i = 0; i < data.objetCarre.length; i++) data.objetCarre[i].actif = true;
  } catch (error) {console.error("Error:", error);}
}
//============LEAFLETLIST==============
//=========GOOGLE=========
/**supprime tout les éléments, vérifie le tracage de nouveaux éléments d'une map en parametre et les insère dans leaflet, mapobj: liste visée, limite: prend en compte une limite de markers*/
async function actualiseMap(mapobj, limite){
  try{
    limiteMarkercpt = 0;
    if(!mapobj || typeof mapobj[Symbol.iterator] !== 'function') {
      throw new TypeError("mapobj n'est pas un itérable valide.");
    }
    for(const [key, value] of mapobj) await updatePosOnLLObj(value);
    await mush.updatePos();
    //
    for(const [key, value] of mapobj) await calculTracabilite(value, limite);
    await mush.calculTracabilite();
    //
    for(const [key, value] of mapobj) await leaflet.updateObj(value);
    await mush.updateObj();
    //
    await checkDoublon(mapobj);
    await updateLog("end map update");
  } catch(error) {
    console.error("Erreur dans l'actualisation de map: " + error);
    throw error;
  }
}
/**créé les dépendances entre chaque objet de la map en parametre*/
async function linkObjects(map){
  try{
    var actuVecteur = false;
    for(const [key, dataaModif] of map) {
      actuVecteur = true;
      if(dataaModif.type == TILEMAP_DEFAULT || dataaModif.type == MARKER_STATIC_MS || dataaModif.type == POLYLIGNE) actuVecteur = false;
      if(dataaModif.type == IMAGE) if(dataaModif.isMipmap) actuVecteur = false;
      //traitement parente
      if(actuVecteur == true) {//actualiser les infos de vecteur et de cadre
        if(dataaModif.vOrigine != null) if(dataaModif.vOrigine != '-' && dataaModif.vOrigine != undefined && dataaModif.vOrigine != "" && dataaModif.vOrigine != "null") {
          var objetfocus = map.get(await findKeyWithChampValide("titre", dataaModif.vOrigine));
          //console.log(dataaModif.titre + " " + dataaModif.vOrigine);
          if(dataaModif.vPos.getPo3() != null && objetfocus.vPos != null) if(dataaModif.vPos.po === objetfocus.vPos) throw new Error("L'objet ne peut pas se focus lui meme: " + dataaModif.vPos.po + " " + objetfocus.vPos + ", objet: " + dataaModif.titre + ", objet: " + dataaModif.vPos.getData());
          try{
            if(objetfocus == null) {
              console.log("Error: objet focus non défini pour " + dataaModif.titre);
              dataaModif.vOrigine = null;
            }
            else dataaModif.vPos.setPo(objetfocus.vPos);
          }
          catch(err) {
            console.error("Error: au niveau des objets ", dataaModif.titre, " et ", objetfocus.titre, ": " + err);
          }
        }
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
  btnListMaps.setText(sheetNameFocus);

  if(google.isListeFeuillesOk()) {
    tableauFeuilles = await google.getNomFeuillesSansRequette();
    btnListMaps.setListe(tableauFeuilles);
  }
}
/** Desactive l'appui sur tout les boutons */
async function disableAllbuttons(){
  btnSave.disabled = true;
  btnCredits.disabled = true;
  btnEditor.disable();
  btnVecteur.disable();
  btnListMaps.disable();
  btnListLocations.disable();
}
//
async function activeAllButtons(){
  btnSave.disabled = false;
  btnCredits.disabled = false;
  btnEditor.active();
  btnVecteur.active();
  btnListMaps.active();
  btnListLocations.active();
}
/**appui sur le bouton credits */
btnCredits.onclick = function() {
  disableAllbuttons();
  fenetreModale.openWithContent(contentCredits);
}
/**appui sur le bouton save */
btnSave.onclick = function() {
  disableAllbuttons();
  fenetreModale.openWithContent(contentSave);
}
//fonctions diverses
/**cherche le premier doublon dans le tableau et retourne une erreur si trouvé.*/
function checkDoublon(map) {
  const nameSet = new Set(); // Utilisé pour stocker les noms uniques
  for(const value of map.values()) if(value.titre) if(!nameSet.add(value.titre)) throw new Error(`Doublon trouvé pour l'objet : ${value.titre}`); //Vérifie si "titre" existe, puis add() retourne false si l'élément existe déjà
}
//
/**cherche le rang de la liste leaflet de l'objet similaire depuis une data, -1 si non trouvé, l'état doit etre exact*/
async function rgFromImageData(data, absoluteTest) {
  const results = await Promise.all(
    objListLeaflet.map((item, index) => isTwoLayerSimilarContent(item[0], data, absoluteTest).then(match => match ? index : -1))
  );
  return results.find(index => index !== -1) ?? -1; //Trouve le premier index valide
}
/**
 * vérifie si deux objet sont similaires (vérifie le type, desc pour les markers et titre pour les images)
 * absoluteTest on = verifie si meme etat pour image (normal ou mipmaped)
 *  */
function isTwoLayerSimilarContent(layer1, layer2, isAbsoluteTest){
       if(layer1 == null      || layer2 == null)                          throw new Error("objet nul: [" + layer1 + " ===== " + layer2 + "]");
  else if(layer1.length == 0  || layer2.length == 0)                      throw new Error("objet vide: [" + layer1 + " ===== " + layer2 + "]");
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
async function dynamicTransformObj(){
  if(mush.imageFocus() == null || await mush.getCleImageFocus() == null || mode == MODE_LECTURE) return;
  var points = await mapListLeaflet.get(await mush.getCleImageFocus());
  switch (actionEnCours) {
         case ACTDEPLACEMENT:
    if(points.type == IMAGE || points.type == TEXTE || points.type == MARKER) points.vPos.addV(new V2F(leaflet.mousePos.x - points.vPos.xAbs(), leaflet.mousePos.y - points.vPos.yAbs()));
  break; case ACTROTATION:
    if(points.type == IMAGE || points.type == TEXTE || points.type == MARKER){
      var vFromMouseToObj = new V2F();
      vFromMouseToObj.setXY(leaflet.mousePos.xAbs() - points.vPos.xAbs(), leaflet.mousePos.yAbs() - points.vPos.yAbs())
      var angleActu = vFromMouseToObj.getAngle();
      if(firstAction){
        mouseLngLastState = angleActu;
        firstAction = false;
      }
      var anglediff = mouseLngLastState - angleActu;
      mouseLngLastState = angleActu;
      var angleDecal = new V2F(0,0);
      angleDecal.setAngle(- anglediff);
      //points.vAngle.setAngle(angleActu);
      points.vAngle.setAngle(points.vAngle.getAngle() - anglediff);
      points.vPos.applyRotationDecalageOnEnfants(angleDecal);
    }
  break; case ACTECHELLE:
    if(points.type == IMAGE || points.type == TEXTE || points.type == MARKER){
      var moveX = (leaflet.mousePos.x - mouseLngLastState);
      mouseLngLastState = leaflet.mousePos.x;
      if(moveX > 0.5) moveX = 0.5;
      if(moveX < -0.5) moveX = -0.5;
      //moveX = -moveX; //changement de sens du curseur
      moveX = moveX / 3; //reduction de sensibilité
      moveX = 1 + moveX; // entre 0.5 et 1.5 de variation
      points.vTaille.x *= moveX;
      points.vTaille.y *= moveX;
      points.vPos.applyScaleDecalageOnEnfants(moveX);
    }
  break;
  }
  //
  var liste = points.vPos.getData();
  await updatePosOnLLObj(points);
  if(liste != null) for(var i = 0; i < liste.length; i++){
    if(liste[i] != null) {
      if(liste[i].type == IMAGE && liste[i].coupleMapLink != null) await updatePosOnLLObj(mapListLeaflet.get(liste[i].coupleMapLink));
      await updatePosOnLLObj(liste[i]);
    }
  }
  mush.updatePos();
}
/**remplis la liste des lieux détectés sur google*/
async function remplissageLocations(){
  var donneesGoogleUnOnglet = await google.getContenuTableau("Locations");
  for(i = 6; i < donneesGoogleUnOnglet.length; i++) await mapListLocations.push(donneesGoogleUnOnglet[i]);
}
/**compare la liste des lieux de google et la liste actuelle de la carte (non leaflet), et vérifie pour chaque élément si il éxiste dans les 2 tableaux. incrémente 1 si c'est le cas*/
async function compareMapListLocations(){
  var cpt = 0;
  const promesses3 = mapListLocations.map(async (donnee) => {
    if(await findKeyWithChampValide("titre",donnee[0]) != null) cpt++;
  });
  await Promise.all(promesses3);
  return cpt;
}
/**fonction lente, cherche la clé de l'objet comprenant la valeur similaire pour un champ donné (retourne le dernier objet trouvé) dans la liste leaflet, retourne null si aucune clé*/
function findKeyWithChampValide(champ, valeur){
  for(const [key, dataaModif] of mapListLeaflet) if(champ in dataaModif) if(dataaModif[champ] == valeur) return key;
  return null;
}
//
async function traitement2(data){
  var retour = [];
  //var dataMipmap = null;
  //if(data.type == IMAGE) dataMipmap = await structuredClone(data);
  await generateObject(data);
  if(data.objet != null && (data.type == IMAGE || data.type == MARKER || data.type == TEXTE)){
      data.vPos.setTransfo(data.vAngle);
      data.objetVecteur = await generateObject(createDataObjet(POLYLIGNE));//ligne vecteur
      data.objetCarre = [await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE)),await generateObject(createDataObjet(POLYLIGNE))];
      data.objetVecteur.titre = data.titre + "[V]";
      data.objetCarre[0].titre = data.titre + "[VC1]";
      data.objetCarre[1].titre = data.titre + "[VC2]";
      data.objetCarre[2].titre = data.titre + "[VC3]";
      data.objetCarre[3].titre = data.titre + "[VC4]";
  }
  retour = data;
  return retour;
}
//
async function createMarker(nom, url){
  //console.log("create marker !");
  if(nom == null) throw new Error("nom nul");
  var data = createDataObjet(MARKER);
  data.vTaille.setXY(50,50);
  data.url = url;
  data.titre = nom;
  data.plan = 1000;
  data.vOrigine = null;
  data.vPos = new V2F(0,0);
  //
  var retour = await traitement2(data);
  if(retour == null) return;
  await mapListLeaflet.set(data.key, data);
  //await linkObjects(mapListLeaflet);
  await leaflet.removeAllObj(false);
  limiteMarkercpt = 0;
  await actualiseMap(mapListLeaflet, false);
  mush.insertObjetFocus(data.key);
  data.objet[0].on('click', function() {
    if(mode == MODE_INSERTION) {
      clearInterval(holdInterval);//stop le spam
      mode = MODE_LECTURE;
      btnEditor.setText("Editor (off)");
      btnEditor.active();
    }
  });
}
//
async function sauvegarder(){
  await fenetreModale.close();
  //await google.ecriture(mapListLeaflet)
  content = await google.generateList(mapListLeaflet);
  fenetreModale.openWithContent(content);
}
/**click détecté sur la carte*/
function click(e){
}
/**fonction executé toute les 100ms soit lors d'un appui long (ACTDEPLACEMENT, ACTROTATION, ACTECHELLE), soit lors du placement d'un objet depuis la liste (ACTDEPLACEMENT)*/
function spam(){
  if(mush.imageFocus()) dynamicTransformObj();
}
/**action de l'enfoncement*/
function down(e){
  firstAction = true;
  mush.mouseAppui(e);
}
//
async function downConfirmee(e){
  if(await mush.getCleImageFocus() != null && mode == MODE_LINK) {
    if(parentSelectOne == null) parentSelectOne = await mush.getCleImageFocus();
    else {
      if(parentSelectTwo != null) changeCarreColor(parentSelectTwo, 'red');
      parentSelectTwo = await mush.getCleImageFocus();
    }
    if(parentSelectTwo == parentSelectOne) {
      resetParentMode();
      return;
    }
    if(parentSelectOne != null){
      changeCarreColor(parentSelectOne, 'blue');
    }
    if(parentSelectTwo != null){
      var txt = mapListLeaflet.get(parentSelectOne).titre + "<br><center>TO</center>" + mapListLeaflet.get(parentSelectTwo).titre;
      if(mapListLeaflet.get(parentSelectTwo).vPos.detectCirculariteBool(mapListLeaflet.get(parentSelectOne).vPos)) txt += "<br><center>Circular detection</center>";
      else txt += `<br><center><a href="#" style="cursor: pointer; text-decoration: underline;" onclick="changeDependances()">[OK]</a></center>`;
      leaflet.popup(await mapListLeaflet.get(parentSelectTwo), txt);
      changeCarreColor(parentSelectTwo, 'yellow');
    }
    await actualiseMap(mapListLeaflet, false);
  }
}
async function changeDependances(){
  var obj1 = mapListLeaflet.get(parentSelectOne);
  var obj2 = mapListLeaflet.get(parentSelectTwo);
  var distanceX = obj2.vPos.xAbs() - obj1.vPos.xAbs();
  var distanceY = obj2.vPos.yAbs() - obj1.vPos.yAbs();
  //console.log("changedependance");
  obj2.vPos.po = obj1.vPos;
  obj2.vPos.setXY(distanceX,distanceY);
  //console.log(distanceX + ":" + distanceY);
  var vecteur = obj2.objetVecteur;
  vecteur.vPos = obj2.vPos;
  vecteur.vPos2 = obj2.vPos.getPo2();
  actualiseMap(mapListLeaflet, true);
  obj2.vOrigine = obj1.titre;
  resetParentMode();
  await actualiseMap(mapListLeaflet, false);
}
async function resetParentMode(){
  changeCarreColor(parentSelectOne, 'red');
  changeCarreColor(parentSelectTwo, 'red');
  parentSelectTwo = null;
  parentSelectOne = null;
  leaflet.closePopup();
}
function changeCarreColor(key, color){
  if(key == null) return;
  var carre1 = mapListLeaflet.get(key).objetCarre;
  if(carre1 == null) return;
  for(var i = 0; i < carre1.length; i++) carre1[i].objet[0].setStyle({color: color});
}
//
function up(e){if(mush.isActif()) mush.mouseRelache();}
//DATA//
/**génère une liste des données d'objet (dépend du type)*/
function createDataObjet(type){
  var data = {//toute les data possibles
    type: type,
    objet: null,
    objetVecteur: null,
    objetVecteurMipmap: null,
    objetCarre: null,
    actif: true,
    key: null,
    keymm: null,
    vOrigine: null,
    vPos: new V2F(0,0),
    vAngle: null,
    titre: null,
    url: null,
    urlmm: null,
    vPos1: new V2F(0,0),
    vPos2: new V2F(0,0),
    vPos3: new V2F(0,0),
    vPos4: new V2F(0,0),
    objetParent: null,
    auteur: null,
    site: null,
    coupleMapLink: null,
    mipmapActif: false,
    vImgTaille: null
  }
  switch (type) {
    case IMAGE:
      data.titre = "[image]";
      data.plan = 0;
      data.vTaille = new V2F(0,0);
      data.vImgTaille = new V2F(0,0);
    break; case TILEMAP_DEFAULT:
      data.titre = "[tilemap]";
    break; case MARKER:
      data.titre = "[marker]";
      data.plan = 10;
      data.vTaille = new V2F(50,50)
    break; case POLYLIGNE:
      data.titre = "[polyligne]";
      data.plan = 0;
      data.vPos2 = new V2F(1,1);
    break; case MARKER_STATIC_MS:
      data.titre = "[markerstaticms]";
      data.plan = 0;
      data.url = shroom;
      data.vTaille = new V2F(10,10)
    break; default:
    throw new Error("type non reconnu: ", type);
  }
  return data;
}
//
