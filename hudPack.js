//INTERFACE, PARTIE OBJET COMMUNE
var texteCharg = 0;
var logCharg = 0;
var btnCredits = document.getElementById("btnCreditsId");
var btnSave = document.getElementById('btnSave');
var actionEnCours = null;
const btnEditor = new hudButton1(document.getElementById("btnEditor"), document.getElementById("btnEditorContent"));
const btnVecteur = new hudButton1(document.getElementById("btnVecteur"), document.getElementById("btnVecteurContent"));
const btnListMaps = new hudList(document.getElementById('btnMaps'), document.getElementById('btnMapsList'), false);
const btnListLocations = new hudList(document.getElementById('btnLocations'), document.getElementById('btnLocationsList'), true);
const fenetreModale = new FenetreModale(document.getElementById('fenetreCredits-content'), document.getElementsByClassName("croixCreditsId")[0], document.getElementById("fenetreCreditsId"));
var contentCredits =  `<p><h3>Sources</h3>
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
var contentSave = `<h3 style="text-align: center;">Attention</h3>
<p style="text-align: center;">Sauvegarder la page crééra ou écrasera un onglet 'OUTPUT' sur la fiche Google Sheets.<br></p>
<p style="text-align: center;"><a href="#" style="cursor: pointer; text-decoration: underline;" onclick="sauvegarder()">Sauvegarder</a></p><br>`;
//
const input = document.getElementById("champRecherche");

input.addEventListener("input", () => {});//actu a chaque action sur btn recherche

//actu quand appui sur entree sur btn recherche
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        findLocation(input.value);
        input.blur(); //enlève le focus
    }
});
/**Initialisation sélecteur de maps et remplissage de la liste des maps*/
async function createSelectorMaps(){
  btnListMaps.setText(sheetNameFocus);
  if(google.isListeFeuillesOk()) {
    tableauFeuilles = await google.getNomFeuillesSansRequette();
    btnListMaps.setListe(tableauFeuilles);
  }
}
/**clique a l'exterieur de la liste pour fermer la liste des locations*/
const cliqueOnExtFenetreToCloseHVL = () => {
  if(mode != MODE_INSERTION) mush.active();
}
/**appui sur le bouton editeur*/
const cliqueSurBtnEditor = () => {
  switch (mode) {
           case MODE_LECTURE:     mode = MODE_DEPLACEMENT;  btnEditor.setText("Editor (move)");
    break; case MODE_DEPLACEMENT: mode = MODE_ROTATION;     btnEditor.setText("Editor (rotation)");
    break; case MODE_ROTATION:    mode = MODE_ECHELLE;      btnEditor.setText("Editor (scale)");
    break; case MODE_ECHELLE:     mode = MODE_LINK;         btnEditor.setText("Editor (parent)");
    break; case MODE_LINK:        mode = MODE_LECTURE;      btnEditor.setText("Editor (off)");
    break; default: throw new Error("Etat non compris: " + mode);
  }
  actionWhenBtnEditorChange();
}
const clickSurBtnLocations = () => {
  mush.reset();
  mush.disable();
}
/**appui sur le bouton vecteur*/
const cliqueSurBtnVecteur = () => {
  cliqueSurBtnVecteurLoc();
}
const cliqueSurSlotListe2 = (option, id, item) => {
  //event.preventDefault(); //Empêche le comportement par défaut du lien
  btnListMaps.setText(option);
  if(typeof sheetNameFocus !== 'undefined') sheetNameFocus = option;
  resetAllMapContent();
  //this.#fermerListe();
};
/**Desactive l'appui sur tout les boutons*/
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
  //btnListLocations.active();
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
/**action sur tout les boutons de la liste a chaque refresh*/
const renderForEachSlotLoc = (ligneFocus, btnHTML) => {
  if(findKeyWithChampValide("titre",btnHTML.textContent) != null) btnHTML.disabled = true;
}
function mouseMoveDetectedHud(){
  const texte = document.getElementById('texteCurseur');
  //maj du texte
  texte.innerHTML = `${leaflet.mousePos.x.toFixed(3)} : ${leaflet.mousePos.y.toFixed(3)}`;
  texte.style.color = 'white';
  texte.style.left = leaflet.mousePosOE.x + 20 + 'px';//position du texte
  texte.style.top = leaflet.mousePosOE.y - 10 + 'px';
}
function initHudPack(){
    btnVecteur.setText("Parent (off)");
    btnVecteur.setFunctionOnClick(cliqueSurBtnVecteur);
    btnListLocations.setText("Locations List");
    btnListLocations.setFunctionOnClickBtn(clickSurBtnLocations);
    btnListLocations.setFunctionOnClickListe(cliqueSurSlotListe1);
    btnListLocations.setFunctionOnClickExtFenetreWhenAffichee(cliqueOnExtFenetreToCloseHVL);
    btnListLocations.setFunctionOnRenderForEachSlot(renderForEachSlotLoc);
    btnListMaps.setFunctionOnClickListe(cliqueSurSlotListe2);
    btnListMaps.setText("Loading...");
    btnEditor.setText("Editor (off)");
    btnEditor.setFunctionOnClick(cliqueSurBtnEditor);
    texteCharg = document.getElementById('texteInfo');
    logCharg = document.getElementById('log');
    texteCharg.innerHTML = "Startup";
    logCharg.innerHTML = "*";
}
/**change le titre*/
async function mainTxt(txt){
  texteCharg.innerHTML = txt;
  await refreshEcran();
}
const cliqueSurSlotListe1 = (liste, id, item) => {
  /*//item.disabled = true;
  disableAllbuttons();
  mode = MODE_INSERTION;
  btnEditor.setText("Insertion");
  //btnEditor.disable();
  //creation objet
  createMarker((liste[1]), (liste[5]));
  actionEnCours = ACTDEPLACEMENT;
  //lancement boucle d'insertion
  holdInterval = setInterval(() => {spam();}, 10);//verifie toute les 100ms
  //mush.active();*/
};
/**met à jour l'affichage du texte log*/
function updateLog(txt){
  try{
  logCharg.innerHTML = txt + `<br>` + stats();
  } catch (error) {console.error("Error:", error);}
}
/*async function createMarker(nom, url){
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
  await actualiseMap(mapListLeaflet, false);
  mush.insertObjetFocus(data.key);
  data.objet[0].on('click', function() {
    if(mode == MODE_INSERTION) {
      clearInterval(holdInterval);//stop le spam
      mode = MODE_LECTURE;
      btnEditor.setText("Editor (off)");
      activeAllButtons();
    }
  });
}*/
