//NULL:             donnees = null
//TILEMAP_DEFAULT:  donnees = null
//MARKER:           donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url,desc]
//IMAGE:            donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url,title,author,website,imageSize,imageL,isMipmap]
//TEXT:             donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[p1,p2,p3,p4],[url-canva,size,text,lOnLeaflet,angle]
//MARKERSTATIC:     donnees = [cmd,obj,isActif,plan],"",[vOrigine,vPos,vAngle],[l],[url]
/**fonction d'initialisation principale du programme */
async function corps(){
  disableAllbuttons();
  var ssId = '1m_iRhOs_1ii_1ECTX-Zuv9I0f6kMAE97ErYTy1ScP24'; //Mario Games / Maps / Locations
  //var ssId = '1ZAvRc7k-sphLJzj01WYmweG17yX49qNy542Kzkr01So'; //MARIO MAP TEST
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
  btnVecteur.setFunctionOnClick(cliqueSurBtnVecteur);
  btnListLocations.setText("Locations List");
  btnListLocations.setFunctionOnClickBtn(clickSurBtnLocations);
  btnListLocations.setFunctionOnClickListe(cliqueSurSlotListe1);
  btnListLocations.setFunctionOnClickExtFenetreWhenAffichee(cliqueOnExtFenetreToCloseHVL);
  btnListLocations.setFunctionOnRenderForEachSlot(renderForEachSlotLoc);
  btnListMaps.setFunctionOnClickListe(cliqueSurSlotListe2);
  texteCharg = document.getElementById('texteInfo');
  //console.log("[initialisation] Démarrage");
  texteCharg.innerHTML = "Démarrage";
  //initialisation map leaflet
  //requette et enregistrement donnees google 
  btnEditor.setText("Editor (off)");
  btnEditor.setFunctionOnClick(cliqueSurBtnEditor);
  btnListMaps.setText("Loading...");
  //console.log("[initialisation] Recération données onglets google (lent)...");
  texteCharg.innerHTML = "Recupération données onglets google...";
  var sheetNamesLocations = await google.getNomFeuilles();
  var sheetNames = await google.filterWithPrefixe("Leaflet_");//ne garde que les feuilles commencant par Leaflet_
  sheetNameFocus = (sheetNames == null) ? "Google table not found" : (sheetNameFocus = (sheetNames.length == 0) ? "No tab found" : sheetNames[0]);
  if(isTablContainElem(sheetNamesLocations,"Locations")) await remplissageLocations();
  //console.log("[initialisation] Init sélecteur...");
  mainTxt("Initialisation sélecteur...");
  await createSelectorMaps();
  resetAllMapContent();
}
/**réinitialise le contenu général de la carte + interface */
async function resetAllMapContent(){
  try{
    await disableAllbuttons();
    mapListLeaflet.clear();
    //desactivation bouton reset
    actionEnCours = ACTNULL;
    mode = MODE_LECTURE;
    btnEditor.setText("Editor (off)");
    //récupération des données de la feuille google visée
    await mush.reset();
    if(await google.getNomFeuillesSansRequette() == null){
      await mainTxt("No Google Table found, check table id and permission");
      return;
    }
    if(!await google.isListeFeuillesOk()) {
      await mainTxt("No tab found on the Google Table, check name and header (Leaflet_xxx needed)");
      return;
    }
    await mainTxt("Suppression de tous les objets de la carte...");
    await leaflet.removeAllObj(true);
    await mainTxt("Suppression du contenu des listes Leaflet...");
    objListLeaflet = [];
    await mainTxt("Remplissage du contenu des listes Google...");
    await google.lecture(mapListLeaflet);
    //traceListeLeaflet();
    await mainTxt("Initialisation des données du Mushroom selector...");
    await mush.init();
    await mainTxt("Actualisation des données de la carte...");
    await linkObjects(mapListLeaflet);
    await mainTxt("Suppression du contenu des listes Google...");
    await leaflet.removeAllObj(false);
    await actualiseMap(mapListLeaflet, true);
    await mainTxt("Initialisation terminée...");
    await mainTxt("");
    await mush.active();
    //leaflet.stats();
    await checkDoublon(mapListLeaflet);
    //btnListLocations.setName("Locations List (" + await compareMapListLocations() + " / " + mapListLocations.length + ")");
    btnListLocations.setListe(mapListLocations,1);
    activeAllButtons();
  } catch (error) {console.error("Error:", error);}
}
