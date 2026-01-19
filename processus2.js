//FONCTIONS GENERALES EXECUTION 2
/**fonction d'initialisation principale du programme*/
const google = new GestionGoogle();
const leaflet = new LeafletMapBase();
const calqueVecteurs = leaflet.generateCalque(false);
const calqueObj = leaflet.generateCalque(true);
const calqueTileMap = leaflet.generateCalque(false);
const mush = new MushroomSelector();
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var mode = MODE_LECTURE;
var dataPack = null;
//
/**structure globale du code */
async function corps(){
  try{
    disableAllbuttons();
    //FICHIER REGROUPANT LES FONCTIONS GENERALES AU PROGRAMME
    google.setSpreadsheetId(ssId);
    google.setApiKey(apik);
    initHudPack();
    //console.log("[initialisation] Recération données onglets google (lent)...");
    mainTxt("Recovering Google tabs data...");
    await google.loadNomFeuilles();
    var sheetNames = await google.filterWithPrefixe("Leaflet_");//ne garde que les feuilles commencant par Leaflet_
    sheetNameFocus = (sheetNames == null) ? "Google table not found" : (sheetNameFocus = (sheetNames.length == 0) ? "No tab found" : sheetNames[0]);
    //
    mainTxt("Selector Initialisation...");
    await createSelectorMaps();
    mainTxt("Map generation...");
    resetAllMapContent();
  }
  catch(err) {console.error("Error: erreur d'initialisation: " + err);}
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  try{
    await disableAllbuttons();
    mode = MODE_LECTURE;
    //leaflet.clear();
    calqueVecteurs.clearLayers();
    calqueObj.clearLayers();
    calqueTileMap.clearLayers();
    btnEditor.setText("Editor (off)");
    //récupération des données de la feuille google visée
    if(await google.getNomFeuillesSansRequette() == null){await mainTxt("No Google Table found, check table id and permission");  return;}
    if(!await google.isListeFeuillesOk()) {await mainTxt("No tab found on the Google Table, check name and header (Leaflet_xxx needed)"); return;}
    await lecture();
    await mainTxt("");
    updateLog();
    await activeAllButtons();
  } catch (error) {console.error("Error:", error);}
}
/**lis le contenu de l'onglet visé et remplis la map en parametre*/
async function lecture(){
  try{
    leaflet.removeCalque(calqueVecteurs);
    await mainTxt("Google lists content filling: lecture tableau google...");
    const donneesGoogleUnOnglet = await google.getContenuTableau(sheetNameFocus);
    await mainTxt("Google lists content filling: recup data objets...");
    dataPack = await Promise.all(donneesGoogleUnOnglet.map(donnee => traitementLigneGoogleBrut(donnee)));//map de data
    await mainTxt("Google lists content filling: liaison...");
    for (const data of dataPack) {if(data != null) {linkDatas(data);}};
    await mainTxt("Google lists content filling: generation vecteurs...");
    for (data of dataPack) {
      if(data != null) if(data != TILEMAP_DEFAULT) {
        var dataVecteur = createDataObjet(POLYLIGNE);
        dataVecteur.vPos = data.vPos;
        dataVecteur.vPos2 = data.vPos.getPo2();
        data.objetVecteur = await generateObject(dataVecteur);//ligne vecteur
        data.objetVecteur._data = createDataObjet(POLYLIGNE);
        data.objetVecteur._data.titre = data.titre + "[V]";
        data.objetVecteur._data.vPos = dataVecteur.vPos;
        data.objetVecteur._data.vPos2 = dataVecteur.vPos2;
        data.objetVecteur.addTo(calqueVecteurs);
      }
    }
    btnVecteur.active();
    await mainTxt("Google lists content filling: generation objets...");
    await Promise.all(dataPack.map(async data => {
      if(data != null) if(data.type != TILEMAP_DEFAULT) {
        data = await traitementLigneGoogleC(data);
        if(data != null){
          var obj = await generateObject(data);
          obj._data = data;
          obj._data.vPos.setData(obj);
          if(obj == null) throw new Error("data nulle");
          if(obj == undefined) throw new Error("data undefined");
          //masquer pour desactiver
          obj.addTo(calqueObj);
          obj._data.objetCarre1 = await generateObject(createDataObjet(POLYLIGNE));
          obj._data.objetCarre2 = await generateObject(createDataObjet(POLYLIGNE));
          obj._data.objetCarre3 = await generateObject(createDataObjet(POLYLIGNE));
          obj._data.objetCarre4 = await generateObject(createDataObjet(POLYLIGNE));
          obj._data.objetCarre1._data = createDataObjet(POLYLIGNE);
          obj._data.objetCarre2._data = createDataObjet(POLYLIGNE);
          obj._data.objetCarre3._data = createDataObjet(POLYLIGNE);
          obj._data.objetCarre4._data = createDataObjet(POLYLIGNE);
          obj._data.objetCarre1._data.titre = obj._data.titre + "[VC1]";
          obj._data.objetCarre2._data.titre = obj._data.titre + "[VC2]";
          obj._data.objetCarre3._data.titre = obj._data.titre + "[VC3]";
          obj._data.objetCarre4._data.titre = obj._data.titre + "[VC4]";
          obj._data.objetCarre1.addTo(calqueVecteurs);
          obj._data.objetCarre2.addTo(calqueVecteurs);
          obj._data.objetCarre3.addTo(calqueVecteurs);
          obj._data.objetCarre4.addTo(calqueVecteurs);
          updatePosOnLLObj(obj);
          //fin masquage
        }
      }
      else {
        console.log("tilemap");
        var obj = await generateObject(data);
        obj._data = data;
        obj.addTo(calqueTileMap);
      }
      return data;
    }));
    await mainTxt("Google lists content filling: fin...");
    //leaflet.removeCalque(calqueVecteurs);
    console.log("trace leaflet:");
    console.log(calqueObj);
  } catch (error) {console.error("Error:", error);}
}
/**fonction inutilisée, recherche un objet dans la liste des objets par son titre*/
function findObjWithTitreValide(valeur){
  var retour = null;
  calqueObj.eachLayer(layer => {
    if(retour != null) return;
    if(layer._data.titre === valeur) retour = layer;
  });
  return retour;
}
function findDataWithTitreValide(valeur){
  for(const data of dataPack) {
    if(data != null) if(data.titre == valeur) return data;
  };
  return null;
}
//
function findLocation(txt){//trouve le lieu dans la map correspondant au texte demandé, et active son popup
  console.log(txt);
  var obj = findObjWithTitreValide(txt);
  if(obj != undefined) {
    leaflet.setZoomLvl(12);
    leaflet.popup(obj._data.vPos, affichepopupobjet(obj._data));
  }
  else console.log("obj non trouvee");
}
//
async function cliqueSurBtnVecteurLoc(){
    vecteurVisu = !vecteurVisu;
    if(vecteurVisu) {
        btnVecteur.setText("Parent (on)");
        leaflet.addCalque(calqueVecteurs);
    }
    else            {
        btnVecteur.setText("Parent (off)");
        leaflet.removeCalque(calqueVecteurs);
    }
}
calqueObj.on("mousedown", e => {
  if(!leaflet.isBig(e.layer)){
    leaflet.clickOnObject = true;
    leaflet.popup(e.layer._data.vPos, affichepopupobjet(e.layer._data));
    mush.setObjFocus(e.layer);
  }
});
async function mouseDownDetectedOutsideObj(){
    leaflet.closePopup();
    mush.disable();
}
/**retourne un string contenant la map en parametre en formatage google sheets*/
async function generateList(){
    var text = `<p style="font-size: 4px;"><table><tbody>-<br>`;
    calqueObj.eachLayer(layer => {text += google.generateLigneFromData(layer._data);});
    text += "</tbody></table><br>-</p>";
    return text;
}
function popupClosed(){mush.disable();}
/**action éxécuté une fois si changement de zoom ou fin de déplacement*/
async function mapMoveEnd(){
  const promises = [];
  calqueObj.eachLayer(obj => {
    if(!obj) return;
    if(obj._data.type == MARKER) promises.push(updatePosOnLLObj(obj));
  });
  await Promise.all(promises);
  if(await mush.hasObjFocus()) mush.updatePosIconsOnFocusedData();
  updateLog();
}
function mouseDownConfirmee(){actionChangementParente();}
function stats(){
  var nb2 = 0;
  var typeslist = ``;
  var typenb = 0;
  //types
  for(var i = 0; i < 7; i++){//pour chaque type d'objets possibles...
    typenb = 0;
    leaflet.getLLMap().eachLayer((layer) => {
      if(layer._data != null) if(layer._data.type == i) typenb++;
    });
    if(typenb > 0) typeslist += ` ` + typetotxt(i) + `:` + typenb;
  }
  //
  var log = 
  `nb elements on the map: ` + leaflet.getLLMapSize() + 
  `<br>types: ` + typeslist +
  `<br>zoom level: ` + leaflet.llZoomlvl;
  return log;
}
