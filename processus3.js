//FONCTIONS GENERALES EXECUTION 3
/**fonction d'initialisation principale du programme*/
const unfound_img = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4fqKc0vxzBaLA0Vy9Edx9TIKzaCHxt_vHhImlsbNBeKkpZdu_nfYCLivgQSSOut8jB9c&usqp=CAU';
var mode = MODE_LECTURE;
const google = new GestionGoogle();
const leaflet = new LeafletMapBase();
const mush = new MushroomSelector();
const calqueVecteurs = leaflet.generateCalque(false);
const calqueTileMap = leaflet.generateCalque(false);
const calqueDetails = leaflet.generateCalque(true);
const calqueObjToujoursActif = leaflet.generateCalque(true);
const toutcalques = L.layerGroup([calqueObjToujoursActif, calqueDetails]);
//
/**structure globale du code */
async function corps(){
  try{
    leaflet.gestionMipmapViaChangementURL = true;
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
    calqueTileMap.clearLayers();
    leaflet.addCalque(toutcalques);
    btnEditor.setText("Editor (off)");
    //récupération des données de la feuille google visée
    if(await google.getNomFeuillesSansRequette() == null){await mainTxt("No Google Table found, check table id and permission");  return;}
    if(!await google.isListeFeuillesOk()) {await mainTxt("No tab found on the Google Table, check name and header (Leaflet_xxx needed)"); return;}
    //
    //await lecture();
    var dataPack = null;
    leaflet.removeCalque(calqueVecteurs);
    await mainTxt("Google lists content filling: reading google tab...");
    const donneesGoogleUnOnglet = await google.getContenuTableau(sheetNameFocus);
    await mainTxt("Google lists content filling: recieving data objects...");
    dataPack = await Promise.all(donneesGoogleUnOnglet.map(donnee => traitementLigneGoogleBrut(donnee)));//map de data
    await mainTxt("Google lists content filling: linking...");
    for(const data of dataPack) {if(data != null) {linkDatas(data, dataPack);}};
    await mainTxt("Google lists content filling: vectors generation...");
    for(data of dataPack) {
      if(data != null) if(data != TILEMAP_DEFAULT) {
        var dataVecteur = createDataObjet(POLYLIGNE);
        dataVecteur.vPos = data.vPos;
        dataVecteur.vPos2 = data.vPos.getPo2();
        data.objetVecteur = await generateObject(dataVecteur);//ligne vecteur
        data.objetVecteur._data.titre = data.titre + "[V]";
        data.objetVecteur._data.vPos = dataVecteur.vPos;
        data.objetVecteur._data.vPos2 = dataVecteur.vPos2;
        data.objetVecteur.addTo(calqueVecteurs);
      }
    }
    btnVecteur.active();
    await mainTxt("Google lists content filling: object generation...");
    await Promise.all(dataPack.map(async data => {
      if(data != null) if(data.type != TILEMAP_DEFAULT) {
        data = await traitementLigneGoogleC(data);
        if(data != null){
          var obj = await generateObject(data);
          obj._data.vPos.setData(obj);
          if(obj == null) throw new Error("data nulle");
          if(obj == undefined) throw new Error("data undefined");
          obj._data.objetCarre1 = await generateObject(createDataObjet(POLYLIGNE)); obj._data.objetCarre1._data.titre = obj._data.titre + "[VC1]";  //obj._data.objetCarre1.addTo(calqueVecteurs);
          obj._data.objetCarre2 = await generateObject(createDataObjet(POLYLIGNE)); obj._data.objetCarre2._data.titre = obj._data.titre + "[VC2]";  //obj._data.objetCarre2.addTo(calqueVecteurs);
          obj._data.objetCarre3 = await generateObject(createDataObjet(POLYLIGNE)); obj._data.objetCarre3._data.titre = obj._data.titre + "[VC3]";  //obj._data.objetCarre3.addTo(calqueVecteurs);
          obj._data.objetCarre4 = await generateObject(createDataObjet(POLYLIGNE)); obj._data.objetCarre4._data.titre = obj._data.titre + "[VC4]";  //obj._data.objetCarre4.addTo(calqueVecteurs);
          updatePosOnLLObj(obj);
          if(obj._data.type == MARKER){
            if(obj._data.lod == "Main World"){
              obj.addTo(calqueObjToujoursActif);
            }
            //else if(obj._data.lod == "World"){
              //obj.addTo(calqueObjToujoursActif);
            //}
            else if(obj._data.lod == "Sports"){}
            else{}
          }
          else if(obj._data.type == IMAGE || TEXTE){
              obj.addTo(calqueObjToujoursActif);
          }
          //fin masquage
        }
      }
      else if(data.type == TILEMAP_DEFAULT){
        var obj = await generateObject(data);
        obj._data = data;
        obj.addTo(calqueTileMap);
      }
      return data;
    }));
    await mainTxt("Google lists content filling: end...");
    //leaflet.removeCalque(calqueVecteurs);
    //console.log("trace leaflet:");
    //
    updateLog();
    await activeAllButtons();
    await mainTxt("");
  } catch (error) {console.error("Error:", error);}
}
/**detecte un appui long, ne s'execute qu'une fois par appui*/
function mouseDownConfirmee(){
  actionChangementParente();
}
//
async function mouseDownDetectedOutsideObj(){
    leaflet.closePopup();
    mush.disable();
}
/**affiche le nb d'éléments présents dans la map leaflet */
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
/**action éxécuté une fois si changement de zoom ou fin de déplacement*/
async function mapMoveEnd(){
  const promises = [];
  /*calqueDetails.eachLayer(obj => {
    if(!obj) return;
    if(obj._data.type == MARKER) promises.push(updatePosOnLLObj(obj));
  });
  calqueObjToujoursActif.eachLayer(obj => {
    if(!obj) return;
    if(obj._data.type == MARKER) promises.push(updatePosOnLLObj(obj));
  });
  await Promise.all(promises);*/
  for (const obj of calqueObjToujoursActif.getLayers()) {
    if (!obj) continue;
    if (obj._data.type !== IMAGE) continue;
    await changeUrlSiMM(obj);
  }

  if(await mush.hasObjFocus()) mush.updatePosIconsOnFocusedData();
  updateLog();
}
/**trouve le lieu dans la map correspondant au texte demandé, et active son popup*/
function findLocation(txt){
  console.log(txt);
  var obj = findObjWithTitreValide(txt);
  if(obj != undefined) {
    leaflet.setZoomLvl(12);
    var txtaffichable = affichepopupobjet(obj._data);
    if(txtaffichable != null) {
        leaflet.popup(obj._data.vPos, txtaffichable);
        traceEnfantsOnConsole(obj._data);
    }
    else console.log("initialisation d'objets non terminée, impossible d'interagir");
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
calqueObjToujoursActif.on("mousedown", e => {
  if(!leaflet.isBig(e.layer)){
    leaflet.clickOnObject = true;
    var txtaffichee = affichepopupobjet(e.layer._data);
    if(txtaffichee != null){
        leaflet.popup(e.layer._data.vPos, txtaffichee + `
        <div style='max-width:none; text-align:center;'>
            <br><span id="btn-dev" style="cursor:pointer; color:blue;">Show more</span>
        </div>
        `);
        setTimeout(() => {
            const btn = document.getElementById("btn-dev");
            if (btn) {
                btn.addEventListener("click", () => {
                    devoilerDetails(e.layer._data);
                });
            }
        }, 0);
        mush.setObjFocus(e.layer);
    }
    else console.log("initialisation d'objets non terminée, impossible d'interagir");
  }
});
calqueDetails.on("mousedown", e => {
  if(!leaflet.isBig(e.layer)){
    leaflet.clickOnObject = true;
    var txtaffichee = affichepopupobjet(e.layer._data);
    if(txtaffichee != null){
        leaflet.popup(e.layer._data.vPos, txtaffichee + `
        <div style='max-width:none; text-align:center;'>
            <br><span id="btn-dev" style="cursor:pointer; color:blue;">developper</span>
        </div>
        `);
        setTimeout(() => {
            const btn = document.getElementById("btn-dev");
            if (btn) {
                btn.addEventListener("click", () => {
                    devoilerDetails(e.layer._data);
                });
            }
        }, 0);
        mush.setObjFocus(e.layer);
    }
    else console.log("initialisation d'objets non terminée, impossible d'interagir");
  }
});

function devoilerDetails(data) {
    calqueDetails.clearLayers();
  //console.log("Tu as cliqué pour développer le lieu " + data.titre);
  //console.log(data.vPos);
  var lst = data.vPos.getDataEnfants();
  //console.log(lst.length + " enfants trouvés");
  for(var i = 0; i < lst.length; i++){
    //console.log(lst[i]);
    //obj.addTo(calqueDetails);
    //console.log(lst[i]._data.vPos.getData());// calqueDetails
    if(lst[i]._data.type == MARKER && lst[i]._data.lod != "Main World") lst[i]._data.vPos.getData().addTo(calqueDetails);
  }
  leaflet.closePopup();
}
////

////
/**Affiche tout les enfants d'une data sous forme d'arborescence texte dans la console*/
/*async function traceEnfantsOnConsole(data){
  var vPosBase = data.vPos;
  var txt = "---\n";
  txt += vPosBase.getData()._data.titre + "\n";
  txt += vPosBase.getDataEnfantsArboToTxt("","") + "\n";
  txt += "---\n";
  console.log(txt);
}
////*/

leaflet.getLLMap().on('zoomend', updateLayers);
async function updateLayers(){
}

/**retourne un string contenant la map en parametre en formatage google sheets*/
async function generateList(){
    var text = `<p style="font-size: 4px;"><table><tbody>-<br>`;
    toutcalques.eachLayer(layer => {text += google.generateLigneFromData(layer._data);});
    text += "</tbody></table><br>-</p>";
    return text;
}
function popupClosed(){
  mush.disable();
}
