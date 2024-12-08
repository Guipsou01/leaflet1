const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var sheetNameFocus;
var mousePos = new V2F(0,0);
var mouseLngLastState = 0;
var rgImgSelect = 0;
var customButton;
var btnCredits = document.getElementById("btnCreditsId");
var lienObj = document.getElementById("lienDynamique");
var btnSave = document.getElementById('btnSave');
var mapListLeaflet = new Map();//liste de tout les objets affichable dans leaflet (sans restrictions graphiques), y sont présente en plus: les mipmaps et les vecteurs statiques (data, obj, rang, isActif)
var mapListLocations = [];
var texteCharg = 0;
var contentCredits;
var vecteurVisu = false;
var limiteMarkercpt = 0;
const limiteMarker = 500; //limite d'affichage de markers en meme temps
const btnEditor = new hudButton1(document.getElementById("btnEditor"), document.getElementById("btnEditorContent"));
const btnVecteur = new hudButton2(document.getElementById("btnVecteur"), document.getElementById("btnVecteurContent"));
const btnListMaps = new hudList(document.getElementById('btnMaps'), document.getElementById('btnMapsList'));
const btnListLocations = new hudVirtualList(document.getElementById('btnLocations'), document.getElementById('btnLocationsContent'), document.getElementById('virtual-list'));
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
  disableAllbuttons();
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
  btnVecteur.setText("Parent (off)");
  btnListLocations.setName("Locations List");
  texteCharg = document.getElementById('texteInfo');
  //console.log("[initialisation] Démarrage");
  texteCharg.innerHTML = "Démarrage";
  //initialisation map leaflet
  //requette et enregistrement donnees google 
  //lienObj.href = lienTxt; // Assigner le lien à l'attribut href
  //lienObj.textContent = lienTxt; // Mettre à jour le texte affiché pour correspondre au lien
  btnEditor.setText("Editor (off)");
  btnListMaps.setText("Loading...");
  //console.log("[initialisation] Recération données onglets google (lent)...");
  texteCharg.innerHTML = "Recupération données onglets google...";
  var sheetNamesLocations = await google.getNomFeuilles();
  var sheetNames = await google.filterWithPrefixe("Leaflet_");
  if(sheetNames == null) sheetNameFocus = "Google table not found";
  else if(sheetNames.length == 0) sheetNameFocus = "No tab found";
  else sheetNameFocus = sheetNames[0];
  if(isTablContainElem(sheetNamesLocations,"Locations")) await remplissageLocations();
  await btnListLocations.createSelector();
  //console.log("[initialisation] Init sélecteur...");
  texteCharg.innerHTML = "Initialisation sélecteur...";
  await createSelectorMaps();
  resetAllMapContent();
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  try{
    disableAllbuttons();
    mapListLeaflet.clear();
    //desactivation bouton reset
    actionEnCours = ACTNULL;
    mode = MODE_LECTURE;
    btnEditor.setText("Editor (off)");
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
    console.log("a");
    await leaflet.removeAllObj(false);
    await actualiseMap(mapListLeaflet, true);
    console.log("[initialisation] Initialisation terminée...");
    texteCharg.innerHTML = "Initialisation terminée...";
    texteCharg.innerHTML = "";
    mush.active();
    leaflet.stats();
    checkDoublon();
    btnListLocations.setName("Locations List (" + compareMapListLocations() + " / " + mapListLocations.length + ")");
    btnListLocations.setListe(mapListLocations);
    btnListLocations.update();
    activeAllButtons();
  } catch (error) {console.error("Error:", error);}
}
/**Vérifie pour l'image qu'elle est tracable*/
async function calculTracabilite(data, limite) {
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
        if(limite){
          if(limiteMarkercpt <= limiteMarker) nvEtat = imagePosInScreenVar_;
          else nvEtat = false;
        }
        else nvEtat = imagePosInScreenVar_;
        //nvEtat = imagePosInScreenVar_;
        if(limite) if(nvEtat == true) limiteMarkercpt++;
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
        //nvEtat = vecteurVisu;
      break; default:
        console.error(`Type non géré: ${data.type}`);
      break;
    }
    data.actif = nvEtat;
    //if(data.objetVecteur != null) console.log(data.objetVecteur.actif);
    if(data.objetVecteur != null) data.objetVecteur.actif = (data.actif && vecteurVisu);
    if(data.objetCarre != null){
      data.objetCarre[0].actif = (data.actif && vecteurVisu);
      data.objetCarre[1].actif = (data.actif && vecteurVisu);
      data.objetCarre[2].actif = (data.actif && vecteurVisu);
      data.objetCarre[3].actif = (data.actif && vecteurVisu);
    }
  } catch (error) {console.error("Error:", error);}
}
//============LEAFLETLIST==============
//=========GOOGLE=========
/**supprime tout les éléments d'une carte, vérifie le tracage de nouveaux éléments et les insère dans la carte*/
async function actualiseMap(mapobj, limite){
  try{
    limiteMarkercpt = 0;
    if (!mapobj || typeof mapobj[Symbol.iterator] !== 'function') {
      console.log("mapobj :", mapobj);
      throw new TypeError("mapobj n'est pas un itérable valide.");
    }
    for (const [key, value] of mapobj) await updatePosOnLLObj(value);
    for (const [key, value] of mapobj) await calculTracabilite(value, limite);
    for (const [key, value] of mapobj) await leaflet.updateObj(value);
    //stats();
  } catch(error) {
    console.error("Erreur dans l'actualisation de map");
    throw error;
  }
}
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
          try{
            dataaModif.vPos.setPo(objetfocus.vPos);
          }
          catch(err) {
            if(objetfocus == null) console.error("Error: objet focus non défini pour " + dataaModif.titre);
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
async function disableAllbuttons(){
  btnSave.disabled = true;
  btnCredits.disabled = true;
  btnEditor.disable();
  btnVecteur.disable();
  btnListMaps.disable();
  btnListLocations.disable();
}
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
function checkDoublon() {
  const nameSet = new Set(); // Utilisé pour stocker les noms uniques
  for (const value of mapListLeaflet.values()) {
      if("titre" in value) if (nameSet.has(value.titre)) throw new Error("doublon trouvé pour l'objet: " + value.titre);
      nameSet.add(value.titre); // Ajoute le nom au Set
  }
}
//
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
      if(points.type == IMAGE || points.type == MARKER){
        if(points.vAngle != null) {
          var vFromMouseToObj = new V2F();
          vFromMouseToObj.setXY(mousePos.xAbs() - points.vPos.xAbs(), mousePos.yAbs() - points.vPos.yAbs())
          var angleActu = vFromMouseToObj.getAngle();
          var anglediff = mouseLngLastState - angleActu;
          mouseLngLastState = angleActu;
          var angleDecal = new V2F(0,0);
          angleDecal.setAngle(- anglediff);
          points.vPos.applyRotationDecalageOnEnfants(angleDecal);
        }
      }
    }
    else if(actionEnCours == ACTECHELLE){
      if(points.type == IMAGE || points.type == MARKER){
        if(points.vAngle != null){
          var moveX = (mousePos.x - mouseLngLastState);
          mouseLngLastState = mousePos.x;
          if(moveX > 0.5) moveX = 0.5;
          if(moveX < -0.5) moveX = -0.5;
          //moveX = -moveX; //changement de sens du curseur
          moveX = moveX / 3; //reduction de sensibilité
          moveX = 1 + moveX; // entre 0.5 et 1.5 de variation
          points.vPos.applyScaleDecalageOnEnfants(moveX);
        }
      }
    }
    if(points.type == IMAGE) mush.changePos(points.vPos,points.vPos1,points.vPos2,points.vPos3,points.vPos4);
    var liste = points.vPos.getData();
    await updatePosOnLLObj(points);
    if(liste != null) for(var i = 0; i < liste.length; i++){
      if(liste[i] != null) {
        if(liste[i].type == IMAGE && liste[i].coupleMapLink != null) await updatePosOnLLObj(mapListLeaflet.get(liste[i].coupleMapLink));
        await updatePosOnLLObj(liste[i]);
      }
    }
  }
}
/**remplis la liste des lieux détectés sur google*/
async function remplissageLocations(){
  var donneesGoogleUnOnglet = await google.getContenuTableau("Locations");
  for(i = 6; i < donneesGoogleUnOnglet.length; i++) await mapListLocations.push([donneesGoogleUnOnglet[i][1], donneesGoogleUnOnglet[i][5]]);
}
/**compare la liste des lieux de google et la liste actuelle de la carte (non leaflet), et vérifie pour chaque élément si il éxiste dans les 2 tableaux. incrémente 1 si c'est le cas*/
function compareMapListLocations(){
  var cpt = 0;
  for(i = 0; i < mapListLocations.length; i++) if(findKeyWithChampValide("titre",mapListLocations[i][0]) != null) cpt++;
  return cpt;
}
/**fonction lente, cherche la clé de l'objet comprenant la valeur similaire pour un champ donné (retourne le dernier objet trouvé) dans la liste leaflet, retourne null si aucune clé*/
function findKeyWithChampValide(champ, valeur){
  for (const [key, dataaModif] of mapListLeaflet) if(champ in dataaModif) if(dataaModif[champ] == valeur) return key;
  return null;
}
//
async function createMarker(nom, url){
  if(nom == null) throw new Error("nom nul");
  var data = createDataObjet(MARKER);
  data.vTaille.setXY(50,50);
  data.url = url;
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
  data.key = cleMarkerFocus;
  await mapListLeaflet.set(cleMarkerFocus, data);
  await linkObjects();
  await leaflet.removeAllObj(false);
  limiteMarkercpt = 0;
  await actualiseMap(mapListLeaflet, false);
  mush.insertObjetFocus(cleMarkerFocus);
  data.objet.on('click', function() {
      clearInterval(holdInterval);//stop le spam
      mode = MODE_LECTURE;
      btnEditor.setText("Editor (off)");
      btnEditor.active();
  });
}
async function sauvegarder(){
  await fenetreModale.close();
  content = await google.ecriture()
  fenetreModale.openWithContent(content);
}
function click(e){//click détecté sur la carte
  //console.log("Clique detecte", e.latlng);
  /*try{
    if(this.#disableClick) console.log("disableClick")
    if(!this.#disableClick && mush.isActif()){
      await mush.reset();
      var layerFin = await this.findObjFocus(await new V2F(e.latlng.lng, e.latlng.lat));//rang obj focus si objet a focus detecte au niveau de la souris
      if(layerFin != null) {
        await mush.insertObjetFocus(layerFin);
        //await leaflet.popup(null,"tutu");
        //await mush.action();
      }
    }
    else this.#disableClick = false;
  }
  catch (error) {throw error;}*/
}
function spam(){changePosObj();}
function down(e){mush.MouseAppui(e);}
function downConfirmee(e){}
function up(e){if(mush.isActif()) mush.mouseRelache();}
//DATA//
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
      key: null,
      //
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      titre: "[image]",
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
      type: type,
      actif: true,
      titre: "[tilemap]"
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
      key: null,
      actif: true,
      //
      vOrigine: null,
      objetVecteur: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      titre: "[marker]",
      //SPC
      vTaille: new V2F(50,50),
      url: null
    };
  }
  else if(type == POLYLIGNE){
    data = {
      type: type,
      objet: null,
      actif: true,
      plan: 0,
      key: null,
      //
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vPos1: new V2F(0,0),
      vPos2: new V2F(0,0),
      vPos3: new V2F(0,0),
      vPos4: new V2F(0,0),
      titre: "[polyligne]",
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
      actif: true,
      plan: 0,
      key: null,
      //
      vOrigine: null,
      vPos: new V2F(0,0),
      vAngle: null,
      vTaille: new V2F(10,10),
      titre: "[markerstaticms]",
      url: shroom
    }
  }
  return data;
}

//
